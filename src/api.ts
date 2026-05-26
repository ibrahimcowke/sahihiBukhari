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

// Helper to calculate Levenshtein distance between two words
function getLevenshteinDistance(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  const dp = new Array(len2 + 1);
  for (let j = 0; j <= len2; j++) dp[j] = j;

  for (let i = 1; i <= len1; i++) {
    let prev = i;
    for (let j = 1; j <= len2; j++) {
      const temp = dp[j];
      if (s1[i - 1] === s2[j - 1]) {
        dp[j] = dp[j - 1]; // no change
      } else {
        dp[j] = Math.min(
          dp[j] + 1, // deletion
          prev + 1,  // insertion
          dp[j - 1] + 1 // substitution
        );
      }
      dp[j - 1] = prev;
      prev = temp;
    }
    dp[len2] = prev;
  }
  return dp[len2];
}

// Check if two words are a fuzzy match
function isFuzzyWordMatch(word1: string, word2: string): boolean {
  if (word1 === word2) return true;
  
  // Calculate threshold: 30% of the longer word length, max 2 edits
  const maxLen = Math.max(word1.length, word2.length);
  if (maxLen <= 2) return word1 === word2;
  
  const threshold = maxLen <= 4 ? 1 : 2;
  return getLevenshteinDistance(word1, word2) <= threshold;
}

interface ScoredHadith {
  hadith: Hadith;
  score: number;
}

