export interface Hadith {
  id: number;
  number: string;
  arabic: string;
  translation: string;
  kitab: string;
  bab: string;
  englishNarrator?: string;
  headingArabic?: string;
  headingEnglish?: string;
  chapterId?: number;
}

export type Theme = 'night' | 'paper' | 'sepia';

