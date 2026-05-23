-- SQL Schema for Sahih al-Bukhari App
-- paste these queries into your Supabase SQL editor to set up the database

-- 1. Hadiths Table
CREATE TABLE IF NOT EXISTS public.hadiths (
    id SERIAL PRIMARY KEY,
    number VARCHAR(50) NOT NULL UNIQUE,
    kitab VARCHAR(255) NOT NULL,
    bab VARCHAR(255) NOT NULL,
    arabic TEXT NOT NULL,
    translation TEXT NOT NULL,
    kitab_arabic VARCHAR(255),
    kitab_english VARCHAR(255),
    bab_arabic VARCHAR(255),
    bab_english VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Alter table if it already exists to add columns
ALTER TABLE public.hadiths ADD COLUMN IF NOT EXISTS kitab_arabic VARCHAR(255);
ALTER TABLE public.hadiths ADD COLUMN IF NOT EXISTS kitab_english VARCHAR(255);
ALTER TABLE public.hadiths ADD COLUMN IF NOT EXISTS bab_arabic VARCHAR(255);
ALTER TABLE public.hadiths ADD COLUMN IF NOT EXISTS bab_english VARCHAR(255);

-- 2. Bookmarks Table
CREATE TABLE IF NOT EXISTS public.bookmarks (
    id SERIAL PRIMARY KEY,
    hadith_id INT REFERENCES public.hadiths(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Notes Table
CREATE TABLE IF NOT EXISTS public.notes (
    id SERIAL PRIMARY KEY,
    hadith_id INT REFERENCES public.hadiths(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Reading Progress Table
CREATE TABLE IF NOT EXISTS public.reading_progress (
    id SERIAL PRIMARY KEY,
    hadith_id INT REFERENCES public.hadiths(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) on bookmarks, notes, and reading progress
ALTER TABLE public.hadiths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Allow public read access to Hadiths
DROP POLICY IF EXISTS "Allow public read access to Hadiths" ON public.hadiths;
CREATE POLICY "Allow public read access to Hadiths" ON public.hadiths
    FOR SELECT USING (true);

-- Allow public insert and update to Hadiths (since client caches them on bookmark/note actions)
DROP POLICY IF EXISTS "Allow public insert to Hadiths" ON public.hadiths;
CREATE POLICY "Allow public insert to Hadiths" ON public.hadiths
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to Hadiths" ON public.hadiths;
CREATE POLICY "Allow public update to Hadiths" ON public.hadiths
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow public access for local/demo purposes (can be refined with auth)
DROP POLICY IF EXISTS "Allow public access to Bookmarks" ON public.bookmarks;
CREATE POLICY "Allow public access to Bookmarks" ON public.bookmarks
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to Notes" ON public.notes;
CREATE POLICY "Allow public access to Notes" ON public.notes
    FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public access to Reading Progress" ON public.reading_progress;
CREATE POLICY "Allow public access to Reading Progress" ON public.reading_progress
    FOR ALL USING (true);

-- Seed Initial Data
INSERT INTO public.hadiths (number, kitab, bab, arabic, translation, kitab_arabic, kitab_english, bab_arabic, bab_english) VALUES
('1', 'Revelation', 'How the Divine Revelation started', 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى دُنْيَا يُصِيبُهَا أَوْ إِلَى امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ', 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended. So whoever emigrated for worldly benefits or for a woman to marry, his emigration was for what he emigrated for.', 'كتاب بدء الوحى', 'Revelation', 'كَيْفَ كَانَ بَدْءُ الْوَحْىِ إِلَى رَسُولِ اللَّهِ صلى الله عليه وسلم', 'How the Divine Revelation started being revealed to Allah''s Messenger (peace be upon him)'),
('2', 'Belief (Faith)', 'Islam is based on five (principles)', 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ', 'Islam is based on the following five (principles): To testify that none has the right to be worshipped but Allah and Muhammad is Allah''s Messenger. To offer the (compulsory congregational) prayers dutifully and perfectly. To pay Zakat (i.e. obligatory charity). To perform Hajj. (i.e. Pilgrimage to Mecca). To observe fast during the month of Ramadan.', 'كتاب الإيمان', 'Belief (Faith)', 'باب دُعَاؤُكُمْ إِيمَانُكُمْ', 'Islam is based on five (principles)'),
('13', 'Belief (Faith)', 'To love the Prophet (ﷺ) is a part of Faith', 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى أَكُونَ أَحَبَّ إِلَيْهِ مِنْ وَالِدِهِ وَوَلَدِهِ وَالنَّاسِ أَجْمَعِينَ', 'None of you will have faith till he loves me more than his father, his children and all mankind.', 'كتاب الإيمان', 'Belief (Faith)', 'باب حُبِّ الرَّسُولِ صلى الله عليه وسلم مِنَ الإِيمَانِ', 'To love the Prophet (ﷺ) is a part of Faith'),
('15', 'Belief (Faith)', 'To love for one''s brother what one loves for oneself is a part of Faith', 'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', 'None of you will have faith till he wishes for his (Muslim) brother what he likes for himself.', 'كتاب الإيمان', 'Belief (Faith)', 'باب مِنَ الإِيمَانِ أَنْ يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ', 'To love for one''s brother what one loves for oneself is a part of Faith')
ON CONFLICT (number) DO NOTHING;
