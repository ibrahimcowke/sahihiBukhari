import { createClient } from '@supabase/supabase-js';
import type { Hadith } from './types';

export interface DbHadith {
  id: number;
  number: string;
  arabic: string;
  translation: string;
  kitab: string;
  bab: string;
  kitab_arabic?: string;
  kitab_english?: string;
  bab_arabic?: string;
  bab_english?: string;
  english_narrator?: string;
  heading_arabic?: string;
  heading_english?: string;
}


const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.info(`%c✅ Supabase connected → ${supabaseUrl}`, 'color: #2E9F85; font-weight: bold');
} else {
  console.warn('⚠️ Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Operating in offline/LocalStorage mode.');
}

// Local Storage Fallback Helpers
const LOCAL_BOOKMARKS_KEY = 'bukhari_bookmarks';
const LOCAL_NOTES_KEY = 'bukhari_notes';
const LOCAL_PROGRESS_KEY = 'bukhari_progress';
const LOCAL_CACHED_HADITHS_KEY = 'bukhari_cached_hadiths';

const getLocalBookmarks = (): number[] => {
  const data = localStorage.getItem(LOCAL_BOOKMARKS_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalBookmarks = (bookmarks: number[]) => {
  localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(bookmarks));
};

const getLocalNotes = (): Record<number, string> => {
  const data = localStorage.getItem(LOCAL_NOTES_KEY);
  return data ? JSON.parse(data) : {};
};

const saveLocalNotes = (notes: Record<number, string>) => {
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(notes));
};

const getLocalCachedHadiths = (): Record<number, Hadith> => {
  const data = localStorage.getItem(LOCAL_CACHED_HADITHS_KEY);
  return data ? JSON.parse(data) : {};
};

const saveLocalCachedHadith = (hadith: Hadith) => {
  try {
    const cached = getLocalCachedHadiths();
    cached[hadith.id] = hadith;
    localStorage.setItem(LOCAL_CACHED_HADITHS_KEY, JSON.stringify(cached));
  } catch (e) {
    console.error("Failed to save local cached hadith:", e);
  }
};

const resolveHadithRow = (val: unknown): Partial<DbHadith> | null | undefined => {
  if (Array.isArray(val)) {
    return val[0] as Partial<DbHadith>;
  }
  return val as Partial<DbHadith>;
};

// Database API with Local Fallbacks
// Helper to map DB row to Hadith type
export function mapDbHadith(row: Partial<DbHadith> | null | undefined): Hadith {
  if (!row) return row as unknown as Hadith;
  return {
    id: row.id || 0,
    number: row.number || '',
    arabic: row.arabic || '',
    translation: row.translation || '',
    kitab: row.kitab || '',
    bab: row.bab || '',
    kitabArabic: row.kitab_arabic || row.kitab,
    kitabEnglish: row.kitab_english || row.kitab,
    babArabic: row.bab_arabic || row.bab,
    babEnglish: row.bab_english || row.bab,
    englishNarrator: row.english_narrator || '',
    headingArabic: row.heading_arabic || '',
    headingEnglish: row.heading_english || ''
  };
}

