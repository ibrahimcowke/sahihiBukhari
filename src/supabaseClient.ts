import { createClient } from '@supabase/supabase-js';
import type { Hadith } from './types';
import { invalidateSearchPool } from './api';

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
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.info(`%c✅ Supabase connected → ${supabaseUrl}`, 'color: #2E9F85; font-weight: bold');
} else {
  console.warn('⚠️ Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY). Operating in offline/LocalStorage mode.');
}

// Local Storage Fallback Helpers
const LOCAL_BOOKMARKS_KEY = 'bukhari_bookmarks';
const LOCAL_NOTES_KEY = 'bukhari_notes';
const LOCAL_PROGRESS_KEY = 'bukhari_progress';
const LOCAL_CACHED_HADITHS_KEY = 'bukhari_cached_hadiths';
const LOCAL_USER_ID_KEY = 'bukhari_sync_user_id';

export interface UserProgressData {
  streak_count: number;
  last_read_date: string | null;
  daily_goal: number;
  read_hadiths: number[];
  read_history: Record<number, string>;
  settings: Record<string, any>;
}

// Generate or retrieve persistent user/device UUID
export function getOrInitUserId(): string {
  let id = localStorage.getItem(LOCAL_USER_ID_KEY);
  if (!id) {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      id = crypto.randomUUID();
    } else {
      // Fallback RFC4122 compliant UUID generator
      id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
    localStorage.setItem(LOCAL_USER_ID_KEY, id);
  }
  return id;
}

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
    invalidateSearchPool();
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

let isSchemaValid = true;

// Detect missing migration columns/tables and safely bypass sync to avoid data loss
function checkSchemaError(error: any) {
  if (error) {
    // Code 42703: undefined_column (e.g. user_id missing)
    // Code 42P01: undefined_table (relation does not exist)
    // Code PGRST205: Table not found in schema cache
    if (
      error.code === '42703' || 
      error.code === '42P01' || 
      error.code === 'PGRST205' || 
      (error.message && (
        error.message.includes('column "user_id" does not exist') ||
        error.message.includes('relation "public.user_progress" does not exist')
      ))
    ) {
      if (isSchemaValid) {
        console.warn("⚠️ Supabase schema mismatch detected. Please run the SQL migration script in your Supabase dashboard to enable cloud sync. Operating in resilient offline LocalStorage mode.");
        isSchemaValid = false;
      }
    }
  }
}