// Search locally using tokenization, fuzzy checks, and relevance scoring
export function searchLocalPool(query: string): Hadith[] {
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return [];

  const isArabic = /[\u0600-\u06FF]/.test(cleanQuery);
  const normQuery = normalizeArabic(cleanQuery);
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 1);

  const pool = getLocalSearchPool();
  const scoredResults: ScoredHadith[] = [];

  for (const h of pool) {
    let score = 0;
    
    // Normalizations for matching
    const arabicText = h.arabic || '';
    const translationText = h.translation || '';
    const normArabic = normalizeArabic(arabicText).toLowerCase();
    const normTranslation = translationText.toLowerCase();
    const normKitab = (h.kitab || '').toLowerCase();
    const normKitabArabic = normalizeArabic(h.kitabArabic || '').toLowerCase();
    const normBab = (h.bab || '').toLowerCase();
    const normBabArabic = normalizeArabic(h.babArabic || '').toLowerCase();
    const normNarrator = (h.englishNarrator || '').toLowerCase();

    // 1. Exact phrase matches (highest points)
    if (isArabic) {
      if (normArabic.includes(normQuery)) {
        score += 150;
      } else if (normKitabArabic.includes(normQuery) || normBabArabic.includes(normQuery)) {
        score += 100;
      }
    } else {
      if (normTranslation.includes(normQuery)) {
        score += 150;
      } else if (normKitab.includes(normQuery) || normBab.includes(normQuery) || normNarrator.includes(normQuery)) {
        score += 100;
      }
    }

    // 2. Token-level matching (exact and close/fuzzy matches)
    if (queryTokens.length > 0) {
      let matchedTokensCount = 0;
      
      for (const qToken of queryTokens) {
        let tokenMatched = false;
        
        if (isArabic) {
          // Arabic token matching (substring match)
          if (normArabic.includes(qToken) || normKitabArabic.includes(qToken) || normBabArabic.includes(qToken)) {
            score += 30;
            tokenMatched = true;
          }
        } else {
          // English token matching
          // Direct substring
          if (normTranslation.includes(qToken) || normKitab.includes(qToken) || normBab.includes(qToken) || normNarrator.includes(qToken)) {
            score += 30;
            tokenMatched = true;
          } else {
            // Fuzzy word match on English translation words
            const targetWords = normTranslation.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 1);
            for (const tWord of targetWords) {
              if (isFuzzyWordMatch(qToken, tWord)) {
                score += 15; // Typo match
                tokenMatched = true;
                break;
              }
            }
          }
        }
        
        if (tokenMatched) matchedTokensCount++;
      }
      
      // Bonus if ALL query tokens matched
      if (matchedTokensCount === queryTokens.length) {
        score += 50;
      }
    }

    if (score > 0) {
      scoredResults.push({ hadith: h, score });
    }
  }

  // Sort by score in descending order
  scoredResults.sort((a, b) => b.score - a.score);
  return scoredResults.map(r => r.hadith);
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

    let onlineResults: Hadith[] = [];
    try {
      // Search hadiths with paginate=50 using appropriate language param
      const url = `${BASE_URL}/hadiths?apiKey=${encodeURIComponent(API_KEY)}&book=sahih-bukhari&${searchParam}=${encodeURIComponent(query)}&paginate=50`;
      const res = await fetch(url);
      
      if (res.ok) {
        const data = await res.json();
        if (data.hadiths && data.hadiths.data && Array.isArray(data.hadiths.data)) {
          onlineResults = data.hadiths.data.map((h: ApiHadith) => {
            const chId = h.chapterId?.toString();
            const activeChapter = chId ? chapterMap.get(chId) : undefined;
            return this.mapApiHadith(h, activeChapter);
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch online hadiths for query "${query}":`, error);
    }

    // Run the local fuzzy search to capture cached items and handle typos
    const localResults = searchLocalPool(query);

    // Merge results (avoiding duplicates)
    const merged = [...onlineResults];
    const seenIds = new Set<number>(onlineResults.map(h => h.id));
    
    localResults.forEach(h => {
      if (!seenIds.has(h.id)) {
        merged.push(h);
        seenIds.add(h.id);
      }
    });

    // Score all merged results to rank them properly
    const cleanQuery = query.toLowerCase().trim();
    const normQuery = normalizeArabic(cleanQuery);
    const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 1);

    const rankedMerged = merged.map(h => {
      let score = 0;
      const normArabic = normalizeArabic(h.arabic || '').toLowerCase();
      const normTranslation = (h.translation || '').toLowerCase();
      const normKitab = (h.kitab || '').toLowerCase();
      const normKitabArabic = normalizeArabic(h.kitabArabic || '').toLowerCase();
      const normBab = (h.bab || '').toLowerCase();
      const normBabArabic = normalizeArabic(h.babArabic || '').toLowerCase();
      const normNarrator = (h.englishNarrator || '').toLowerCase();

      // Exact phrase match
      if (isArabic) {
        if (normArabic.includes(normQuery)) score += 150;
        else if (normKitabArabic.includes(normQuery) || normBabArabic.includes(normQuery)) score += 100;
      } else {
        if (normTranslation.includes(normQuery)) score += 150;
        else if (normKitab.includes(normQuery) || normBab.includes(normQuery) || normNarrator.includes(normQuery)) score += 100;
      }

      // Token match
      if (queryTokens.length > 0) {
        let matched = 0;
        for (const token of queryTokens) {
          let tokenMatched = false;
          if (isArabic) {
            if (normArabic.includes(token) || normKitabArabic.includes(token) || normBabArabic.includes(token)) {
              score += 30;
              tokenMatched = true;
            }
          } else {
            if (normTranslation.includes(token) || normKitab.includes(token) || normBab.includes(token) || normNarrator.includes(token)) {
              score += 30;
              tokenMatched = true;
            } else {
              const words = normTranslation.split(/[^a-zA-Z0-9]+/).filter(w => w.length > 1);
              for (const w of words) {
                if (isFuzzyWordMatch(token, w)) {
                  score += 15;
                  tokenMatched = true;
                  break;
                }
              }
            }
          }
          if (tokenMatched) matched++;
        }
        if (matched === queryTokens.length) score += 50;
      }
      
      return { hadith: h, score };
    });

    // Sort by relevance score in descending order
    rankedMerged.sort((a, b) => b.score - a.score);
    return rankedMerged.map(r => r.hadith);
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