// Database API with Local Fallbacks
export const db = {
  // Ensure hadith is cached in the DB to satisfy foreign keys
  async ensureHadithExists(hadith: Hadith): Promise<void> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('hadiths')
          .select('id')
          .eq('id', hadith.id)
          .maybeSingle();
        
        if (!error && !data) {
          // Doesn't exist, insert it
          const { error: insError } = await supabase
            .from('hadiths')
            .insert([{
              id: hadith.id,
              number: hadith.number,
              kitab: hadith.kitab,
              bab: hadith.bab,
              arabic: hadith.arabic,
              translation: hadith.translation,
              kitab_arabic: hadith.kitabArabic,
              kitab_english: hadith.kitabEnglish,
              bab_arabic: hadith.babArabic,
              bab_english: hadith.babEnglish
            }]);
          if (insError) {
            console.error("Failed to cache hadith in Supabase:", insError);
          }
        }
      } catch (err) {
        console.error("Failed to ensure hadith exists in database:", err);
      }
    }
    // Always save to LocalStorage cache
    saveLocalCachedHadith(hadith);
  },

  // Get Bookmarked Hadiths with their details
  async getBookmarkedHadiths(): Promise<Hadith[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('bookmarks')
          .select('hadith_id, hadiths(*)');
        
        if (!error && data) {
          return data
            .map(item => mapDbHadith(resolveHadithRow(item.hadiths)))
            .filter(Boolean) as Hadith[];
        }
        console.error("Error fetching bookmarked hadiths from Supabase:", error);
      } catch (err) {
        console.error("Supabase bookmarks catch:", err);
      }
    }
    const bookmarks = getLocalBookmarks();
    const cached = getLocalCachedHadiths();
    return bookmarks.map(id => cached[id]).filter(Boolean);
  },

  // Get Notes alongside their associated Hadith details
  async getNotesWithHadiths(): Promise<{hadith: Hadith, content: string}[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('content, hadiths(*)');
        
        if (!error && data) {
          return data
            .map(item => ({
              hadith: mapDbHadith(resolveHadithRow(item.hadiths)),
              content: item.content
            }))
            .filter(item => !!item.hadith);
        }
        console.error("Error fetching notes with hadiths from Supabase:", error);
      } catch (err) {
        console.error("Supabase notes catch:", err);
      }
    }
    const localNotes = getLocalNotes();
    const cached = getLocalCachedHadiths();
    return Object.entries(localNotes)
      .map(([idStr, content]) => {
        const id = parseInt(idStr, 10);
        return {
          hadith: cached[id],
          content
        };
      })
      .filter(item => !!item.hadith);
  },

  // Bookmarks IDs (for quick check in views)
  async getBookmarks(): Promise<number[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('hadith_id');
      
      if (!error && data) {
        return data.map(item => item.hadith_id);
      }
      console.error("Error fetching bookmarks from Supabase, falling back to local:", error);
    }
    return getLocalBookmarks();
  },

  async toggleBookmark(hadith: Hadith): Promise<boolean> {
    await this.ensureHadithExists(hadith);
    
    if (supabase) {
      // Check if bookmarked
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('hadith_id', hadith.id)
        .maybeSingle();

      if (!error) {
        if (data) {
          // Delete bookmark
          const { error: delError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('hadith_id', hadith.id);
          return !delError ? false : true;
        } else {
          // Add bookmark
          const { error: insError } = await supabase
            .from('bookmarks')
            .insert([{ hadith_id: hadith.id }]);
          return !insError ? true : false;
        }
      }
      console.error("Error toggling bookmark on Supabase, falling back to local:", error);
    }
    
    const local = getLocalBookmarks();
    const index = local.indexOf(hadith.id);
    let bookmarked = false;
    if (index > -1) {
      local.splice(index, 1);
    } else {
      local.push(hadith.id);
      bookmarked = true;
    }
    saveLocalBookmarks(local);
    return bookmarked;
  },

  // Notes Map (for quick checks)
  async getNotes(): Promise<Record<number, string>> {
    if (supabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('hadith_id, content');
      
      if (!error && data) {
        const notesMap: Record<number, string> = {};
        data.forEach(item => {
          notesMap[item.hadith_id] = item.content;
        });
        return notesMap;
      }
      console.error("Error fetching notes from Supabase, falling back to local:", error);
    }
    return getLocalNotes();
  },

  async saveNote(hadith: Hadith, content: string): Promise<boolean> {
    await this.ensureHadithExists(hadith);

    if (supabase) {
      // Upsert note
      const { data, error: selectError } = await supabase
        .from('notes')
        .select('id')
        .eq('hadith_id', hadith.id)
        .maybeSingle();

      if (!selectError) {
        if (data) {
          // Update
          const { error: updateError } = await supabase
            .from('notes')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('hadith_id', hadith.id);
          return !updateError;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('notes')
            .insert([{ hadith_id: hadith.id, content }]);
          return !insertError;
        }
      }
      console.error("Error saving note to Supabase, falling back to local:", selectError);
    }

    const local = getLocalNotes();
    local[hadith.id] = content;
    saveLocalNotes(local);
    return true;
  },

  async deleteNote(hadithId: number): Promise<boolean> {
    if (supabase) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('hadith_id', hadithId);
      return !error;
    }

    const local = getLocalNotes();
    delete local[hadithId];
    saveLocalNotes(local);
    return true;
  },

  // Reading Progress Hadith details lookup
  async getReadingProgressHadith(): Promise<Hadith | null> {
    let hadithId: number | null = null;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('reading_progress')
          .select('hadith_id')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          hadithId = data.hadith_id;
        }
      } catch (err) {
        console.error("Error fetching progress from Supabase:", err);
      }
    }
    
    if (!hadithId) {
      const progress = localStorage.getItem(LOCAL_PROGRESS_KEY);
      hadithId = progress ? parseInt(progress, 10) : null;
    }

    if (hadithId) {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from('hadiths')
            .select('*')
            .eq('id', hadithId)
            .maybeSingle();
          if (!error && data) {
            return mapDbHadith(data);
          }
        } catch (err) {
          console.error("Error fetching cached hadith for progress:", err);
        }
      }
      const cached = getLocalCachedHadiths();
      return cached[hadithId] || null;
    }
    return null;
  },

  async saveReadingProgress(hadith: Hadith): Promise<boolean> {
    await this.ensureHadithExists(hadith);

    if (supabase) {
      // We can insert/update the progress
      const { data, error: selectError } = await supabase
        .from('reading_progress')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (!selectError) {
        if (data) {
          // Update
          const { error: updateError } = await supabase
            .from('reading_progress')
            .update({ hadith_id: hadith.id, updated_at: new Date().toISOString() })
            .eq('id', data.id);
          return !updateError;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('reading_progress')
            .insert([{ hadith_id: hadith.id }]);
          return !insertError;
        }
      }
      console.error("Error saving reading progress to Supabase, falling back to local:", selectError);
    }

    localStorage.setItem(LOCAL_PROGRESS_KEY, hadith.id.toString());
    return true;
  }
};
