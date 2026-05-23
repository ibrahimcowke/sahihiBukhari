import type { Hadith } from './types';

const API_KEY = '$2y$10$hfYJl0B1y725HXIcRj21DX4g4ytbGREpRFcjqX3ltCFKQWXsP3sS';
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
          return [];
        }
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();

      if (data.hadiths && data.hadiths.data && Array.isArray(data.hadiths.data)) {
        return data.hadiths.data.map((h: ApiHadith) => {
          const chId = h.chapterId?.toString();
          const activeChapter = chId ? chapterMap.get(chId) : undefined;
          return this.mapApiHadith(h, activeChapter);
        });
      }
      return [];
    } catch (error) {
      console.error(`Failed to search hadiths for query "${query}":`, error);
      return [];
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
