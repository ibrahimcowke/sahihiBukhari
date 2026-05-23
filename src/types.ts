export interface Hadith {
  id: number;
  number: string;
  arabic: string;
  translation: string;
  kitab: string;
  bab: string;
  kitabArabic?: string;
  kitabEnglish?: string;
  babArabic?: string;
  babEnglish?: string;
  englishNarrator?: string;
  headingArabic?: string;
  headingEnglish?: string;
  chapterId?: number;
}

export type Theme = 'night' | 'paper' | 'sepia' | 'indigo' | 'emerald' | 'clay';
export type ArabicFont = 'Amiri' | 'Scheherazade New' | 'Lateef' | 'Cairo' | 'Tajawal';
export type DisplayMode = 'bilingual' | 'arabic-only' | 'translation-only';
export type TextAlignment = 'center' | 'right' | 'justify';
export type ReadingLayout = 'scroll' | 'page';
