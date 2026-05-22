import { createClient } from '@supabase/supabase-js';
import { bukhariData } from './data';
import type { Hadith } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (!isSupabaseConfigured) {
  console.warn("Supabase credentials missing. Operating in offline/LocalStorage mode.");
}

// Local Storage Fallback Helpers
const LOCAL_BOOKMARKS_KEY = 'bukhari_bookmarks';
const LOCAL_NOTES_KEY = 'bukhari_notes';
const LOCAL_PROGRESS_KEY = 'bukhari_progress';

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

// Database API with Local Fallbacks
export const db = {
  // Hadiths
  async getHadiths(): Promise<Hadith[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('hadiths')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data && data.length > 0) {
        return data as Hadith[];
      }
      console.error("Error fetching hadiths from Supabase, falling back to local seed data:", error);
    }
    return bukhariData;
  },

  // Bookmarks
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

  async toggleBookmark(hadithId: number): Promise<boolean> {
    if (supabase) {
      // Check if bookmarked
      const { data, error } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('hadith_id', hadithId)
        .maybeSingle();

      if (!error) {
        if (data) {
          // Delete bookmark
          const { error: delError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('hadith_id', hadithId);
          return !delError ? false : true;
        } else {
          // Add bookmark
          const { error: insError } = await supabase
            .from('bookmarks')
            .insert([{ hadith_id: hadithId }]);
          return !insError ? true : false;
        }
      }
      console.error("Error toggling bookmark on Supabase, falling back to local:", error);
    }
    
    const local = getLocalBookmarks();
    const index = local.indexOf(hadithId);
    let bookmarked = false;
    if (index > -1) {
      local.splice(index, 1);
    } else {
      local.push(hadithId);
      bookmarked = true;
    }
    saveLocalBookmarks(local);
    return bookmarked;
  },

  // Notes
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

  async saveNote(hadithId: number, content: string): Promise<boolean> {
    if (supabase) {
      // Upsert note
      const { data, error: selectError } = await supabase
        .from('notes')
        .select('id')
        .eq('hadith_id', hadithId)
        .maybeSingle();

      if (!selectError) {
        if (data) {
          // Update
          const { error: updateError } = await supabase
            .from('notes')
            .update({ content, updated_at: new Date().toISOString() })
            .eq('hadith_id', hadithId);
          return !updateError;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('notes')
            .insert([{ hadith_id: hadithId, content }]);
          return !insertError;
        }
      }
      console.error("Error saving note to Supabase, falling back to local:", selectError);
    }

    const local = getLocalNotes();
    local[hadithId] = content;
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

  // Reading Progress
  async getReadingProgress(): Promise<number | null> {
    if (supabase) {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('hadith_id')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return data.hadith_id;
      }
      console.error("Error fetching reading progress from Supabase, falling back to local:", error);
    }
    
    const progress = localStorage.getItem(LOCAL_PROGRESS_KEY);
    return progress ? parseInt(progress, 10) : null;
  },

  async saveReadingProgress(hadithId: number): Promise<boolean> {
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
            .update({ hadith_id: hadithId, updated_at: new Date().toISOString() })
            .eq('id', data.id);
          return !updateError;
        } else {
          // Insert
          const { error: insertError } = await supabase
            .from('reading_progress')
            .insert([{ hadith_id: hadithId }]);
          return !insertError;
        }
      }
      console.error("Error saving reading progress to Supabase, falling back to local:", selectError);
    }

    localStorage.setItem(LOCAL_PROGRESS_KEY, hadithId.toString());
    return true;
  }
};