// Database API with Local Fallbacks and User Isolation
export const db = {
  // Check schema status
  getIsSchemaValid(): boolean {
    return isSchemaValid;
  },

  // Ensure hadith is cached in the DB to satisfy foreign keys
  async ensureHadithExists(hadith: Hadith): Promise<void> {
    if (supabase && isSchemaValid) {
      try {
        const { data, error } = await supabase
          .from('hadiths')
          .select('id')
          .eq('id', hadith.id)
          .maybeSingle();
        
        checkSchemaError(error);
        if (!error && !data && isSchemaValid) {
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
          checkSchemaError(insError);
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
    if (supabase && isSchemaValid) {
      try {
        const userId = getOrInitUserId();
        const { data, error } = await supabase
          .from('bookmarks')
          .select('hadith_id, hadiths(*)')
          .eq('user_id', userId);
        
        checkSchemaError(error);
        if (!error && data && isSchemaValid) {
          return data
            .map(item => mapDbHadith(resolveHadithRow(item.hadiths)))
            .filter(Boolean) as Hadith[];
        }
        console.error("Error fetching bookmarked hadiths from Supabase:", error);
      } catch (err) {
        console.error("Supabase bookmarks catch:", err);
      }
    }
    
    // Local fallback with DB cache queries for missing items
    const bookmarks = getLocalBookmarks();
    const cached = getLocalCachedHadiths();
    const result: Hadith[] = [];
    
    for (const id of bookmarks) {
      let hadith = cached[id];
      if (!hadith && supabase) {
        try {
          const { data } = await supabase
            .from('hadiths')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (data) {
            hadith = mapDbHadith(data);
            saveLocalCachedHadith(hadith);
          }
        } catch (e) {
          console.warn("Failed to fetch missing hadith details for bookmark:", e);
        }
      }
      if (hadith) {
        result.push(hadith);
      }
    }
    return result;
  },

  // Get Notes alongside their associated Hadith details
  async getNotesWithHadiths(): Promise<{hadith: Hadith, content: string}[]> {
    if (supabase && isSchemaValid) {
      try {
        const userId = getOrInitUserId();
        const { data, error } = await supabase
          .from('notes')
          .select('content, hadiths(*)')
          .eq('user_id', userId);
        
        checkSchemaError(error);
        if (!error && data && isSchemaValid) {
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
    
    // Local fallback with DB cache queries for missing items
    const localNotes = getLocalNotes();
    const cached = getLocalCachedHadiths();
    const result: {hadith: Hadith, content: string}[] = [];
    
    for (const [idStr, content] of Object.entries(localNotes)) {
      const id = parseInt(idStr, 10);
      let hadith = cached[id];
      if (!hadith && supabase) {
        try {
          const { data } = await supabase
            .from('hadiths')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          if (data) {
            hadith = mapDbHadith(data);
            saveLocalCachedHadith(hadith);
          }
        } catch (e) {
          console.warn("Failed to fetch missing hadith details for note:", e);
        }
      }
      
      if (hadith) {
        result.push({ hadith, content });
      }
    }
    return result;
  },

  // Bookmarks IDs (for quick check in views)
  async getBookmarks(): Promise<number[]> {
    if (supabase && isSchemaValid) {
      const userId = getOrInitUserId();
      const { data, error } = await supabase
        .from('bookmarks')
        .select('hadith_id')
        .eq('user_id', userId);
      
      checkSchemaError(error);
      if (!error && data && isSchemaValid) {
        return data.map(item => item.hadith_id);
      }
      console.error("Error fetching bookmarks from Supabase, falling back to local:", error);
    }
    return getLocalBookmarks();
  },

  async toggleBookmark(hadith: Hadith): Promise<boolean> {
    await this.ensureHadithExists(hadith);
    const local = getLocalBookmarks();
    const index = local.indexOf(hadith.id);
    let bookmarked = false;
    if (index > -1) {
      local.splice(index, 1);
    } else {
      local.push(hadith.id);
      bookmarked = true;
    }
    
    if (supabase && isSchemaValid) {
      const userId = getOrInitUserId();
      // Check if bookmarked
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('hadith_id', hadith.id)
        .eq('user_id', userId)
        .maybeSingle();

      checkSchemaError(error);
      if (!error && isSchemaValid) {
        if (data) {
          // Delete bookmark
          const { error: delError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('hadith_id', hadith.id)
            .eq('user_id', userId);
          checkSchemaError(delError);
          if (!delError && isSchemaValid) {
            saveLocalBookmarks(local);
            return false;
          }
        } else {
          // Add bookmark
          const { error: insError } = await supabase
            .from('bookmarks')
            .insert([{ user_id: userId, hadith_id: hadith.id }]);
          checkSchemaError(insError);
          if (!insError && isSchemaValid) {
            saveLocalBookmarks(local);
            return true;
          }
        }
      }
      console.error("Error toggling bookmark on Supabase, falling back to local:", error);
    }
    
    saveLocalBookmarks(local);
    return bookmarked;
  },

  // Notes Map (for quick checks)
  async getNotes(): Promise<Record<number, string>> {
    if (supabase && isSchemaValid) {
      const userId = getOrInitUserId();
      const { data, error } = await supabase
        .from('notes')
        .select('hadith_id, content')
        .eq('user_id', userId);
      
      checkSchemaError(error);
      if (!error && data && isSchemaValid) {
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
    const local = getLocalNotes();
    local[hadith.id] = content;

    if (supabase && isSchemaValid) {
      const userId = getOrInitUserId();
      // Upsert note
      const { data, error: selectError } = await supabase
        .from('notes')
        .select('id')
        .eq('hadith_id', hadith.id)
        .eq('user_id', userId)
        .maybeSingle();

      checkSchemaError(selectError);
      if (!selectError && isSchemaValid) {
        if (data) {
          // Update
          const { error: updateError } = await supabase
            .from('notes')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('hadith_id', hadith.id)
            .eq('user_id', userId);
          checkSchemaError(updateError);
          if (!updateError && isSchemaValid) {
            saveLocalNotes(local);
            return true;
          }
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('notes')
            .insert([{ user_id: userId, hadith_id: hadith.id, content }]);
          checkSchemaError(insertError);
          if (!insertError && isSchemaValid) {
            saveLocalNotes(local);
            return true;
          }
        }
      }
      console.error("Error saving note to Supabase, falling back to local:", selectError);
    }

    saveLocalNotes(local);
    return true;
  },

  async deleteNote(hadithId: number): Promise<boolean> {
    const local = getLocalNotes();
    delete local[hadithId];

    if (supabase && isSchemaValid) {
      const userId = getOrInitUserId();
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('hadith_id', hadithId)
        .eq('user_id', userId);
      checkSchemaError(error);
      if (!error && isSchemaValid) {
        saveLocalNotes(local);
        return true;
      }
    }

    saveLocalNotes(local);
    return true;
  },

  // Reading Progress Hadith details lookup
  async getReadingProgressHadith(): Promise<Hadith | null> {
    let hadithId: number | null = null;
    if (supabase && isSchemaValid) {
      try {
        const userId = getOrInitUserId();
        const { data, error } = await supabase
          .from('reading_progress')
          .select('hadith_id')
          .eq('user_id', userId)
          .maybeSingle();

        checkSchemaError(error);
        if (!error && data && isSchemaValid) {
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
      if (supabase && isSchemaValid) {
        try {
          const { data, error } = await supabase
            .from('hadiths')
            .select('*')
            .eq('id', hadithId)
            .maybeSingle();
          checkSchemaError(error);
          if (!error && data && isSchemaValid) {
            return mapDbHadith(data);
          }
        } catch (err) {
          console.error("Error fetching cached hadith for reading progress:", err);
        }
      }
      const cached = getLocalCachedHadiths();
      return cached[hadithId] || null;
    }
    return null;
  },

  async saveReadingProgress(hadith: Hadith): Promise<boolean> {
    await this.ensureHadithExists(hadith);
    localStorage.setItem(LOCAL_PROGRESS_KEY, hadith.id.toString());

    if (supabase && isSchemaValid) {
      const userId = getOrInitUserId();
      // We can insert/update the progress
      const { data, error: selectError } = await supabase
        .from('reading_progress')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      checkSchemaError(selectError);
      if (!selectError && isSchemaValid) {
        if (data) {
          // Update
          const { error: updateError } = await supabase
            .from('reading_progress')
            .update({ hadith_id: hadith.id, updated_at: new Date().toISOString() })
            .eq('id', data.id)
            .eq('user_id', userId);
          checkSchemaError(updateError);
          return !updateError && isSchemaValid;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('reading_progress')
            .insert([{ user_id: userId, hadith_id: hadith.id }]);
          checkSchemaError(insertError);
          return !insertError && isSchemaValid;
        }
      }
      console.error("Error saving reading progress to Supabase, falling back to local:", selectError);
    }

    return true;
  },

  // User Progress: Streaks, Goals, and Settings
  async getUserProgress(): Promise<UserProgressData | null> {
    if (supabase && isSchemaValid) {
      try {
        const userId = getOrInitUserId();
        const { data, error } = await supabase
          .from('user_progress')
          .select('streak_count, last_read_date, daily_goal, read_hadiths, read_history, settings')
          .eq('user_id', userId)
          .maybeSingle();
        
        checkSchemaError(error);
        if (!error && data && isSchemaValid) {
          return {
            streak_count: data.streak_count,
            last_read_date: data.last_read_date,
            daily_goal: data.daily_goal,
            read_hadiths: Array.isArray(data.read_hadiths) ? data.read_hadiths : [],
            read_history: typeof data.read_history === 'object' && data.read_history ? data.read_history : {},
            settings: typeof data.settings === 'object' && data.settings ? data.settings : {}
          };
        }
        if (error) {
          console.error("Error fetching user progress from Supabase:", error);
        }
      } catch (err) {
        console.error("Supabase user progress catch:", err);
      }
    }
    return null;
  },

  async syncUserProgress(progress: Partial<UserProgressData>): Promise<boolean> {
    if (supabase && isSchemaValid) {
      try {
        const userId = getOrInitUserId();
        // Check if user progress row exists
        const { data, error: selectError } = await supabase
          .from('user_progress')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        checkSchemaError(selectError);
        if (!selectError && isSchemaValid) {
          if (data) {
            // Update
            const { error: updateError } = await supabase
              .from('user_progress')
              .update({
                ...progress,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', userId);
            checkSchemaError(updateError);
            return !updateError && isSchemaValid;
          } else {
            // Insert
            const { error: insertError } = await supabase
              .from('user_progress')
              .insert([{
                user_id: userId,
                streak_count: progress.streak_count || 0,
                last_read_date: progress.last_read_date || null,
                daily_goal: progress.daily_goal || 5,
                read_hadiths: progress.read_hadiths || [],
                read_history: progress.read_history || {},
                settings: progress.settings || {}
              }]);
            checkSchemaError(insertError);
            return !insertError && isSchemaValid;
          }
        }
        console.error("Error checking user progress existence:", selectError);
      } catch (err) {
        console.error("Supabase user progress sync catch:", err);
      }
    }
    return false;
  },

  // Perform a one-time migration of bookmarks and notes from LocalStorage to Supabase
  async migrateLocalDataToCloud(): Promise<void> {
    if (!supabase || !isSchemaValid) return;
    try {
      const userId = getOrInitUserId();

      // 1. Migrate Bookmarks
      const cloudBookmarks = await this.getBookmarks();
      const localBookmarks = getLocalBookmarks();
      if (cloudBookmarks.length === 0 && localBookmarks.length > 0 && isSchemaValid) {
        console.info("Migrating local bookmarks to Supabase...");
        const cached = getLocalCachedHadiths();
        const insertRows = [];
        for (const bid of localBookmarks) {
          const hadith = cached[bid];
          if (hadith) {
            await this.ensureHadithExists(hadith);
            insertRows.push({ user_id: userId, hadith_id: bid });
          }
        }
        if (insertRows.length > 0 && isSchemaValid) {
          const { error } = await supabase.from('bookmarks').insert(insertRows);
          checkSchemaError(error);
          if (error) console.error("Error migrating bookmarks:", error);
        }
      }

      // 2. Migrate Notes
      const cloudNotes = await this.getNotes();
      const localNotes = getLocalNotes();
      if (Object.keys(cloudNotes).length === 0 && Object.keys(localNotes).length > 0 && isSchemaValid) {
        console.info("Migrating local notes to Supabase...");
        const cached = getLocalCachedHadiths();
        const insertRows = [];
        for (const [nidStr, content] of Object.entries(localNotes)) {
          const nid = parseInt(nidStr, 10);
          const hadith = cached[nid];
          if (hadith) {
            await this.ensureHadithExists(hadith);
            insertRows.push({ user_id: userId, hadith_id: nid, content });
          }
        }
        if (insertRows.length > 0 && isSchemaValid) {
          const { error } = await supabase.from('notes').insert(insertRows);
          checkSchemaError(error);
          if (error) console.error("Error migrating notes:", error);
        }
      }
    } catch (err) {
      console.error("Failed to migrate local data to cloud:", err);
    }
  },

  async restoreBackup(backupUserId: string): Promise<{
    success: boolean;
    progress?: UserProgressData;
    bookmarks?: number[];
    notes?: Record<number, string>;
    readingProgress?: Hadith | null;
  }> {
    if (!supabase || !isSchemaValid) {
      return { success: false };
    }
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(backupUserId)) {
        return { success: false };
      }

      // Check if user progress exists for this ID
      const { data: progressRow, error: progressErr } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', backupUserId)
        .maybeSingle();

      checkSchemaError(progressErr);
      if (progressErr || !progressRow || !isSchemaValid) {
        // Check if bookmarks or notes exist for this user before giving up
        const { data: bCheck } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', backupUserId)
          .limit(1);
        
        const { data: nCheck } = await supabase
          .from('notes')
          .select('id')
          .eq('user_id', backupUserId)
          .limit(1);
        
        if ((!bCheck || bCheck.length === 0) && (!nCheck || nCheck.length === 0)) {
          return { success: false };
        }
      }

      // Set new user ID
      localStorage.setItem(LOCAL_USER_ID_KEY, backupUserId);

      // Map progress values
      const progress: UserProgressData = {
        streak_count: progressRow?.streak_count || 0,
        last_read_date: progressRow?.last_read_date || null,
        daily_goal: progressRow?.daily_goal || 5,
        read_hadiths: Array.isArray(progressRow?.read_hadiths) ? progressRow.read_hadiths : [],
        read_history: typeof progressRow?.read_history === 'object' && progressRow.read_history ? progressRow.read_history : {},
        settings: typeof progressRow?.settings === 'object' && progressRow.settings ? progressRow.settings : {}
      };

      // Fetch all items from DB with the new user_id context
      const bms = await this.getBookmarks();
      const nts = await this.getNotes();
      const readingProgress = await this.getReadingProgressHadith();

      // Overwrite local storage values
      localStorage.setItem('bukhari_streak_count', progress.streak_count.toString());
      if (progress.last_read_date) {
        localStorage.setItem('bukhari_last_read_date', progress.last_read_date);
      } else {
        localStorage.removeItem('bukhari_last_read_date');
      }
      localStorage.setItem('bukhari_daily_goal', progress.daily_goal.toString());
      localStorage.setItem('bukhari_read_hadiths', JSON.stringify(progress.read_hadiths));
      localStorage.setItem('bukhari_read_history', JSON.stringify(progress.read_history));
      
      saveLocalBookmarks(bms);
      saveLocalNotes(nts);
      if (readingProgress) {
        localStorage.setItem(LOCAL_PROGRESS_KEY, readingProgress.id.toString());
      }

      // Write settings fields to local storage
      if (progress.settings) {
        Object.entries(progress.settings).forEach(([key, val]) => {
          if (val !== undefined && val !== null) {
            localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : val.toString());
          }
        });
      }

      return {
        success: true,
        progress,
        bookmarks: bms,
        notes: nts,
        readingProgress
      };
    } catch (err) {
      console.error("Failed to restore backup:", err);
      return { success: false };
    }
  }
};
