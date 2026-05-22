export interface Hadith {
  id: number;
  number: string;
  arabic: string;
  translation: string;
  kitab: string;
  bab: string;
}

export type Theme = 'night' | 'paper' | 'sepia';
