import type { Hadith } from './types';
import { bukhariData } from './data';

const API_KEY = '$2y$10$hfYJl0B1y725HXIcRj21DX4g4ytbGREpRFcjqX3ltCFKQWXsP3sS';

// Helper to normalize Arabic text (remove Tashkeel/diacritics, normalize letters)
function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    // Remove tashkeel (diacritics)
    .replace(/[\u064B-\u0652]/g, '')
    // Normalize Alef forms
    .replace(/[أإآا]/g, 'ا')
    // Normalize Teh Marbuta -> Heh
    .replace(/ة/g, 'ه')
    // Normalize Alef Maksura -> Yeh
    .replace(/ى/g, 'ي')
    // Remove tatweel (kashida)
    .replace(/\u0640/g, '');
}

// Smart query matcher that handles singular/plural endings in Arabic
function matchesArabicQuery(normText: string, normQuery: string, originalQuery: string): boolean {
  if (normText.includes(normQuery)) return true;
  
  // If original query ends with 'ة' or 'ه', also try matching with 'ات' (plural suffix)
  const cleanOriginal = originalQuery.trim();
  if (cleanOriginal.endsWith('ة') || cleanOriginal.endsWith('ه')) {
    const altQuery = normalizeArabic(cleanOriginal.slice(0, -1) + 'ات');
    if (normText.includes(altQuery)) return true;
  }
  
  // If original query ends with 'ات', also try matching with 'ه' / 'ة' (singular suffix)
  if (cleanOriginal.endsWith('ات')) {
    const altQuery = normalizeArabic(cleanOriginal.slice(0, -2) + 'ه');
    if (normText.includes(altQuery)) return true;
  }

  // Also try matching the core stem (without 'ال')
  if (cleanOriginal.startsWith('ال')) {
    const altQuery = normalizeArabic(cleanOriginal.slice(2));
    if (normText.includes(altQuery)) return true;
  }

  return false;
}

// Local search pool including static data and localStorage caches
function getLocalSearchPool(): Hadith[] {
  const pool: Hadith[] = [...bukhariData];
  const seenIds = new Set<number>(pool.map(h => h.id));

  // Add cached hadiths from bukhari_cached_hadiths
  try {
    const cachedData = localStorage.getItem('bukhari_cached_hadiths');
    if (cachedData) {
      const cached = JSON.parse(cachedData) as Record<number, Hadith>;
      Object.values(cached).forEach(h => {
        if (h && h.id && !seenIds.has(h.id)) {
          pool.push(h);
          seenIds.add(h.id);
        }
      });
    }
  } catch (e) {
    console.warn("Error reading cached hadiths for search pool:", e);
  }

  // Add hadiths from chapter caches
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('bukhari_hadiths_chapter_')) {
      try {
        const val = localStorage.getItem(key);
        if (val) {
          const list = JSON.parse(val) as Hadith[];
          list.forEach(h => {
            if (h && h.id && !seenIds.has(h.id)) {
              pool.push(h);
              seenIds.add(h.id);
            }
          });
        }
      } catch (e) {
        console.warn(`Error reading chapter cache ${key} for search pool:`, e);
      }
    }
  }

  return pool;
}

// Search locally using smart normalizations
function searchLocalPool(query: string): Hadith[] {
  const normQuery = normalizeArabic(query).toLowerCase().trim();
  if (!normQuery) return [];

  const pool = getLocalSearchPool();
  return pool.filter(h => {
    const normArabic = normalizeArabic(h.arabic).toLowerCase();
    const normTranslation = (h.translation || '').toLowerCase();
    const normKitab = (h.kitab || '').toLowerCase();
    const normKitabArabic = normalizeArabic(h.kitabArabic || '').toLowerCase();
    const normBab = (h.bab || '').toLowerCase();
    const normBabArabic = normalizeArabic(h.babArabic || '').toLowerCase();
    const normNarrator = (h.englishNarrator || '').toLowerCase();

    // Check query matches
    const queryInArabic = matchesArabicQuery(normArabic, normQuery, query) || 
                          matchesArabicQuery(normKitabArabic, normQuery, query) || 
                          matchesArabicQuery(normBabArabic, normQuery, query);
                          
    const queryInEnglish = normTranslation.includes(normQuery) || 
                           normKitab.includes(normQuery) || 
                           normBab.includes(normQuery) || 
                           normNarrator.includes(normQuery);

    return queryInArabic || queryInEnglish;
  });
}

const BASE_URL = 'https://hadithapi.com/public/api';

export interface Chapter {
  id: number;
  chapterNumber: string;
  chapterEnglish: string;
  chapterUrdu: string;
  chapterArabic: string;
  bookSlug: string;
}

export interface ApiHadith {
  id: number | string;
  hadithNumber?: string;
  hadithArabic?: string;
  hadithEnglish?: string;
  englishNarrator?: string;
  headingArabic?: string;
  headingEnglish?: string;
  chapterId?: number | string;
  chapter?: {
    chapterEnglish?: string;
    chapterArabic?: string;
  };
}


// Memory and LocalStorage cache for chapters
let cachedChapters: Chapter[] | null = null;
const cachedChapterHadiths: Record<number, Hadith[]> = {};


export const api = {
  getApiKey(): string {
    return API_KEY;
  },

  async fetchChapters(): Promise<Chapter[]> {
    if (cachedChapters) return cachedChapters;

    // Check LocalStorage
    const local = localStorage.getItem('bukhari_chapters_cache');
    if (local) {
      try {
        cachedChapters = JSON.parse(local);
        return cachedChapters!;
      } catch (e) {
        console.warn("Failed to parse cached chapters", e);
      }
    }

    try {
      const url = `${BASE_URL}/sahih-bukhari/chapters?apiKey=${encodeURIComponent(API_KEY)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (data.chapters && Array.isArray(data.chapters)) {
        const chaptersList = data.chapters as Chapter[];
        localStorage.setItem('bukhari_chapters_cache', JSON.stringify(chaptersList));
        cachedChapters = chaptersList;
        return chaptersList;
      }
      throw new Error("Invalid chapters format in API response");
    } catch (error) {
      console.error("Failed to fetch chapters from API:", error);
      throw error;
    }
  },

  async fetchHadithsByChapter(chapterId: number): Promise<Hadith[]> {
    if (cachedChapterHadiths[chapterId]) {
      return cachedChapterHadiths[chapterId];
    }

    const localKey = `bukhari_hadiths_chapter_${chapterId}`;
    const local = localStorage.getItem(localKey);
    if (local) {
      try {
        const list = JSON.parse(local) as Hadith[];
        cachedChapterHadiths[chapterId] = list;
        return list;
      } catch (e) {
        console.warn("Failed to parse cached hadiths from localStorage", e);
      }
    }

    const chapters = await this.fetchChapters();
    const chapterMap = new Map(chapters.map(c => [c.id.toString(), c]));
    const activeChapter = chapterMap.get(chapterId.toString());

    try {
      // Use paginate=500 to fetch all hadiths in the chapter in a single request (the largest chapter has under 400 hadiths)
      const url = `${BASE_URL}/hadiths?apiKey=${encodeURIComponent(API_KEY)}&book=sahih-bukhari&chapter=${chapterId}&paginate=500`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (data.hadiths && data.hadiths.data && Array.isArray(data.hadiths.data)) {
        const mapped = data.hadiths.data.map((h: ApiHadith) => this.mapApiHadith(h, activeChapter));
        try {
          localStorage.setItem(localKey, JSON.stringify(mapped));
        } catch (storageErr) {
          console.warn("Failed to save hadiths to localStorage (quota exceeded)", storageErr);
        }
        cachedChapterHadiths[chapterId] = mapped;
        return mapped;
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch hadiths for chapter ${chapterId}:`, error);
      throw error;
    }
  },

  async searchHadiths(query: string): Promise<Hadith[]> {
    if (!query || query.trim() === '') return [];
    
    const chapters = await this.fetchChapters();
    const chapterMap = new Map(chapters.map(c => [c.id.toString(), c]));

    const isArabic = /[\u0600-\u06FF]/.test(query);
    const searchParam = isArabic ? 'hadithArabic' : 'hadithEnglish';

    try {
      // Search hadiths with paginate=50 using appropriate language param
      const url = `${BASE_URL}/hadiths?apiKey=${encodeURIComponent(API_KEY)}&book=sahih-bukhari&${searchParam}=${encodeURIComponent(query)}&paginate=50`;
      const res = await fetch(url);
      
      if (!res.ok) {
        if (res.status === 404) {
          // Fallback to local search if online API returns 404
          return searchLocalPool(query);
        }
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();

      let onlineResults: Hadith[] = [];
      if (data.hadiths && data.hadiths.data && Array.isArray(data.hadiths.data)) {
        onlineResults = data.hadiths.data.map((h: ApiHadith) => {
          const chId = h.chapterId?.toString();
          const activeChapter = chId ? chapterMap.get(chId) : undefined;
          return this.mapApiHadith(h, activeChapter);
        });
      }

      // Merge online results with local search pool findings (ensuring no duplicates)
      const localResults = searchLocalPool(query);
      const merged = [...onlineResults];
      const seenIds = new Set<number>(onlineResults.map(h => h.id));
      
      localResults.forEach(h => {
        if (!seenIds.has(h.id)) {
          merged.push(h);
          seenIds.add(h.id);
        }
      });

      return merged;
    } catch (error) {
      console.error(`Failed to search hadiths for query "${query}":`, error);
      // Fallback to local search on network or parse error
      return searchLocalPool(query);
    }
  },

  mapApiHadith(h: ApiHadith, activeChapter?: Chapter): Hadith {
    // Determine the Book (Kitab) and Chapter Heading (Bab)
    const kitabName = activeChapter?.chapterEnglish || h.chapter?.chapterEnglish || 'Revelation';
    const babName = h.headingEnglish || activeChapter?.chapterEnglish || 'Revelation';
    
    const kitabArabicName = activeChapter?.chapterArabic || h.chapter?.chapterArabic || 'كتاب بدء الوحى';
    const babArabicName = h.headingArabic || activeChapter?.chapterArabic || 'باب بدء الوحى';

    return {
      id: Number(h.id),
      number: h.hadithNumber ? h.hadithNumber.trim() : String(h.id),
      arabic: h.hadithArabic || '',
      translation: h.hadithEnglish || '',
      kitab: kitabName,
      bab: babName,
      kitabArabic: kitabArabicName,
      kitabEnglish: kitabName,
      babArabic: babArabicName,
      babEnglish: babName,
      englishNarrator: h.englishNarrator || '',
      headingArabic: h.headingArabic || '',
      headingEnglish: h.headingEnglish || '',
      chapterId: activeChapter?.id || (h.chapterId ? Number(h.chapterId) : undefined)
    };
  }
};
