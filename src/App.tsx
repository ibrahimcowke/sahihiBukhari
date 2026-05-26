import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home,
  BookOpen,
  Users,
  Settings,
  Bookmark, 
  Share2, 
  Menu, 
  Search, 
  X, 
  FileText, 
  Sparkles, 
  Compass, 
  Eye, 
  EyeOff, 
  Check, 
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ArrowUpRight,
  ArrowUpLeft,
  Database,
  Volume2,
  VolumeX,
  Copy,
  Download,
  CheckCircle,
  Flame,
  Plus,
  Minus,
  RotateCw,
  Palette,
  Award,
  Lock,
  Activity
} from 'lucide-react';
import { db, isSupabaseConfigured } from './supabaseClient';
import { ruwaatsData } from './ruwaats';
import type { Theme, Hadith, ArabicFont, DisplayMode, TextAlignment, ReadingLayout } from './types';
import { api } from './api';
import type { Chapter } from './api';

type Tab = 'home' | 'chapters' | 'narrators' | 'bookmarks' | 'settings';

const translations = {
  english: {
    home: "Home",
    fahrs: "Fahrs",
    ruwaat: "Ruwaat",
    moments: "Moments",
    settings: "Settings",
    spiritualOasis: "Spiritual Oasis",
    bukhariTitle: "صحيح البخاري",
    welcomeDesc: "Welcome to your minimal spiritual library. A peaceful environment to read, study, and reflect on the authentic actions of the Prophet Muhammad (ﷺ).",
    hadithsCompiled: "Hadiths Compiled",
    savedMoments: "Saved Moments",
    insightsRecorded: "Insights Recorded",
    lastReadingSession: "Last Reading Session",
    hadithShort: "Hadith",
    resume: "Resume",
    quickSearch: "Quick Search",
    searchPlaceholderHome: "Type keyword (e.g. intention) and press Enter...",
    searchPlaceholderChapters: "Search translation details...",
    searchBtn: "Search",
    curatedReflection: "Curated Hadith Reflection",
    readInContext: "Read in Context",
    loadingReflection: "Loading reflection wisdom...",
    chaptersIndex: "Fahras (Chapters Index)",
    chaptersCount: "99 Chapters",
    backToIndex: "← Back to Index",
    searchResultsFor: "Search Results for:",
    searchingSahih: "Searching Sahih al-Bukhari...",
    noHadithsFound: "No matching hadiths found for this search.",
    saved: "Saved",
    save: "Save",
    editNote: "Edit Note",
    addNote: "Add Note",
    share: "Share",
    backToChapters: "← Back to Chapters",
    retrievingHadiths: "Retrieving chapter scripture...",
    ruwaatTitle: "Ruwaat (Prominent Narrators)",
    ruwaatDesc: "Explore the biographies of the noble Companions who preserved the Prophet's words and practices.",
    hadithsCount: "Hadiths",
    savedMomentsTitle: "Saved Moments & Insights",
    savedMomentsDesc: "Access your personal repository of saved Hadiths and reflection notes.",
    bookmarksLabel: "Bookmarks",
    reflectionsLabel: "Reflection Notes",
    emptyMoments: "Your saved moments will appear here.",
    emptyReflections: "Your recorded reflections will appear here.",
    edit: "Edit",
    settingsTitle: "Settings",
    settingsDesc: "Personalize your reading environment and verify database connectivity.",
    spiritualThemes: "Spiritual Themes",
    themeDesc: "Select background and contrast palette.",
    themeNight: "Night Forest",
    themePaper: "Sunlit Paper",
    themeSepia: "Moss Sepia",
    themeIndigo: "Royal Indigo",
    themeEmerald: "Emerald Sanctuary",
    themeClay: "Clay Tablet",
    arabicTypography: "Arabic Font Size",
    arabicTypographyDesc: "Scale size of the sacred Arabic script.",
    translationTypography: "Translation Font Size",
    translationTypographyDesc: "Scale translation texts to prevent strain.",
    arabicFontLabel: "Arabic Font Family",
    arabicFontDesc: "Select font style for Arabic text.",
    displayModeLabel: "Hadith Display Mode",
    displayModeDesc: "Toggle between bilingual, Arabic-only, or translation-only views.",
    displayBilingual: "Bilingual",
    displayArabicOnly: "Arabic Only",
    displayTranslationOnly: "Translation Only",
    alignmentLabel: "Arabic Text Alignment",
    alignmentDesc: "Set the alignment for Arabic script.",
    alignCenter: "Center",
    alignRight: "Right",
    alignJustify: "Justify",
    sanadLabel: "Sanad (Narrator Chain)",
    sanadDesc: "Show or hide the chain of narrators.",
    sanadShow: "Show",
    sanadHide: "Hide",
    dbConfig: "Database Configuration",
    dbDesc: "Status of the Supabase cloud connection.",
    dbLive: "Live Database Active",
    dbOffline: "Offline Mode (Local Storage)",
    gatherWisdom: "Gathering scripture wisdom...",
    focusModeEnable: "Enable Focus Mode",
    focusModeDisable: "Disable Focus Mode",
    reflectionModalTitle: "Personal Reflection",
    thoughtsInsights: "Your thoughts & insights",
    notePlaceholder: "Write down your insights, spiritual feelings, or notes about this Hadith...",
    deleteNote: "Delete Note",
    cancel: "Cancel",
    recordNote: "Record Note",
    momentSaved: "Moment saved to repository.",
    momentRemoved: "Removed from repository.",
    reflectionRecorded: "Reflection note recorded.",
    failedReflection: "Failed to record reflection.",
    reflectionRemoved: "Reflection removed.",
    copied: "Hadith copied to clipboard.",
    chapterNotFound: "Chapter not found.",
    chapterHadithFailed: "Failed to retrieve chapter hadiths.",
    searchFailed: "Search failed.",
    languageLabel: "Language / اللغة",
    languageDesc: "Choose UI language / اختر لغة الواجهة",
    chapterShort: "Chapter",
    babLabel: "Bab:",
    readingLayoutLabel: "Reading Layout Style",
    readingLayoutDesc: "Choose between scrollable chapter page or clean page-by-page Hadith views.",
    layoutScroll: "Continuous Scroll",
    layoutPage: "Hadith-by-Hadith (Page)",
    nextHadith: "Next Hadith",
    prevHadith: "Previous Hadith",
    nextChapterBtn: "Next Chapter",
    prevChapterBtn: "Previous Chapter",
    listen: "Listen",
    stop: "Stop",
    copyArabic: "Copy Arabic",
    copyEnglish: "Copy English",
    hadithsRead: "Hadiths Read",
    readJourney: "Reading Journey",
    offlineAvailable: "Offline Ready",
    onlineOnly: "Online Only",
    download: "Download",
    downloading: "Downloading...",
    downloaded: "Downloaded",
    markRead: "Mark Read",
    markUnread: "Mark Unread",
    dailyGoal: "Daily Goal",
    readToday: "read today",
    streak: "Reading Streak",
    streakDays: "Days",
    goalAdjust: "Adjust Goal",
    goalReached: "Daily Goal Reached! 🎉",
    shuffleHadith: "Shuffle Reflection",
    notificationTitle: "Hadith Reminders",
    notificationDesc: "Receive a daily reminder notification to read your Hadith.",
    notificationEnable: "Enable Reminders",
    notificationDisabled: "Disabled",
    notificationGranted: "Reminders Enabled",
    notificationDenied: "Permission Denied",
    reminderTime: "Reminder Time",
    goalReachedTitle: "Daily Goal Reached! 🎉",
    goalReachedBody: "Congratulations! You have completed your daily reading goal of {0} Hadiths today.",
    dailyReminderTitle: "Time for Reflection 📖",
    dailyReminderBody: "Read your curated Hadith of the day from Sahih Al-Bukhari."
  },
  arabic: {
    home: "الرئيسية",
    fahrs: "الفهرس",
    ruwaat: "الرواة",
    moments: "المحفوظات",
    settings: "الإعدادات",
    spiritualOasis: "الواحة الروحية",
    bukhariTitle: "صحيح البخاري",
    welcomeDesc: "مرحبًا بك في مكتبتك الروحية المبسطة. بيئة هادئة لقراءة ودراسة وتأمل الأحاديث النبوية الشريفة والسنن المطهرة للرسول محمد (ﷺ).",
    hadithsCompiled: "الأحاديث المجمعة",
    savedMoments: "المحفوظات",
    insightsRecorded: "التأملات المسجلة",
    lastReadingSession: "آخر جلسة قراءة",
    hadithShort: "حديث",
    resume: "استئناف",
    quickSearch: "البحث السريع",
    searchPlaceholderHome: "اكتب كلمة مفتاحية (مثال: نية) واضغط انتر...",
    searchPlaceholderChapters: "البحث في تفاصيل الترجمة والأحاديث...",
    searchBtn: "بحث",
    curatedReflection: "تأمل حديث اليوم",
    readInContext: "اقرأ في السياق",
    loadingReflection: "جاري تحميل الحكمة والتأملات...",
    chaptersIndex: "فهرس الأبواب (الفهرس)",
    chaptersCount: "٩٩ بابًا",
    backToIndex: "العودة إلى الفهرس ←",
    searchResultsFor: "نتائج البحث عن:",
    searchingSahih: "جاري البحث في صحيح البخاري...",
    noHadithsFound: "لم يتم العثور على أحاديث مطابقة لهذا البحث.",
    saved: "محفوظ",
    save: "حفظ",
    editNote: "تعديل الملاحظة",
    addNote: "إضافة ملاحظة",
    share: "مشاركة",
    backToChapters: "العودة إلى الأبواب ←",
    retrievingHadiths: "جاري استرداد النصوص الشريفة...",
    ruwaatTitle: "الرواة (أبرز الرواة من الصحابة)",
    ruwaatDesc: "استكشف سير الصحابة الأجلاء الذين نقلوا وحفظوا أحاديث وسنن النبي (ﷺ).",
    hadithsCount: "حديثًا",
    savedMomentsTitle: "المحفوظات والتأملات",
    savedMomentsDesc: "الوصول إلى مستودعك الشخصي للأحاديث المحفوظة ومذكرات التأمل الروحية.",
    bookmarksLabel: "الأحاديث المحفوظة",
    reflectionsLabel: "مذكرات التأمل",
    emptyMoments: "ستظهر الأحاديث المحفوظة هنا.",
    emptyReflections: "ستظهر تأملاتك المسجلة هنا.",
    edit: "تعديل",
    settingsTitle: "الإعدادات",
    settingsDesc: "تخصيص بيئة القراءة والتحقق من الاتصال بقاعدة البيانات.",
    spiritualThemes: "المظاهر الروحية",
    themeDesc: "اختر خلفية الشاشة والتباين المناسب لقراءتك.",
    themeNight: "غابة الليل",
    themePaper: "ورق مشمس",
    themeSepia: "تعتيق الطحلب",
    themeIndigo: "الأزرق الملكي",
    themeEmerald: "الملاذ الزمردي",
    themeClay: "اللوح الصلصالي",
    arabicTypography: "حجم الخط العربي",
    arabicTypographyDesc: "تغيير حجم الخط للنصوص العربية الشريفة.",
    translationTypography: "حجم خط الترجمة",
    translationTypographyDesc: "تغيير حجم خط الترجمة لتسهيل القراءة وتجنب إجهاد العين.",
    arabicFontLabel: "نوع الخط العربي",
    arabicFontDesc: "اختر نوع الخط المفضل لعرض النصوص العربية الشريفة.",
    displayModeLabel: "طريقة عرض الحديث",
    displayModeDesc: "تفعيل خيارات العرض: ثنائي اللغة، العربية فقط، أو الترجمة فقط.",
    displayBilingual: "ثنائي اللغة",
    displayArabicOnly: "العربية فقط",
    displayTranslationOnly: "الترجمة فقط",
    alignmentLabel: "محاذاة النص العربي",
    alignmentDesc: "اختر اتجاه محاذاة النص العربي الشريف.",
    alignCenter: "وسط",
    alignRight: "يمين",
    alignJustify: "ضبط",
    sanadLabel: "السند (سلسلة الرواة)",
    sanadDesc: "إظهار أو إخفاء سلسلة الرواة في الحديث.",
    sanadShow: "إظهار",
    sanadHide: "إخفاء",
    dbConfig: "إعداد قاعدة البيانات",
    dbDesc: "حالة الاتصال السحابي بقاعدة بيانات Supabase.",
    dbLive: "قاعدة البيانات السحابية نشطة",
    dbOffline: "الوضع المحلي (التخزين الداخلي)",
    gatherWisdom: "جاري جمع الحكمة الإلهية...",
    focusModeEnable: "تفعيل وضع التركيز",
    focusModeDisable: "إلغاء وضع التركيز",
    reflectionModalTitle: "تأمل شخصي",
    thoughtsInsights: "أفكارك وتأملاتك حول الحديث",
    notePlaceholder: "اكتب هنا تأملاتك، مشاعرك الإيمانية، أو ملاحظاتك حول هذا الحديث الشريف...",
    deleteNote: "حذف الملاحظة",
    cancel: "إلغاء",
    recordNote: "تسجيل الملاحظة",
    momentSaved: "تم حفظ الحديث في مستودعك الشخصي.",
    momentRemoved: "تمت إزالة الحديث من مستودعك.",
    reflectionRecorded: "تم تسجيل تأملاتك بنجاح.",
    failedReflection: "فشل في حفظ التأمل.",
    reflectionRemoved: "تم حذف التأمل.",
    copied: "تم نسخ نص الحديث الشريف.",
    chapterNotFound: "الباب غير موجود.",
    chapterHadithFailed: "فشل استرداد أحاديث الباب.",
    searchFailed: "فشلت عملية البحث.",
    languageLabel: "لغة الواجهة / Language",
    languageDesc: "اختر لغة الواجهة المفضلة / Choose UI language",
    chapterShort: "الباب",
    babLabel: "باب:",
    readingLayoutLabel: "طريقة القراءة والصفحات",
    readingLayoutDesc: "اختر بين تصفح كامل الباب بالتمرير أو قراءة الأحاديث صفحة بصفحة بشكل منفرد.",
    layoutScroll: "تمرير مستمر",
    layoutPage: "حديث بحديث (صفحة)",
    nextHadith: "الحديث التالي",
    prevHadith: "الحديث السابق",
    nextChapterBtn: "الباب التالي",
    prevChapterBtn: "الباب السابق",
    listen: "استمع",
    stop: "إيقاف",
    copyArabic: "نسخ العربي",
    copyEnglish: "نسخ الترجمة",
    hadithsRead: "الأحاديث المقروءة",
    readJourney: "مسيرة القراءة",
    offlineAvailable: "متوفر دون اتصال",
    onlineOnly: "متوفر بالاتصال فقط",
    download: "تحميل",
    downloading: "جاري التحميل...",
    downloaded: "تم التحميل",
    markRead: "تحديد كمقروء",
    markUnread: "تحديد كغير مقروء",
    dailyGoal: "الهدف اليومي",
    readToday: "قُرئت اليوم",
    streak: "سلسلة القراءة المتواصلة",
    streakDays: "أيام",
    goalAdjust: "تعديل الهدف",
    goalReached: "تم تحقيق الهدف اليومي! 🎉",
    shuffleHadith: "تغيير الحديث",
    notificationTitle: "تنبيهات الأحاديث",
    notificationDesc: "تلقي إشعار يومي يذكرك بقراءة الأحاديث والورد اليومي.",
    notificationEnable: "تفعيل التنبيهات",
    notificationDisabled: "موقوف",
    notificationGranted: "التنبيهات مفعلة",
    notificationDenied: "تم رفض الإذن",
    reminderTime: "وقت التذكير",
    goalReachedTitle: "تم تحقيق الهدف اليومي! 🎉",
    goalReachedBody: "تهانينا! لقد أكملت هدف القراءة اليومي البالغ {0} أحاديث اليوم.",
    dailyReminderTitle: "وقت التدبر والقراءة 📖",
    dailyReminderBody: "اقرأ حديث اليوم وتدبر معانيه من صحيح البخاري."
  }
};

const App: React.FC = () => {
  // Navigation & Chapters Index
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [showToolbar, setShowToolbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Chapter Detail view state
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [chapterHadiths, setChapterHadiths] = useState<Hadith[]>([]);
  const [loadingHadiths, setLoadingHadiths] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [searching, setSearching] = useState(false);

  // Interactive features state
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [bookmarkedHadiths, setBookmarkedHadiths] = useState<Hadith[]>([]);
  const [notesWithHadiths, setNotesWithHadiths] = useState<{hadith: Hadith, content: string}[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [noteInput, setNoteInput] = useState('');
  const [activeNoteHadith, setActiveNoteHadith] = useState<Hadith | null>(null);
  const [lastReadHadith, setLastReadHadith] = useState<Hadith | null>(null);
  const [dailyHadith, setDailyHadith] = useState<Hadith | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [playingHadithId, setPlayingHadithId] = useState<number | null>(null);
  const [committedSearchQuery, setCommittedSearchQuery] = useState('');

  // Dashboard enhancements states
  const [activeShareHadith, setActiveShareHadith] = useState<Hadith | null>(null);
  const [shareBgPattern, setShareBgPattern] = useState<'night' | 'emerald' | 'indigo' | 'clay' | 'parchment'>('emerald');
  const [isPlayingDailyHadith, setIsPlayingDailyHadith] = useState(false);
  const [isAnalyticsExpanded, setIsAnalyticsExpanded] = useState<boolean>(() => {
    return localStorage.getItem('bukhari_analytics_expanded') !== 'false';
  });
  const [activeReadingPlan, setActiveReadingPlan] = useState<string>(() => {
    return localStorage.getItem('bukhari_active_reading_plan') || 'none';
  });

  const [ruwaatSubTab, setRuwaatSubTab] = useState<'author' | 'narrators'>('author');
  const [isAuthorBioExpanded, setIsAuthorBioExpanded] = useState(false);

  // Handle SpeechSynthesis audio player cleanup
  useEffect(() => {
    // If user navigates away from Home tab, or if dailyHadith changes, stop narration
    if (currentTab !== 'home' || !dailyHadith) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsPlayingDailyHadith(false);
      }
    }
  }, [currentTab, dailyHadith]);

  // Premium PWA States (Reading progress tracking and Offline Chapter Downloader)
  const [readHadithIds, setReadHadithIds] = useState<Set<number>>(() => {
    try {
      const saved = localStorage.getItem('bukhari_read_hadiths');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  // Daily Reading Goal & Streaks
  const [dailyGoal, setDailyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('bukhari_daily_goal');
    return saved ? parseInt(saved, 10) : 5;
  });

  const [streakCount, setStreakCount] = useState<number>(() => {
    const saved = localStorage.getItem('bukhari_streak_count');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [readHistory, setReadHistory] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('bukhari_read_history');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getTodayDateString = (): string => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const readTodayCount = useMemo(() => {
    const todayStr = getTodayDateString();
    return Object.values(readHistory).filter(date => date === todayStr).length;
  }, [readHistory]);

  const [cachedChapterIds, setCachedChapterIds] = useState<Set<number>>(() => {
    const cached = new Set<number>();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bukhari_hadiths_chapter_')) {
        const id = parseInt(key.replace('bukhari_hadiths_chapter_', ''), 10);
        if (!isNaN(id)) {
          cached.add(id);
        }
      }
    }
    return cached;
  });

  const [downloadingChapters, setDownloadingChapters] = useState<Record<number, boolean>>({});

  // Memoized Chapter progress computations
  const chapterProgressMap = useMemo(() => {
    const map: Record<number, { total: number; read: number; percent: number }> = {};
    cachedChapterIds.forEach(chId => {
      try {
        const localData = localStorage.getItem(`bukhari_hadiths_chapter_${chId}`);
        if (localData) {
          const list = JSON.parse(localData) as { id: number }[];
          if (Array.isArray(list) && list.length > 0) {
            const readCount = list.filter(h => readHadithIds.has(h.id)).length;
            map[chId] = {
              total: list.length,
              read: readCount,
              percent: Math.round((readCount / list.length) * 100)
            };
          }
        }
      } catch (e) {
        console.warn("Error computing progress for chapter", chId, e);
      }
    });
    return map;
  }, [cachedChapterIds, readHadithIds]);

  // Achievements & Badges List
  const badgesList = useMemo(() => {
    return [
      {
        id: 'beginner',
        nameEn: 'Al-Mubtadi\'',
        nameAr: 'المبتدئ',
        descEn: 'Read your first Hadith.',
        descAr: 'قراءة أول حديث لك.',
        unlocked: readHadithIds.size >= 1,
        icon: '🌟'
      },
      {
        id: 'seeker',
        nameEn: 'Talib al-\'Ilm',
        nameAr: 'طالب العلم',
        descEn: 'Read 10+ Hadiths.',
        descAr: 'قراءة 10 أحاديث أو أكثر.',
        unlocked: readHadithIds.size >= 10,
        icon: '📚'
      },
      {
        id: 'chronicler',
        nameEn: 'Al-Muwaththiq',
        nameAr: 'الموثق',
        descEn: 'Write 3+ notes.',
        descAr: 'كتابة 3 تأملات أو أكثر.',
        unlocked: notesWithHadiths.length >= 3,
        icon: '📝'
      },
      {
        id: 'preserver',
        nameEn: 'Al-Muhafiz',
        nameAr: 'المحافظ',
        descEn: 'Bookmark 5+ Hadiths.',
        descAr: 'حفظ 5 أحاديث في المفضلة.',
        unlocked: bookmarkedIds.length >= 5,
        icon: '🔖'
      },
      {
        id: 'consistent',
        nameEn: 'Al-Muthabit',
        nameAr: 'المثابر',
        descEn: 'Reach a 3-day streak.',
        descAr: 'تحقيق سلسلة قراءة لـ 3 أيام.',
        unlocked: streakCount >= 3,
        icon: '🔥'
      },
      {
        id: 'diligent',
        nameEn: 'Al-Mujtahid',
        nameAr: 'المجتهد',
        descEn: 'Read 50+ Hadiths.',
        descAr: 'قراءة 50 حديثاً أو أكثر.',
        unlocked: readHadithIds.size >= 50,
        icon: '🕌'
      }
    ];
  }, [readHadithIds.size, notesWithHadiths.length, bookmarkedIds.length, streakCount]);

  // 7-Day Reading Activity Chart Data
  const activityChartData = useMemo(() => {
    const data: { dayNameEn: string; dayNameAr: string; count: number; dateStr: string }[] = [];
    const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayNamesAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    
    // Get today and the past 6 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const count = Object.values(readHistory).filter(date => date === dateStr).length;
      const dayIndex = d.getDay();
      
      data.push({
        dayNameEn: dayNamesEn[dayIndex],
        dayNameAr: dayNamesAr[dayIndex],
        count,
        dateStr
      });
    }
    return data;
  }, [readHistory]);

  const overallProgressPercent = useMemo(() => {
    const bukhariTotal = 7276;
    return parseFloat(((readHadithIds.size / bukhariTotal) * 100).toFixed(2));
  }, [readHadithIds.size]);

  // Settings state
  const [arabicFontSize, setArabicFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('ummuhat_arabic_font_size');
    return saved ? parseInt(saved, 10) : 32;
  });
  const [translationFontSize, setTranslationFontSize] = useState<number>(() => {
    const saved = localStorage.getItem('ummuhat_translation_font_size');
    return saved ? parseInt(saved, 10) : 17;
  });
  const [language, setLanguage] = useState<'english' | 'arabic'>(() => {
    return (localStorage.getItem('ummuhat_language') as 'english' | 'arabic') || 'arabic';
  });
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('ummuhat_theme') as Theme) || 'night';
  });
  const [showThemeSwatches, setShowThemeSwatches] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    return localStorage.getItem('sahihbukhari_reminders_enabled') === 'true';
  });
  const [reminderTime, setReminderTime] = useState<string>(() => {
    return localStorage.getItem('sahihbukhari_reminder_time') || '09:00';
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    return (typeof window !== 'undefined' && 'Notification' in window) ? Notification.permission : 'default';
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadAllCurrent, setDownloadAllCurrent] = useState(0);
  const [downloadAllTotal, setDownloadAllTotal] = useState(0);
  const [downloadAllError, setDownloadAllError] = useState<string | null>(null);
  const downloadCancelRef = useRef(false);
  const [arabicFont, setArabicFont] = useState<ArabicFont>(() => {
    return (localStorage.getItem('ummuhat_arabic_font') as ArabicFont) || 'Amiri';
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>('arabic-only');
  const [textAlignment, setTextAlignment] = useState<TextAlignment>(() => {
    return (localStorage.getItem('ummuhat_text_alignment') as TextAlignment) || 'right';
  });
  const [showSanad, setShowSanad] = useState<boolean>(() => {
    const saved = localStorage.getItem('ummuhat_show_sanad');
    return saved !== null ? saved === 'true' : true;
  });
  const [readingLayout, setReadingLayout] = useState<ReadingLayout>(() => {
    return (localStorage.getItem('ummuhat_reading_layout') as ReadingLayout) || 'page';
  });
  const [currentHadithIndex, setCurrentHadithIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);

  // Localized texts helper
  const t = translations[language];

  // Helper for formatting numbers in Arabic
  const formatNumber = (numStr: string | number): string => {
    const str = String(numStr);
    if (language !== 'arabic') return str;
    const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return str.replace(/[0-9]/g, (w) => arabicDigits[+w]);
  };

  // Narrators UI state
  const [expandedNarrator, setExpandedNarrator] = useState<number | null>(null);

  // Intersection observer ref to track reading progress in chapter view
  const hadithRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const readingBoxRef = useRef<HTMLDivElement | null>(null);

  // Check reading streak validity on visit
  useEffect(() => {
    const lastRead = localStorage.getItem('bukhari_last_read_date');
    if (lastRead) {
      const todayStr = getTodayDateString();
      if (lastRead !== todayStr) {
        const lastReadDateObj = new Date(lastRead);
        const todayDateObj = new Date(todayStr);
        const diffTime = Math.abs(todayDateObj.getTime() - lastReadDateObj.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays > 1) {
          // Reset streak to 0 since they missed a day
          setStreakCount(0);
          localStorage.setItem('bukhari_streak_count', '0');
        }
      }
    }
  }, []);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Chapters list from API
        const data = await api.fetchChapters();
        setChapters(data);
        
        // 2. Fetch bookmarks from database
        const bms = await db.getBookmarks();
        setBookmarkedIds(bms);
        const bmHadiths = await db.getBookmarkedHadiths();
        setBookmarkedHadiths(bmHadiths);
        
        // 3. Fetch notes from database
        const nts = await db.getNotes();
        setNotes(nts);
        const notesH = await db.getNotesWithHadiths();
        setNotesWithHadiths(notesH);
        
        // 4. Fetch progress from database
        const progressHadith = await db.getReadingProgressHadith();
        setLastReadHadith(progressHadith);

        // 5. Fetch date-based dynamic Hadith of the Day
        try {
          if (data && data.length > 0) {
            const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
            const targetChapterIndex = dayOfYear % data.length;
            const targetChapter = data[targetChapterIndex];
            
            if (targetChapter) {
              const hadithsList = await api.fetchHadithsByChapter(targetChapter.id);
              if (hadithsList && hadithsList.length > 0) {
                const targetHadithIndex = dayOfYear % hadithsList.length;
                setDailyHadith(hadithsList[targetHadithIndex]);
              }
            }
          }
        } catch (apiErr) {
          console.warn("Could not load dynamic daily reflection hadith", apiErr);
        }
      } catch (err) {
        console.error("Failed to load initial data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Theme observer
  useEffect(() => {
    localStorage.setItem('ummuhat_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Language & Direction observer
  useEffect(() => {
    localStorage.setItem('ummuhat_language', language);
    document.documentElement.setAttribute('dir', language === 'arabic' ? 'rtl' : 'ltr');
  }, [language]);

  // CSS variables updater for font-scaling
  useEffect(() => {
    localStorage.setItem('ummuhat_arabic_font_size', arabicFontSize.toString());
    document.documentElement.style.setProperty('--font-scale-arabic', `${arabicFontSize}px`);
  }, [arabicFontSize]);

  // CSS variables updater for translation-scaling
  useEffect(() => {
    localStorage.setItem('ummuhat_translation_font_size', translationFontSize.toString());
    document.documentElement.style.setProperty('--font-scale-translation', `${translationFontSize}px`);
  }, [translationFontSize]);

  // Persist Arabic Font
  useEffect(() => {
    localStorage.setItem('ummuhat_arabic_font', arabicFont);
    const fallback = (arabicFont === 'Cairo' || arabicFont === 'Tajawal') ? 'sans-serif' : 'serif';
    document.documentElement.style.setProperty('--font-arabic', `'${arabicFont}', ${fallback}`);
  }, [arabicFont]);

  // Persist Display Mode
  useEffect(() => {
    localStorage.setItem('ummuhat_display_mode', displayMode);
  }, [displayMode]);

  // Persist Text Alignment
  useEffect(() => {
    localStorage.setItem('ummuhat_text_alignment', textAlignment);
  }, [textAlignment]);

  // Persist Show Sanad
  useEffect(() => {
    localStorage.setItem('ummuhat_show_sanad', showSanad ? 'true' : 'false');
  }, [showSanad]);

  // Persist Reading Layout
  useEffect(() => {
    localStorage.setItem('ummuhat_reading_layout', readingLayout);
  }, [readingLayout]);

  // Persist remindersEnabled preference
  useEffect(() => {
    localStorage.setItem('sahihbukhari_reminders_enabled', remindersEnabled ? 'true' : 'false');
  }, [remindersEnabled]);

  // Persist reminderTime preference
  useEffect(() => {
    localStorage.setItem('sahihbukhari_reminder_time', reminderTime);
  }, [reminderTime]);

  // Save progress in page layout mode when current index changes
  useEffect(() => {
    if (readingLayout === 'page' && activeChapter && chapterHadiths.length > 0) {
      const activeHadith = chapterHadiths[currentHadithIndex];
      if (activeHadith) {
        db.saveReadingProgress(activeHadith).then(() => {
          setLastReadHadith(activeHadith);
        }).catch(err => {
          console.error("Failed to save reading progress", err);
        });
      }
    }
  }, [currentHadithIndex, readingLayout, activeChapter, chapterHadiths]);

  // Cancel speech on navigation or tab changes
  useEffect(() => {
    window.speechSynthesis.cancel();
    setPlayingHadithId(null);
    return () => {
      window.speechSynthesis.cancel();
      setPlayingHadithId(null);
    };
  }, [currentTab, activeChapter, currentHadithIndex]);

  // URL routing / shortcut support for PWA navigation
  useEffect(() => {
    const handleUrlNavigation = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['home', 'chapters', 'narrators', 'bookmarks', 'settings'].includes(tabParam)) {
        setCurrentTab(tabParam as Tab);
        if (tabParam !== 'chapters') {
          setActiveChapter(null);
          setSearchActive(false);
        }
        return;
      }

      const hash = window.location.hash.replace('#', '');
      if (hash && ['home', 'chapters', 'narrators', 'bookmarks', 'settings'].includes(hash)) {
        setCurrentTab(hash as Tab);
        if (hash !== 'chapters') {
          setActiveChapter(null);
          setSearchActive(false);
        }
      }
    };

    handleUrlNavigation();

    window.addEventListener('popstate', handleUrlNavigation);
    window.addEventListener('hashchange', handleUrlNavigation);

    return () => {
      window.removeEventListener('popstate', handleUrlNavigation);
      window.removeEventListener('hashchange', handleUrlNavigation);
    };
  }, []);

  // Synchronize currentTab state changes back to the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const currentParam = params.get('tab');
    if (currentParam !== currentTab) {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', currentTab);
      window.history.pushState({ tab: currentTab }, '', url.pathname + url.search + url.hash);
    }
  }, [currentTab]);

  // Check and trigger daily reminder notifications when active
  useEffect(() => {
    if (!remindersEnabled || notificationPermission !== 'granted') return;

    const checkReminder = () => {
      const todayStr = getTodayDateString();
      const lastReminderDate = localStorage.getItem('sahihbukhari_last_reminder_date');

      // If already shown today, do nothing
      if (lastReminderDate === todayStr) return;

      const [targetHour, targetMinute] = reminderTime.split(':').map(Number);
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // If the current time is past the target time, trigger notification
      if (currentHour > targetHour || (currentHour === targetHour && currentMinute >= targetMinute)) {
        try {
          new Notification(t.dailyReminderTitle, {
            body: t.dailyReminderBody,
            icon: '/app-icon.png',
            badge: '/favicon.svg'
          });
          localStorage.setItem('sahihbukhari_last_reminder_date', todayStr);
        } catch (err) {
          console.warn("Failed to fire daily reminder notification", err);
        }
      }
    };

    // Check immediately on mount/update
    checkReminder();

    // Check every minute
    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);
  }, [remindersEnabled, reminderTime, notificationPermission, language]);

  // Scroll listener for bottom navigation bar visibility (only in chapter reading view)
  useEffect(() => {
    if (currentTab !== 'chapters' || !activeChapter) {
      return;
    }
    const handleScroll = () => {
      if (window.innerWidth > 768) {
        setShowToolbar(true);
        return;
      }
      const currentScrollY = window.scrollY;
      if (currentScrollY < 120) {
        setShowToolbar(true);
      } else if (currentScrollY < lastScrollY) {
        setShowToolbar(true);
      } else {
        setShowToolbar(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, currentTab, activeChapter]);

  // Observer to track which Hadith is in view to save progress
  useEffect(() => {
    if (chapterHadiths.length === 0 || currentTab !== 'chapters' || !activeChapter) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idStr = entry.target.getAttribute('data-hadith-id');
            if (idStr) {
              const id = parseInt(idStr, 10);
              const matched = chapterHadiths.find(h => h.id === id);
              if (matched) {
                db.saveReadingProgress(matched);
                setLastReadHadith(matched);
              }
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -200px 0px" }
    );

    // Filter refs to make sure elements are valid
    Object.values(hadithRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [chapterHadiths, currentTab, activeChapter]);

  const highlightText = (text: string, search: string) => {
    if (!search || !search.trim()) return text;
    
    const words = search
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length >= 2);
      
    if (words.length === 0) return text;
    const escapedWords = words.map(w => w.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark 
              key={i} 
              style={{ 
                backgroundColor: 'rgba(210, 183, 115, 0.35)',
                color: 'inherit',
                padding: '0 2px',
                borderRadius: '4px',
                fontWeight: 600
              }}
            >
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  // Colorize Arabic hadith text: Prophet's speech (gold), Quranic verses (emerald), narration (default)
  const colorizeHadithArabic = (text: string) => {
    // Pattern: Prophet's speech is wrapped in ‏"‏ ... ‏"‏ and Quranic verses in ‏{‏ ... ‏}‏
    // We split on these markers to create colored segments
    const segments: { text: string; type: 'narration' | 'prophet' | 'quran' }[] = [];
    let remaining = text;
    
    while (remaining.length > 0) {
      // Find the next prophet quote or quran verse
      const prophetStart = remaining.indexOf('\u200f"\u200f');
      const quranStart = remaining.indexOf('\u200f{\u200f');
      
      let nextStart = -1;
      let nextType: 'prophet' | 'quran' = 'prophet';
      let endMarker = '';
      
      if (prophetStart !== -1 && (quranStart === -1 || prophetStart < quranStart)) {
        nextStart = prophetStart;
        nextType = 'prophet';
        endMarker = '\u200f"\u200f';
      } else if (quranStart !== -1) {
        nextStart = quranStart;
        nextType = 'quran';
        endMarker = '\u200f}\u200f';
      }
      
      if (nextStart === -1) {
        // No more special markers, rest is narration
        if (remaining.length > 0) {
          segments.push({ text: remaining, type: 'narration' });
        }
        break;
      }
      
      // Add narration before the marker
      if (nextStart > 0) {
        segments.push({ text: remaining.substring(0, nextStart), type: 'narration' });
      }
      
      // Find the closing marker
      const searchFrom = nextStart + endMarker.length;
      const nextEnd = remaining.indexOf(endMarker, searchFrom);
      
      if (nextEnd !== -1) {
        // Include the markers in the colored text
        const markedText = remaining.substring(nextStart, nextEnd + endMarker.length);
        segments.push({ text: markedText, type: nextType });
        remaining = remaining.substring(nextEnd + endMarker.length);
      } else {
        // No closing marker found, treat rest as the type
        segments.push({ text: remaining.substring(nextStart), type: nextType });
        break;
      }
    }
    
    if (segments.length <= 1 && segments[0]?.type === 'narration') {
      // Fallback: try simpler quote patterns "..." 
      return colorizeArabicFallback(text);
    }
    
    return (
      <>
        {segments.map((seg, i) => (
          <span
            key={i}
            style={{
              color: seg.type === 'prophet'
                ? 'var(--accent-gold)'
                : seg.type === 'quran'
                  ? 'var(--accent-emerald)'
                  : 'inherit',
              fontWeight: seg.type !== 'narration' ? 600 : 'inherit'
            }}
          >
            {seg.text}
          </span>
        ))}
      </>
    );
  };

  // Fallback colorizer for Arabic text using simple quote marks
  const colorizeArabicFallback = (text: string) => {
    // Try regular Arabic/English quotes
    const regex = /("([^"]*)")|("([^"]*)")/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(text)) !== null) {
      // Add narration before the quote
      if (match.index > lastIndex) {
        parts.push(<span key={`n${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>);
      }
      // Add the quoted text as Prophet's speech
      parts.push(
        <span key={`p${match.index}`} style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (parts.length === 0) return text; // No quotes found at all
    
    // Add remaining narration
    if (lastIndex < text.length) {
      parts.push(<span key={`n${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return <>{parts}</>;
  };

  // Colorize English hadith text: direct speech in gold, narrator context in default
  const colorizeHadithEnglish = (text: string) => {
    // English Prophet speech is typically in double quotes: "..."
    // Also look for single-quoted speech within narrator text: '...'
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    // Match double-quoted speech and Quranic references in parenthetical verse refs
    const regex = /"([^"]+)"/g;
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(text)) !== null) {
      // Add narration before the quote
      if (match.index > lastIndex) {
        parts.push(
          <span key={`n${lastIndex}`}>{text.substring(lastIndex, match.index)}</span>
        );
      }
      // Add the quoted text as Prophet's speech (gold)
      parts.push(
        <span key={`p${match.index}`} style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (parts.length === 0) return text; // No quotes found
    
    // Add remaining narration
    if (lastIndex < text.length) {
      parts.push(<span key={`n${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }
    
    return <>{parts}</>;
  };

  const handleToggleAudio = (hadith: Hadith) => {
    if (playingHadithId === hadith.id) {
      window.speechSynthesis.cancel();
      setPlayingHadithId(null);
    } else {
      window.speechSynthesis.cancel();
      
      // Clean up brackets [...] and parentheses (...) for smoother speech flow
      let cleanedText = hadith.translation;
      cleanedText = cleanedText
        .replace(/\[[^\]]*\]/g, '')
        .replace(/\([^)]*\)/g, '');
        
      cleanedText = cleanedText
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanedText) {
        triggerToast(language === 'arabic' ? 'لا يوجد نص ترجمة متاح للقراءة الصوتية' : 'No translation text available for audio reader');
        return;
      }

      const utterance = new SpeechSynthesisUtterance(cleanedText);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      
      utterance.onend = () => {
        setPlayingHadithId(null);
      };
      
      utterance.onerror = () => {
        setPlayingHadithId(null);
      };
      
      window.speechSynthesis.speak(utterance);
      setPlayingHadithId(hadith.id);
    }
  };

  const handleDiscoverRandom = async () => {
    try {
      let currentChapters = chapters;
      if (currentChapters.length === 0) {
        currentChapters = await api.fetchChapters();
        setChapters(currentChapters);
      }
      
      if (currentChapters.length === 0) {
        triggerToast(language === 'arabic' ? 'فشل تحميل الأبواب' : 'Failed to load chapters');
        return;
      }
      
      // Select a random chapter
      const randomChapter = currentChapters[Math.floor(Math.random() * currentChapters.length)];
      
      // Fetch hadiths of this chapter
      const hadiths = await api.fetchHadithsByChapter(randomChapter.id);
      if (hadiths.length === 0) {
        triggerToast(language === 'arabic' ? 'الباب المختار لا يحتوي على أحاديث' : 'The selected chapter has no hadiths');
        return;
      }
      
      // Select a random hadith
      const randomHadith = hadiths[Math.floor(Math.random() * hadiths.length)];
      
      // Select the chapter and highlight/open the random hadith
      await handleSelectChapter(randomChapter.id, randomHadith.id);
      
      triggerToast(
        language === 'arabic'
          ? `اكتشاف عشوائي: حديث رقم ${randomHadith.number}`
          : `Discovered random Hadith #${randomHadith.number}`
      );
    } catch (err) {
      console.error("Failed to discover random hadith", err);
      triggerToast(language === 'arabic' ? 'فشل في اكتشاف حديث عشوائي' : 'Failed to discover random hadith');
    }
  };

  // Helper for custom short toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle bookmark function
  const handleToggleBookmark = async (hadith: Hadith) => {
    const isBookmarked = await db.toggleBookmark(hadith);
    
    // Refresh bookmarks status
    const bms = await db.getBookmarks();
    setBookmarkedIds(bms);
    const bmHadiths = await db.getBookmarkedHadiths();
    setBookmarkedHadiths(bmHadiths);

    if (isBookmarked) {
      triggerToast(t.momentSaved);
    } else {
      triggerToast(t.momentRemoved);
    }
  };

  // Notes Functions
  const handleOpenNoteModal = (hadith: Hadith) => {
    setActiveNoteHadith(hadith);
    setNoteInput(notes[hadith.id] || '');
  };

  const handleSaveNote = async () => {
    if (!activeNoteHadith) return;
    const success = await db.saveNote(activeNoteHadith, noteInput);
    if (success) {
      // Refresh notes list
      const nts = await db.getNotes();
      setNotes(nts);
      const notesH = await db.getNotesWithHadiths();
      setNotesWithHadiths(notesH);

      triggerToast(t.reflectionRecorded);
      setActiveNoteHadith(null);
    } else {
      triggerToast(t.failedReflection);
    }
  };

  const handleDeleteNote = async (id: number) => {
    const success = await db.deleteNote(id);
    if (success) {
      // Refresh notes list
      const nts = await db.getNotes();
      setNotes(nts);
      const notesH = await db.getNotesWithHadiths();
      setNotesWithHadiths(notesH);

      triggerToast(t.reflectionRemoved);
      setActiveNoteHadith(null);
    }
  };

  // Share Function with Native Support
  const handleShare = (hadith: Hadith) => {
    const translationPart = displayMode !== 'arabic-only' && hadith.translation 
      ? `\n\n[Translation]\n${hadith.translation}` 
      : '';
    const shareText = `✦ Sahih al-Bukhari (Hadith ${hadith.number}) ✦\n\n[Arabic]\n${hadith.arabic}${translationPart}\n\n— Shared via Sahih Al-Bukhari`;
    
    if (navigator.share) {
      navigator.share({
        title: `Hadith ${hadith.number} - Sahih al-Bukhari`,
        text: shareText
      }).catch((err) => {
        console.warn('Native share failed, copying to clipboard instead:', err);
        navigator.clipboard.writeText(shareText);
        triggerToast(t.copied);
      });
    } else {
      navigator.clipboard.writeText(shareText);
      triggerToast(t.copied);
    }
  };

  // Toggle Hadith Read Status & Update Reading History/Streak
  const handleToggleRead = (hadithId: number) => {
    const todayStr = getTodayDateString();
    
    // Toggle Read ID
    setReadHadithIds(prev => {
      const next = new Set(prev);
      const isMarkingRead = !next.has(hadithId);
      
      if (isMarkingRead) {
        next.add(hadithId);
        triggerToast(language === 'arabic' ? 'تم التحديد كمقروء' : 'Marked as read');
        
        // Update read history mapping
        setReadHistory(prevHistory => {
          const nextHistory = { ...prevHistory, [hadithId]: todayStr };
          localStorage.setItem('bukhari_read_history', JSON.stringify(nextHistory));
          
          // Check if this read completes the daily goal
          const todayCount = Object.values(nextHistory).filter(date => date === todayStr).length;
          if (todayCount === dailyGoal) {
            setTimeout(() => {
              triggerToast(t.goalReached);
              if (remindersEnabled && Notification.permission === 'granted') {
                try {
                  new Notification(t.goalReachedTitle, {
                    body: t.goalReachedBody.replace('{0}', formatNumber(dailyGoal)),
                    icon: '/app-icon.png',
                    badge: '/favicon.svg'
                  });
                } catch (err) {
                  console.warn("Failed to fire goal reached notification", err);
                }
              }
            }, 600);
          }
          return nextHistory;
        });

        // Update Reading Streak
        const lastRead = localStorage.getItem('bukhari_last_read_date');
        if (lastRead) {
          if (lastRead !== todayStr) {
            // Check if last read was yesterday
            const lastReadDateObj = new Date(lastRead);
            const todayDateObj = new Date(todayStr);
            const diffTime = Math.abs(todayDateObj.getTime() - lastReadDateObj.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              // Consecutive day
              setStreakCount(prevStreak => {
                const nextStreak = prevStreak + 1;
                localStorage.setItem('bukhari_streak_count', String(nextStreak));
                return nextStreak;
              });
            } else if (diffDays > 1) {
              // Streak broken, start new
              setStreakCount(1);
              localStorage.setItem('bukhari_streak_count', '1');
            }
          }
        } else {
          // First time reading
          setStreakCount(1);
          localStorage.setItem('bukhari_streak_count', '1');
        }
        localStorage.setItem('bukhari_last_read_date', todayStr);

      } else {
        next.delete(hadithId);
        triggerToast(language === 'arabic' ? 'تم التحديد كغير مقروء' : 'Marked as unread');
        
        // Remove from read history
        setReadHistory(prevHistory => {
          const nextHistory = { ...prevHistory };
          delete nextHistory[hadithId];
          localStorage.setItem('bukhari_read_history', JSON.stringify(nextHistory));
          return nextHistory;
        });
      }
      localStorage.setItem('bukhari_read_hadiths', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  // Request OS Notification Permission
  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      triggerToast(language === 'arabic' ? 'المتصفح لا يدعم التنبيهات' : 'Notifications not supported by this browser');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        setRemindersEnabled(true);
        triggerToast(t.notificationGranted);
        new Notification(t.notificationGranted, {
          body: t.dailyReminderBody,
          icon: '/app-icon.png'
        });
      } else if (permission === 'denied') {
        triggerToast(t.notificationDenied);
      }
    } catch (err) {
      console.error("Error requesting notification permission", err);
    }
  };

  // Download Chapter Offline Downloader
  const handleDownloadChapter = async (chapterId: number) => {
    if (downloadingChapters[chapterId]) return;
    setDownloadingChapters(prev => ({ ...prev, [chapterId]: true }));
    try {
      await api.fetchHadithsByChapter(chapterId);
      setCachedChapterIds(prev => {
        const next = new Set(prev);
        next.add(chapterId);
        return next;
      });
      triggerToast(language === 'arabic' ? 'تم تحميل الباب للقراءة دون اتصال.' : 'Chapter downloaded for offline reading.');
    } catch (err) {
      console.error("Failed to download chapter:", err);
      triggerToast(language === 'arabic' ? 'فشل تحميل الباب. يرجى التحقق من الاتصال.' : 'Failed to download chapter. Please check connection.');
    } finally {
      setDownloadingChapters(prev => ({ ...prev, [chapterId]: false }));
    }
  };

  // Sync online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Clear all offline cached chapters
  const handleClearOfflineCache = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bukhari_hadiths_chapter_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    setCachedChapterIds(new Set());
    triggerToast(language === 'arabic' ? 'تم مسح الملفات المؤقتة بنجاح.' : 'Offline cache cleared successfully.');
  };

  // Download all chapters for offline reading
  const handleDownloadAllChapters = async () => {
    if (isDownloadingAll) return;
    setIsDownloadingAll(true);
    setDownloadAllError(null);
    downloadCancelRef.current = false;

    let chaptersList = chapters;
    if (chaptersList.length === 0) {
      try {
        chaptersList = await api.fetchChapters();
        setChapters(chaptersList);
      } catch (err) {
        setDownloadAllError(language === 'arabic' ? 'فشل تحميل الفهرس. يرجى التحقق من اتصالك بالإنترنت.' : 'Failed to load index. Please check your internet connection.');
        setIsDownloadingAll(false);
        return;
      }
    }

    const uncachedChapters = chaptersList.filter(c => !cachedChapterIds.has(c.id));
    setDownloadAllTotal(uncachedChapters.length);
    setDownloadAllCurrent(0);

    if (uncachedChapters.length === 0) {
      triggerToast(language === 'arabic' ? 'جميع الأبواب محملة بالفعل.' : 'All chapters are already downloaded.');
      setIsDownloadingAll(false);
      return;
    }

    let completed = 0;
    for (const chapter of uncachedChapters) {
      if (downloadCancelRef.current) {
        triggerToast(language === 'arabic' ? 'تم إلغاء التحميل.' : 'Download cancelled.');
        break;
      }
      try {
        await api.fetchHadithsByChapter(chapter.id);
        setCachedChapterIds(prev => {
          const next = new Set(prev);
          next.add(chapter.id);
          return next;
        });
        completed++;
        setDownloadAllCurrent(completed);
      } catch (err: any) {
        console.error("Offline download error for chapter", chapter.id, err);
        if (err.name === 'QuotaExceededError' || err.message?.includes('quota') || err.message?.includes('storage')) {
          setDownloadAllError(language === 'arabic' ? 'تم تجاوز مساحة التخزين المتاحة للمتصفح.' : 'Browser storage quota exceeded.');
          break;
        } else {
          setDownloadAllError(language === 'arabic' ? 'فشل تحميل بعض الأبواب. يرجى التحقق من اتصال الإنترنت.' : 'Failed to download some chapters. Please check your internet connection.');
          break;
        }
      }
      // Wait 150ms between chapters to not slam API/storage
      await new Promise(resolve => setTimeout(resolve, 150));
    }

    setIsDownloadingAll(false);
    if (!downloadCancelRef.current && !downloadAllError && completed === uncachedChapters.length) {
      triggerToast(language === 'arabic' ? 'تم تحميل جميع الأبواب بنجاح لقراءتها دون اتصال!' : 'All chapters downloaded successfully for offline use!');
    }
  };

  // Adjust Daily Reading Goal Target
  const handleAdjustGoal = (amount: number) => {
    setDailyGoal(prev => {
      const next = Math.max(1, prev + amount);
      localStorage.setItem('bukhari_daily_goal', String(next));
      return next;
    });
  };

  // Shuffle Dynamic Daily Hadith Reflection
  const handleShuffleDailyHadith = async () => {
    try {
      if (chapters.length === 0) return;
      setDailyHadith(null); // Show loading state
      
      // Select a random chapter
      const randomChapter = chapters[Math.floor(Math.random() * chapters.length)];
      if (randomChapter) {
        const hadithsList = await api.fetchHadithsByChapter(randomChapter.id);
        if (hadithsList && hadithsList.length > 0) {
          const randomHadith = hadithsList[Math.floor(Math.random() * hadithsList.length)];
          setDailyHadith(randomHadith);
        } else {
          // Fallback to day of year dynamic load if fetch returns empty
          const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
          const backupChapter = chapters[dayOfYear % chapters.length];
          const backupList = await api.fetchHadithsByChapter(backupChapter.id);
          setDailyHadith(backupList[dayOfYear % backupList.length]);
        }
      }
    } catch (err) {
      console.warn("Failed to shuffle daily hadith", err);
      triggerToast(language === 'arabic' ? 'فشل تغيير الحديث' : 'Failed to shuffle hadith');
    }
  };

  // Handle Daily Hadith Text-to-Speech Narration
  const handlePlayTTS = () => {
    if (!dailyHadith) return;
    
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      triggerToast(language === 'arabic' ? 'المتصفح لا يدعم القراءة الصوتية' : 'Audio narration is not supported by your browser.');
      return;
    }

    if (isPlayingDailyHadith) {
      window.speechSynthesis.cancel();
      setIsPlayingDailyHadith(false);
      return;
    }

    // Stop any current speaking
    window.speechSynthesis.cancel();

    // Format narration text nicely for English reader
    const narratorPart = dailyHadith.englishNarrator ? `${dailyHadith.englishNarrator} narrated: ` : '';
    const cleanTranslation = dailyHadith.translation.replace(/[ﷺ(pbuh)]/g, '').trim();
    const textToSpeak = `Hadith number ${dailyHadith.number} from Book of ${dailyHadith.kitab}. ${narratorPart} ${cleanTranslation}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
      setIsPlayingDailyHadith(false);
    };

    utterance.onerror = (e) => {
      console.warn("TTS utterance error:", e);
      setIsPlayingDailyHadith(false);
    };

    setIsPlayingDailyHadith(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopyArabic = (hadith: Hadith) => {
    navigator.clipboard.writeText(hadith.arabic);
    triggerToast(language === 'arabic' ? 'تم نسخ النص العربي فقط' : 'Arabic text copied to clipboard');
  };

  const handleCopyEnglish = (hadith: Hadith) => {
    navigator.clipboard.writeText(hadith.translation);
    triggerToast(language === 'arabic' ? 'تم نسخ الترجمة الإنجليزية فقط' : 'English translation copied to clipboard');
  };

  const handleCopyFormattedShare = (hadith: Hadith) => {
    const text = `✨ Sahih al-Bukhari Reflection ✨\n` +
      `Hadith Number: ${hadith.number}\n` +
      `📖 Book: ${hadith.kitab}\n` +
      `🌿 Chapter: ${hadith.bab}\n\n` +
      `Arabic:\n${hadith.arabic}\n\n` +
      `Translation:\n"${hadith.translation}"\n\n` +
      `— Shared via Sahih al-Bukhari App`;
    navigator.clipboard.writeText(text);
    triggerToast(language === 'arabic' ? 'تم نسخ النص المنسق بالكامل للمشاركة!' : 'Formatted text copied to clipboard!');
  };

  // Select chapter and load hadiths
  const handleSelectChapter = async (chapterId: number, targetHadithId?: number, selectLastHadith?: boolean, direction?: number) => {
    let ch = chapters.find(c => c.id === chapterId);
    
    // If not found in memory yet, wait until chapters load
    if (!ch && chapters.length === 0) {
      try {
        const loadedChapters = await api.fetchChapters();
        setChapters(loadedChapters);
        ch = loadedChapters.find(c => c.id === chapterId);
      } catch (err) {
        console.error("Failed to load chapters on demand", err);
      }
    }
    
    if (!ch) {
      triggerToast(t.chapterNotFound);
      return;
    }
    
    // Clear search status
    setSearchActive(false);
    
    setActiveChapter(ch);
    setShowToolbar(true);
    setChapterHadiths([]);
    setLoadingHadiths(true);
    setCurrentTab('chapters');

    try {
      const hadithsList = await api.fetchHadithsByChapter(chapterId);
      setChapterHadiths(hadithsList);
      
      let targetIndex = 0;
      if (selectLastHadith) {
        targetIndex = hadithsList.length - 1;
      } else if (targetHadithId) {
        const foundIndex = hadithsList.findIndex(h => h.id === targetHadithId);
        if (foundIndex !== -1) {
          targetIndex = foundIndex;
        }
      }
      setSlideDirection(direction ?? 1);
      setCurrentHadithIndex(targetIndex);
      
      if (targetHadithId) {
        setTimeout(() => {
          const el = document.getElementById(`hadith-card-${targetHadithId}`);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 400);
      }
    } catch (e) {
      console.error("Failed to load chapter hadiths", e);
      triggerToast(t.chapterHadithFailed);
    } finally {
      setLoadingHadiths(false);
    }
  };

  const handleNextHadith = () => {
    if (!activeChapter) return;
    if (currentHadithIndex < chapterHadiths.length - 1) {
      setSlideDirection(1);
      setCurrentHadithIndex(prev => prev + 1);
      if (readingBoxRef.current) {
        readingBoxRef.current.scrollTop = 0;
      }
    } else {
      // Last Hadith in the chapter! Transition to the next chapter.
      const currentChapterIdx = chapters.findIndex(c => c.id === activeChapter.id);
      if (currentChapterIdx !== -1 && currentChapterIdx < chapters.length - 1) {
        const nextChapter = chapters[currentChapterIdx + 1];
        setSlideDirection(1);
        handleSelectChapter(nextChapter.id, undefined, false, 1);
        triggerToast(language === 'arabic' ? 'تم الانتقال للباب التالي' : 'Transitioned to next chapter');
      } else {
        triggerToast(language === 'arabic' ? 'لقد وصلت إلى نهاية الكتاب شريفاً!' : 'You have completed all chapters!');
      }
    }
  };

  const handlePrevHadith = () => {
    if (!activeChapter) return;
    if (currentHadithIndex > 0) {
      setSlideDirection(-1);
      setCurrentHadithIndex(prev => prev - 1);
      if (readingBoxRef.current) {
        readingBoxRef.current.scrollTop = 0;
      }
    } else {
      // First Hadith in current chapter! Go to the last Hadith of the previous chapter.
      const currentChapterIdx = chapters.findIndex(c => c.id === activeChapter.id);
      if (currentChapterIdx > 0) {
        const prevChapter = chapters[currentChapterIdx - 1];
        setSlideDirection(-1);
        handleSelectChapter(prevChapter.id, undefined, true, -1);
        triggerToast(language === 'arabic' ? 'تم الرجوع للباب السابق' : 'Returned to previous chapter');
      }
    }
  };
  // Global Search Functions
  const handleSearch = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const activeQuery = (customQuery ?? searchQuery).trim();
    if (!activeQuery) {
      setSearchActive(false);
      setSearchResults([]);
      setCommittedSearchQuery('');
      return;
    }

    setSearching(true);
    setSearchActive(true);
    setCommittedSearchQuery(activeQuery);
    setActiveChapter(null); // Return to list/search view inside chapters tab
    setShowToolbar(true);
    setCurrentTab('chapters');

    try {
      const results = await api.searchHadiths(activeQuery);
      setSearchResults(results);
    } catch (err) {
      console.error("Search failed", err);
      triggerToast(t.searchFailed);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchActive(false);
    setSearchResults([]);
    setShowToolbar(true);
  };

  // Nav Item click handler
  const handleTabClick = (tab: Tab) => {
    if (tab === 'chapters') {
      setActiveChapter(null);
      setSearchActive(false);
    }
    setCurrentTab(tab);
    setShowToolbar(true);
  };

  return (
    <div className="app-root" dir={language === 'arabic' ? 'rtl' : 'ltr'}>
      <div className="nature-bg-overlay" />
      <div className="nature-ambient-glow" />
      <div className="fade-top" />
      <div className="fade-bottom" />

      {/* Main Content Containers based on active Tab */}
      <main className={`reading-container ${(activeChapter || searchActive) ? 'reader-wide' : ''}`}>
        
        {/* Loading Spinner */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '8rem 0' }}>
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              style={{ display: 'inline-block', marginBottom: '1rem' }}
            >
              <Compass size={32} style={{ color: 'var(--accent-emerald)' }} />
            </motion.div>
            <p>{t.gatherWisdom}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: HOME DASHBOARD */}
            {currentTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="welcome-header">
                  {/* Quick Theme Swatches Selector */}
                  <div 
                    className="theme-selector-container" 
                    style={{ [language === 'arabic' ? 'left' : 'right']: '1.2rem' }}
                  >
                    <AnimatePresence>
                      {showThemeSwatches && (
                        <motion.div 
                          className="theme-swatches-row"
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 'auto', opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden', display: 'flex' }}
                        >
                          {[
                            { id: 'night', color: '#080D0A', name: t.themeNight },
                            { id: 'paper', color: '#F4F8F5', name: t.themePaper },
                            { id: 'sepia', color: '#EFEBDE', name: t.themeSepia },
                            { id: 'indigo', color: '#0A0D1A', name: t.themeIndigo },
                            { id: 'emerald', color: '#04140D', name: t.themeEmerald },
                            { id: 'clay', color: '#B87B52', name: t.themeClay }
                          ].map((item) => (
                            <div
                              key={item.id}
                              className={`theme-swatch-circle ${theme === item.id ? 'active' : ''}`}
                              style={{ backgroundColor: item.color }}
                              onClick={() => setTheme(item.id as Theme)}
                              title={item.name}
                            />
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <button
                      type="button"
                      className="theme-selector-btn"
                      onClick={() => setShowThemeSwatches(!showThemeSwatches)}
                      title={language === 'arabic' ? 'تغيير السمة سريعاً' : 'Change Theme Quickly'}
                    >
                      <Palette size={16} style={{ color: showThemeSwatches ? 'var(--accent-emerald)' : 'var(--text-secondary)' }} />
                    </button>
                  </div>

                  <img src="/app-icon.png" alt="Sahih Bukhari Logo" className="welcome-app-logo" />
                  <div className="welcome-tag">
                    <Sparkles size={18} />
                    <span>{t.spiritualOasis}</span>
                  </div>
                  <h1 className={language === 'arabic' ? 'arabic-text' : ''}>{t.bukhariTitle}</h1>
                  <p>{t.welcomeDesc}</p>
                </div>

                {/* Statistics Row */}
                <div className="dashboard-grid">
                  <div className="stat-card">
                    <div className="stat-number">
                      {formatNumber('7,276')}
                    </div>
                    <div className="stat-label">{t.hadithsCompiled}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {formatNumber(readHadithIds.size)}
                    </div>
                    <div className="stat-label">{t.hadithsRead}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {formatNumber(bookmarkedIds.length)}
                    </div>
                    <div className="stat-label">{t.savedMoments}</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">
                      {formatNumber(notesWithHadiths.length)}
                    </div>
                    <div className="stat-label">{t.insightsRecorded}</div>
                  </div>
                </div>


                {/* Daily Progress & Streak Widget */}
                <div className="progress-streak-widget">
                  {/* Daily Goal Card */}
                  <div className="glass-card goal-card" style={{ padding: '1.75rem', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                      <h4 style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                        {t.dailyGoal}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.goalAdjust}:</span>
                        <button type="button" onClick={() => handleAdjustGoal(-1)} className="goal-adjust-btn"><Minus size={14} /></button>
                        <button type="button" onClick={() => handleAdjustGoal(1)} className="goal-adjust-btn"><Plus size={14} /></button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {formatNumber(readTodayCount)} / {formatNumber(dailyGoal)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {readTodayCount >= dailyGoal ? (
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: 600 }}>{t.goalReached}</span>
                        ) : (
                          `${formatNumber(dailyGoal - readTodayCount)} ${language === 'arabic' ? 'أحاديث متبقية اليوم' : 'hadiths left today'}`
                        )}
                      </span>
                    </div>

                    <div className="chapter-progress-container" style={{ height: '8px', margin: 0 }}>
                      <div 
                        className="chapter-progress-bar" 
                        style={{ width: `${Math.min(100, (readTodayCount / dailyGoal) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Reading Streak Card */}
                  <div className="glass-card streak-card" style={{ padding: '1.75rem', border: '1px solid var(--glass-border)' }}>
                    <div className="streak-flame-container">
                      <Flame size={42} fill="currentColor" />
                    </div>
                    <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ff6b35', lineHeight: 1.1 }}>
                      {formatNumber(streakCount)}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '0.2rem' }}>
                      {t.streak} ({formatNumber(streakCount)} {language === 'arabic' ? 'أيام' : 'Days'})
                    </span>
                  </div>
                </div>

                {/* Reading Analytics & Achievements Section */}
                <div className="glass-card analytics-journey-card" style={{ padding: '1.75rem', marginBottom: '3rem' }}>
                  <button 
                    type="button"
                    className="analytics-header-toggle"
                    onClick={() => {
                      const nextVal = !isAnalyticsExpanded;
                      setIsAnalyticsExpanded(nextVal);
                      localStorage.setItem('bukhari_analytics_expanded', String(nextVal));
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                      <Activity size={20} style={{ color: 'var(--accent-emerald)' }} />
                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
                        {language === 'arabic' ? 'مسيرة القراءة والإنجازات' : 'Reading Analytics & Journey'}
                      </h3>
                    </div>
                    <div className="analytics-toggle-btn" style={{ transform: isAnalyticsExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isAnalyticsExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: '1.5rem' }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div className="analytics-grid">
                          {/* Left Panel: Overall Progress Circle & Plan Selector */}
                          <div className="progress-circle-container">
                            <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                              {language === 'arabic' ? 'الإنجاز الكلي للكتب' : 'Overall Completion'}
                            </h4>
                            
                            {/* Circular progress SVG */}
                            <div style={{ position: 'relative', width: '130px', height: '130px', margin: '0.5rem 0' }}>
                              <svg width="130" height="130" viewBox="0 0 130 130">
                                {/* Background circle */}
                                <circle 
                                  cx="65" 
                                  cy="65" 
                                  r="54" 
                                  fill="transparent" 
                                  stroke="var(--glass-border)" 
                                  strokeWidth="10" 
                                />
                                {/* Progress circle */}
                                <circle 
                                  cx="65" 
                                  cy="65" 
                                  r="54" 
                                  fill="transparent" 
                                  stroke="url(#progressGradient)" 
                                  strokeWidth="10" 
                                  strokeDasharray={`${2 * Math.PI * 54}`}
                                  strokeDashoffset={`${2 * Math.PI * 54 * (1 - overallProgressPercent / 100)}`}
                                  strokeLinecap="round"
                                  className="progress-ring-circle"
                                />
                                <defs>
                                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="var(--accent-emerald)" />
                                    <stop offset="100%" stopColor="var(--accent-gold)" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', lineHeight: 1.1 }}>
                                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                  {formatNumber(overallProgressPercent)}%
                                </span>
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                                  {formatNumber(readHadithIds.size)} / {formatNumber(7276)}
                                </span>
                              </div>
                            </div>

                            {/* Reading Plan Selector */}
                            <div style={{ width: '100%', marginTop: '0.5rem' }}>
                              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                                {language === 'arabic' ? 'خطة القراءة النشطة:' : 'Active Reading Plan:'}
                              </label>
                              <select
                                value={activeReadingPlan}
                                onChange={(e) => {
                                  const plan = e.target.value;
                                  setActiveReadingPlan(plan);
                                  localStorage.setItem('bukhari_active_reading_plan', plan);
                                  // Update daily reading target goal based on plan
                                  let nextGoal = dailyGoal;
                                  if (plan === 'light') nextGoal = 3;
                                  else if (plan === 'medium') nextGoal = 10;
                                  else if (plan === 'heavy') nextGoal = 20;
                                  
                                  if (plan !== 'none') {
                                    setDailyGoal(nextGoal);
                                    localStorage.setItem('bukhari_daily_goal', String(nextGoal));
                                  }
                                }}
                                style={{
                                  width: '100%',
                                  padding: '0.5rem',
                                  background: 'var(--input-bg)',
                                  border: '1px solid var(--glass-border)',
                                  borderRadius: '8px',
                                  color: 'var(--text-primary)',
                                  fontSize: '0.8rem',
                                  outline: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                <option value="none">{language === 'arabic' ? 'لا توجد خطة نشطة' : 'No Reading Plan'}</option>
                                <option value="light">{language === 'arabic' ? 'خطة ميسرة (3 أحاديث/يوم)' : 'Light Plan (3/day)'}</option>
                                <option value="medium">{language === 'arabic' ? 'خطة متوسطة (10 أحاديث/يوم)' : 'Medium Plan (10/day)'}</option>
                                <option value="heavy">{language === 'arabic' ? 'خطة مكثفة (20 حديثاً/يوم)' : 'Heavy Plan (20/day)'}</option>
                              </select>
                              
                              {activeReadingPlan !== 'none' && (
                                <p style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', marginTop: '0.4rem', marginBottom: 0 }}>
                                  {activeReadingPlan === 'light' && (language === 'arabic' ? 'تختم صحيح البخاري خلال 6.6 سنوات' : 'Finish Bukhari in ~6.6 years')}
                                  {activeReadingPlan === 'medium' && (language === 'arabic' ? 'تختم صحيح البخاري خلال سنتين' : 'Finish Bukhari in ~2 years')}
                                  {activeReadingPlan === 'heavy' && (language === 'arabic' ? 'تختم صحيح البخاري خلال عام واحد' : 'Finish Bukhari in ~1 year')}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right Panel: Weekly Activity Bar Chart */}
                          <div className="activity-chart-container">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                              <h4 style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                {language === 'arabic' ? 'نشاط القراءة الأسبوعي' : 'Weekly Reading Activity'}
                              </h4>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                {language === 'arabic' ? 'آخر 7 أيام' : 'Last 7 Days'}
                              </span>
                            </div>

                            <div className="activity-chart-bars">
                              {activityChartData.map((dayData, idx) => {
                                // Find maximum count to scale the bars (with minimum 1 to avoid divide by zero)
                                const maxCount = Math.max(...activityChartData.map(d => d.count), 1);
                                const heightPercent = Math.max(4, (dayData.count / maxCount) * 100);
                                
                                return (
                                  <div key={idx} className="activity-bar-wrapper">
                                    <div className="activity-bar-tooltip">
                                      {formatNumber(dayData.count)} {language === 'arabic' ? 'أحاديث قُرئت' : 'hadiths read'}
                                    </div>
                                    <div 
                                      className="activity-bar" 
                                      style={{ height: `${heightPercent}%` }}
                                    />
                                    <span className="activity-bar-label">
                                      {language === 'arabic' ? dayData.dayNameAr : dayData.dayNameEn}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Achievements / Badges Section */}
                        <div className="badge-achievements-section">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.8rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                            <Award size={16} style={{ color: 'var(--accent-gold)' }} />
                            <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              {language === 'arabic' ? 'الأوسمة والإنجازات الروحية' : 'Spiritual Achievements & Badges'}
                            </h4>
                          </div>
                          
                          <div className="badge-grid">
                            {badgesList.map((badge) => (
                              <div 
                                key={badge.id} 
                                className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
                                title={language === 'arabic' ? badge.descAr : badge.descEn}
                              >
                                <div className="badge-circle">
                                  {badge.unlocked ? (
                                    <span style={{ fontSize: '1.25rem' }}>{badge.icon}</span>
                                  ) : (
                                    <Lock size={15} style={{ color: 'var(--text-secondary)', opacity: 0.6 }} />
                                  )}
                                </div>
                                <span className="badge-name">
                                  {language === 'arabic' ? badge.nameAr : badge.nameEn}
                                </span>
                                <span className="badge-desc">
                                  {language === 'arabic' ? badge.descAr : badge.descEn}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Continue reading panel */}
                {lastReadHadith && (
                  <div className="glass-card" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--glass-border)' }}>
                    <div>
                      <h4 style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                        {t.lastReadingSession}
                      </h4>
                      <p style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{t.hadithShort} {formatNumber(lastReadHadith.number)} —</span>
                        <span style={{ fontFamily: 'var(--font-arabic)', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{lastReadHadith.babArabic || lastReadHadith.bab}</span>
                      </p>
                    </div>
                    <button 
                      className="primary-btn" 
                      onClick={() => handleSelectChapter(lastReadHadith.chapterId || 1, lastReadHadith.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem' }}
                    >
                      {t.resume} {language === 'arabic' ? <ArrowUpLeft size={16} /> : <ArrowUpRight size={16} />}
                    </button>
                  </div>
                )}

                {/* Quick Search on Home Tab */}
                <div className="glass-card" style={{ marginBottom: '3rem', padding: '2rem', border: '1px solid var(--glass-border)' }}>
                  <h4 style={{ color: 'var(--accent-gold)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.8rem' }}>
                    {t.quickSearch}
                  </h4>
                  <form onSubmit={handleSearch} className="quick-search-form">
                    <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Search 
                        size={18} 
                        style={{ 
                          position: 'absolute', 
                          [language === 'arabic' ? 'right' : 'left']: '1.2rem', 
                          color: 'var(--text-secondary)' 
                        }} 
                      />
                      <input
                        type="text"
                        placeholder={t.searchPlaceholderHome}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                          width: '100%',
                          padding: language === 'arabic' 
                            ? '0.8rem 3rem 0.8rem 1rem' 
                            : '0.8rem 1rem 0.8rem 3rem',
                          background: 'var(--input-bg)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '12px',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          outline: 'none',
                          textAlign: language === 'arabic' ? 'right' : 'left'
                        }}
                      />
                    </div>
                    <div className="quick-search-buttons">
                      <button type="submit" className="primary-btn" style={{ padding: '0.8rem 1.4rem', fontSize: '0.85rem' }}>
                        {t.searchBtn}
                      </button>
                      <button 
                        type="button" 
                        onClick={handleDiscoverRandom}
                        className="random-discover-btn"
                        title={language === 'arabic' ? 'اكتشف حديث عشوائي' : 'Discover Random Hadith'}
                      >
                        <Compass size={18} />
                        <span>{language === 'arabic' ? 'اكتشاف عشوائي' : 'Random Discovery'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Popular Discovery Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.2rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: language === 'arabic' ? '0' : '0.5rem', marginLeft: language === 'arabic' ? '0.5rem' : '0' }}>
                      {language === 'arabic' ? 'مواضيع شائعة:' : 'Popular Topics:'}
                    </span>
                    {[
                      { en: 'Faith', ar: 'إيمان' },
                      { en: 'Prayer', ar: 'صلاة' },
                      { en: 'Charity', ar: 'صدقة' },
                      { en: 'Knowledge', ar: 'علم' },
                      { en: 'Intention', ar: 'نية' },
                      { en: 'Good Character', ar: 'أخلاق' }
                    ].map((topic) => (
                      <button
                        key={topic.en}
                        type="button"
                        onClick={() => {
                          const query = language === 'arabic' ? topic.ar : topic.en;
                          setSearchQuery(query);
                          handleSearch(undefined, query);
                        }}
                        className="glass-card"
                        style={{
                          padding: '0.35rem 0.8rem',
                          fontSize: '0.75rem',
                          borderRadius: '8px',
                          color: 'var(--accent-emerald)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: '1px solid var(--glass-border)',
                          background: 'transparent',
                          fontFamily: language === 'arabic' ? 'var(--font-arabic)' : 'inherit'
                        }}
                      >
                        {language === 'arabic' ? topic.ar : topic.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Curated Daily Hadith Reflection */}
                <div className="daily-reflection-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                      <Sparkles size={14} />
                      {t.curatedReflection}
                    </div>
                    <div className="tts-controls-wrapper" style={{ flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                      {/* TTS Wave animation */}
                      {isPlayingDailyHadith && (
                        <div className="tts-wave-container">
                          <div className="tts-bar animating" />
                          <div className="tts-bar animating" />
                          <div className="tts-bar animating" />
                          <div className="tts-bar animating" />
                        </div>
                      )}
                      
                      <button
                        type="button"
                        onClick={handlePlayTTS}
                        className={`tts-icon-btn ${isPlayingDailyHadith ? 'playing' : ''}`}
                        title={isPlayingDailyHadith ? (language === 'arabic' ? 'إيقاف الاستماع' : 'Stop Narration') : (language === 'arabic' ? 'استماع للترجمة' : 'Listen to Translation')}
                      >
                        {isPlayingDailyHadith ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>

                      <button
                        type="button"
                        onClick={handleShuffleDailyHadith}
                        className="shuffle-icon-btn"
                        title={t.shuffleHadith}
                      >
                        <RotateCw size={14} />
                      </button>
                    </div>
                  </div>
                  {dailyHadith ? (
                    <div>
                      {displayMode !== 'translation-only' && (
                        <p className="arabic" style={{ fontFamily: arabicFont, fontSize: '1.6rem', lineHeight: 1.9, marginBottom: '1.5rem', direction: 'rtl', textAlign: textAlignment }}>
                          {colorizeHadithArabic(dailyHadith.arabic)}
                        </p>
                      )}
                      {displayMode !== 'arabic-only' && (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1.5rem', textAlign: language === 'arabic' ? 'right' : 'left' }}>
                          {colorizeHadithEnglish(dailyHadith.translation)}
                        </p>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.05rem' }}>{dailyHadith.kitabArabic || dailyHadith.kitab}</span>
                          <span>•</span>
                          <span>{t.hadithShort} {formatNumber(dailyHadith.number)}</span>
                        </span>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="glass-card"
                            onClick={() => {
                              setActiveShareHadith(dailyHadith);
                            }}
                            style={{ 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.85rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              border: '1px solid var(--glass-border)',
                              background: 'transparent',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              borderRadius: '12px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                          >
                            <Share2 size={14} />
                            <span>{language === 'arabic' ? 'مشاركة كبطاقة' : 'Share Card'}</span>
                          </button>
                          
                          <button 
                            className="primary-btn" 
                            onClick={() => handleSelectChapter(dailyHadith.chapterId || 1, dailyHadith.id)}
                            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                          >
                            {t.readInContext}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      {t.loadingReflection}
                    </div>
                  )}
                </div>

                {/* Narrator Spotlight Widget */}
                {(() => {
                  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
                  const spotlightNarrator = ruwaatsData[dayOfYear % ruwaatsData.length];
                  if (!spotlightNarrator) return null;

                  return (
                    <div className="glass-card narrator-spotlight-card" style={{ padding: '1.75rem', marginBottom: '3rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                          <Users size={14} />
                          {language === 'arabic' ? 'راوي اليوم المتميز' : 'Daily Narrator Spotlight'}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 500, fontFamily: language === 'arabic' ? 'var(--font-arabic)' : 'inherit' }}>
                          {language === 'arabic' ? `${formatNumber(spotlightNarrator.totalNarrations)} رواية` : `${formatNumber(spotlightNarrator.totalNarrations)} Narrations`}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                        <div style={{ flex: 1, minWidth: '280px', textAlign: language === 'arabic' ? 'right' : 'left' }}>
                          <h3 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: language === 'arabic' ? 'flex-end' : 'flex-start' }}>
                            <span>{language === 'arabic' ? spotlightNarrator.arabicName : spotlightNarrator.name}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>
                              ({language === 'arabic' ? spotlightNarrator.titleArabic : spotlightNarrator.title})
                            </span>
                          </h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.6, marginTop: '0.75rem', marginBottom: '1.2rem' }}>
                            {language === 'arabic' ? spotlightNarrator.bioArabic : spotlightNarrator.bio}
                          </p>
                        </div>
                        
                        <div style={{ alignSelf: 'flex-end', marginLeft: language === 'arabic' ? '0' : 'auto', marginRight: language === 'arabic' ? 'auto' : '0' }}>
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => {
                              // Search for narrator's hadiths
                              const query = spotlightNarrator.name;
                              setSearchQuery(query);
                              handleSearch(undefined, query);
                            }}
                            style={{ 
                              padding: '0.5rem 1rem', 
                              fontSize: '0.82rem',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.4rem'
                            }}
                          >
                            <Search size={14} />
                            <span>{language === 'arabic' ? 'استكشاف الأحاديث' : 'Explore Hadiths'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Dashboard Footer */}
                <footer className="dashboard-footer">
                  {/* Spiritual Prayer Card */}
                  <div className="prayer-card">
                    <span className="prayer-card-emoji">🤲</span>
                    <p className={`prayer-card-text ${language === 'arabic' ? 'arabic-text' : ''}`}>
                      {language === 'arabic' ? (
                        "«نسألك يا الله بفضلك وكرمك أن تغفر لي ولوالدي ولأهلي وعائلتي، وأن ترزقني الذرية الصالحة الطيبة المعافاة يا ذا الجلال والإكرام. فضلاً، لا تنسونا وعائلتنا من صالح دعائكم.»"
                      ) : (
                        "\"Please pray for me, my parents, and my family. And pray that Allah grants me a healthy, righteous baby. Please keep us in your sincere prayers.\""
                      )}
                    </p>
                  </div>

                  {/* Copyright and Credits */}
                  <div className={`copyright-credits ${language === 'arabic' ? 'arabic-text' : ''}`}>
                    <p>
                      {language === 'arabic' ? (
                        <>
                          تم التطوير بواسطة <strong>Ibrahimcowke</strong> بمساعدة الذكاء الاصطناعي. التطبيق مجاني ومفتوح المصدر.
                        </>
                      ) : (
                        <>
                          Developed by <strong>Ibrahimcowke</strong> using AI. It is free and open-source.
                        </>
                      )}
                    </p>
                    <p style={{ marginTop: '0.2rem' }}>
                      &copy; {new Date().getFullYear()} Sahih Al-Bukhari. {language === 'arabic' ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'} | {' '}
                      <button 
                        type="button" 
                        onClick={() => setShowPrivacyModal(true)}
                        className="privacy-btn"
                      >
                        {language === 'arabic' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                      </button>
                    </p>
                  </div>
                </footer>
              </motion.div>
            )}

            {/* TAB 2: CHAPTERS INDEX (LIST FAHRS & CHAPTER READING CANVAS) */}
            {currentTab === 'chapters' && (
              <motion.div
                key="chapters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* 1. Main Chapters List View */}
                {!activeChapter && !searchActive && (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <button 
                        onClick={() => handleTabClick('home')}
                        className="glass-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 1.2rem',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--glass-bg)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                          margin: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                      >
                        {language === 'arabic' ? '← الرئيسية' : '← Back to Home'}
                      </button>
                      
                      <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                        <BookOpen size={18} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{formatNumber(chapters.length)} {t.chaptersCount.split(' ')[1] || 'Chapters'}</span>
                      </div>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '2.5rem' }}>{t.chaptersIndex}</h2>

                    {/* Dynamic Search Bar inside Chapters Tab */}
                    <form onSubmit={handleSearch} style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem', width: '100%' }}>
                      <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                        <Search 
                          size={18} 
                          style={{ 
                            position: 'absolute', 
                            [language === 'arabic' ? 'right' : 'left']: '1.2rem', 
                            color: 'var(--text-secondary)' 
                          }} 
                        />
                        <input
                          type="text"
                          placeholder={t.searchPlaceholderChapters}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          style={{
                            width: '100%',
                            padding: language === 'arabic'
                              ? '1rem 3rem 1rem 1rem'
                              : '1rem 1rem 1rem 3rem',
                            background: 'var(--glass-bg)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            fontSize: '0.95rem',
                            outline: 'none',
                            transition: 'all 0.3s ease',
                            textAlign: language === 'arabic' ? 'right' : 'left'
                          }}
                        />
                        {searchQuery && (
                          <button
                            type="button"
                            onClick={handleClearSearch}
                            style={{
                              position: 'absolute',
                              [language === 'arabic' ? 'left' : 'right']: '1.2rem',
                              background: 'none',
                              border: 'none',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                      <button type="submit" className="primary-btn" style={{ padding: '0.8rem 1.6rem' }}>
                        {t.searchBtn}
                      </button>
                    </form>

                    {/* Chapters grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                      {chapters.map(chapter => {
                        const isCached = cachedChapterIds.has(chapter.id);
                        const progress = chapterProgressMap[chapter.id];
                        const isDownloading = downloadingChapters[chapter.id];

                        return (
                          <div 
                            key={chapter.id} 
                            className="glass-card chapter-card" 
                            style={{ 
                              padding: '1.5rem', 
                              cursor: 'pointer', 
                              display: 'flex', 
                              flexDirection: 'column',
                              gap: '0.8rem',
                              transition: 'all 0.2s ease',
                              border: '1px solid var(--glass-border)'
                            }}
                            onClick={() => handleSelectChapter(chapter.id)}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
                              <div style={{ textAlign: language === 'arabic' ? 'right' : 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem', justifyContent: language === 'arabic' ? 'flex-end' : 'flex-start' }}>
                                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    {t.chapterShort} {formatNumber(chapter.chapterNumber)}
                                  </span>
                                  {isCached ? (
                                    <span className="offline-badge" title={t.offlineAvailable}>
                                      <CheckCircle size={10} /> {t.offlineAvailable}
                                    </span>
                                  ) : (
                                    <span className="online-badge" title={t.onlineOnly}>
                                      {t.onlineOnly}
                                    </span>
                                  )}
                                </div>
                                <h3 className="alternative-title" style={{ fontSize: '1.15rem', fontWeight: 500, margin: '0.2rem 0', color: 'var(--text-primary)', textAlign: language === 'arabic' ? 'right' : 'left' }}>
                                  {chapter.chapterEnglish}
                                </h3>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.2rem', color: 'var(--accent-emerald)' }}>
                                  {chapter.chapterArabic}
                                </span>
                                
                                {/* Download button or arrow indicator */}
                                {!isCached ? (
                                  <button
                                    type="button"
                                    disabled={isDownloading}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadChapter(chapter.id);
                                    }}
                                    className="download-badge-btn"
                                    title={isDownloading ? t.downloading : t.download}
                                    style={{ margin: 0 }}
                                  >
                                    <Download size={14} style={{ animation: isDownloading ? 'shimmer-line 1.5s infinite' : 'none' }} />
                                  </button>
                                ) : (
                                  language === 'arabic' ? <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} /> : <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
                                )}
                              </div>
                            </div>

                            {/* Progress bar if cached */}
                            {isCached && progress && (
                              <div style={{ width: '100%', marginTop: '0.4rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                                  <span>{formatNumber(progress.read)} / {formatNumber(progress.total)} {language === 'arabic' ? 'قُرئت' : 'read'}</span>
                                  <span>{formatNumber(progress.percent)}%</span>
                                </div>
                                <div className="chapter-progress-container">
                                  <div 
                                    className="chapter-progress-bar" 
                                    style={{ width: `${progress.percent}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* 2. Global Search Results View */}
                {searchActive && !activeChapter && (
                  <>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem' }}>
                      <button 
                        onClick={handleClearSearch}
                        className="glass-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.6rem 1.2rem',
                          border: '1px solid var(--glass-border)',
                          background: 'var(--glass-bg)',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                      >
                        {t.backToIndex}
                      </button>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>{t.searchResultsFor} "{searchQuery}"</h2>
                    </div>

                    {searching ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '6rem 0' }}>
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          style={{ display: 'inline-block', marginBottom: '1rem' }}
                        >
                          <Compass size={32} style={{ color: 'var(--accent-emerald)' }} />
                        </motion.div>
                        <p>{t.searchingSahih}</p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                        {t.noHadithsFound}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {searchResults.map((hadith) => {
                          const isBookmarked = bookmarkedIds.includes(hadith.id);
                          const hasNote = !!notes[hadith.id];
                          return (
                            <article key={hadith.id} className="hadith-glass-panel">
                              {/* Hadith Header with Arabic Bab Title */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                  <span style={{ 
                                    color: 'var(--accent-gold)', 
                                    fontSize: '1.15rem', 
                                    fontWeight: 500,
                                    fontFamily: 'var(--font-arabic)',
                                    direction: 'rtl'
                                  }}>
                                    {language === 'arabic' ? 'باب: ' : 'Bab: '}{hadith.babArabic || hadith.bab}
                                  </span>
                                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                    {t.hadithShort} {formatNumber(hadith.number)}
                                  </span>
                                </div>
                                {language !== 'arabic' && hadith.babArabic && (
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                    Bab: {hadith.bab}
                                  </span>
                                )}
                              </div>

                              {showSanad && displayMode !== 'arabic-only' && hadith.englishNarrator && (
                                <div style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.2rem' }}>
                                  {hadith.englishNarrator}
                                </div>
                              )}

                              <div className="hadith-text-layout">
                                {displayMode !== 'translation-only' && (
                                  <div className="arabic" style={{ fontFamily: arabicFont, fontSize: 'var(--font-scale-arabic)', lineHeight: 1.9, marginBottom: '2rem', direction: 'rtl', textAlign: textAlignment }}>
                                    {committedSearchQuery ? highlightText(hadith.arabic, committedSearchQuery) : colorizeHadithArabic(hadith.arabic)}
                                  </div>
                                )}

                                {displayMode !== 'arabic-only' && (
                                  <div className="translation" style={{ fontSize: 'var(--font-scale-translation)', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '2rem', textAlign: language === 'arabic' ? 'right' : 'left' }}>
                                    {committedSearchQuery ? highlightText(hadith.translation, committedSearchQuery) : colorizeHadithEnglish(hadith.translation)}
                                  </div>
                                )}
                              </div>

                              {hasNote && (
                                <div style={{ 
                                  background: 'var(--accent-emerald-light)', 
                                  padding: '1.25rem 1.5rem', 
                                  borderRadius: '16px', 
                                  marginBottom: '2rem', 
                                  fontSize: '0.9rem', 
                                  borderLeft: language === 'arabic' ? 'none' : '3px solid var(--accent-emerald)',
                                  borderRight: language === 'arabic' ? '3px solid var(--accent-emerald)' : 'none',
                                  color: 'var(--text-primary)' 
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                                    <FileText size={12} />
                                    {t.reflectionsLabel}
                                  </div>
                                  <p style={{ fontStyle: 'italic' }}>"{notes[hadith.id]}"</p>
                                </div>
                              )}

                              <div className="hadith-actions">
                                <button className={`action-btn ${isBookmarked ? 'active' : ''}`} onClick={() => handleToggleBookmark(hadith)}>
                                  <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                                  <span>{isBookmarked ? t.saved : t.save}</span>
                                </button>
                                <button className={`action-btn ${readHadithIds.has(hadith.id) ? 'active' : ''}`} onClick={() => handleToggleRead(hadith.id)}>
                                  <CheckCircle size={15} fill={readHadithIds.has(hadith.id) ? "currentColor" : "none"} style={{ color: readHadithIds.has(hadith.id) ? 'var(--accent-emerald)' : 'inherit' }} />
                                  <span>{readHadithIds.has(hadith.id) ? t.markUnread : t.markRead}</span>
                                </button>
                                <button className={`action-btn ${hasNote ? 'active' : ''}`} onClick={() => handleOpenNoteModal(hadith)}>
                                  <FileText size={15} />
                                  <span>{hasNote ? t.editNote : t.addNote}</span>
                                </button>
                                <button className={`action-btn ${playingHadithId === hadith.id ? 'active' : ''}`} onClick={() => handleToggleAudio(hadith)}>
                                  {playingHadithId === hadith.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                  <span>{playingHadithId === hadith.id ? t.stop : t.listen}</span>
                                </button>
                                <button className="action-btn" onClick={() => handleCopyArabic(hadith)}>
                                  <Copy size={15} />
                                  <span>{t.copyArabic}</span>
                                </button>
                                {displayMode !== 'arabic-only' && (
                                  <button className="action-btn" onClick={() => handleCopyEnglish(hadith)}>
                                    <Copy size={15} />
                                    <span>{t.copyEnglish}</span>
                                  </button>
                                )}
                                <button className="action-btn" onClick={() => handleShare(hadith)}>
                                  <Share2 size={15} />
                                  <span>{t.share}</span>
                                </button>
                                <button className="primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => handleSelectChapter(hadith.chapterId || 1, hadith.id)}>
                                  {t.readInContext}
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* 3. Single Chapter Reading View */}
                {activeChapter && (
                  <>
                    <button 
                      onClick={() => setActiveChapter(null)}
                      className="glass-card"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 1.2rem',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--glass-bg)',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        marginBottom: '2rem',
                        transition: 'all 0.2s ease',
                        width: 'fit-content'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      {language === 'arabic' ? '← العودة للفهرس' : '← Back to Fahrs'}
                    </button>

                    <div className="chapter-header">
                      <span className="chapter-meta">
                        {t.chapterShort} {formatNumber(activeChapter.chapterNumber)}
                      </span>
                      <h1 className="chapter-title-arabic">
                        {activeChapter.chapterArabic}
                      </h1>
                      <p className="chapter-title-english">
                        {activeChapter.chapterEnglish}
                      </p>
                    </div>

                    {loadingHadiths ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '6rem 0' }}>
                        <motion.div 
                          animate={{ rotate: 360 }} 
                          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                          style={{ display: 'inline-block', marginBottom: '1rem' }}
                        >
                          <Compass size={32} style={{ color: 'var(--accent-emerald)' }} />
                        </motion.div>
                        <p>{t.retrievingHadiths}</p>
                      </div>
                    ) : (
                      <div>
                        {readingLayout === 'scroll' ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                            {chapterHadiths.map((hadith) => {
                              const isBookmarked = bookmarkedIds.includes(hadith.id);
                              const hasNote = !!notes[hadith.id];
                              return (
                                <div 
                                  key={hadith.id} 
                                  id={`hadith-card-${hadith.id}`}
                                  ref={el => { hadithRefs.current[hadith.id] = el; }}
                                  data-hadith-id={hadith.id}
                                >
                                  <motion.article 
                                    className="hadith-glass-panel"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-120px" }}
                                    transition={{ duration: 0.8 }}
                                  >
                                    {/* Hadith Header with Arabic Bab Title */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '2.5rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <span style={{ 
                                          color: 'var(--accent-gold)', 
                                          fontSize: '1.15rem', 
                                          fontWeight: 500,
                                          fontFamily: 'var(--font-arabic)',
                                          direction: 'rtl'
                                        }}>
                                          {language === 'arabic' ? 'باب: ' : 'Bab: '}{hadith.babArabic || hadith.bab}
                                        </span>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                          {t.hadithShort} {formatNumber(hadith.number)}
                                        </span>
                                      </div>
                                      {language !== 'arabic' && hadith.babArabic && (
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                          Bab: {hadith.bab}
                                        </span>
                                      )}
                                    </div>

                                    {/* English Narrator Chain */}
                                    {showSanad && displayMode !== 'arabic-only' && hadith.englishNarrator && (
                                      <div style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                                        {hadith.englishNarrator}
                                      </div>
                                    )}

                                    {/* Text content layout */}
                                    <div className="hadith-text-layout">
                                      {/* Arabic text */}
                                      {displayMode !== 'translation-only' && (
                                        <div className="arabic" style={{ fontFamily: arabicFont, textAlign: textAlignment, fontSize: 'var(--font-scale-arabic)', lineHeight: 1.9, marginBottom: '2.5rem', direction: 'rtl' }}>
                                          {colorizeHadithArabic(hadith.arabic)}
                                        </div>
                                      )}

                                      {/* English Translation */}
                                      {displayMode !== 'arabic-only' && (
                                        <div className="translation" style={{ textAlign: language === 'arabic' ? 'right' : 'left', fontSize: 'var(--font-scale-translation)', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '2.5rem' }}>
                                          {colorizeHadithEnglish(hadith.translation)}
                                        </div>
                                      )}
                                    </div>

                                    {/* Note block if exists */}
                                    {hasNote && (
                                      <div style={{ 
                                        background: 'var(--accent-emerald-light)', 
                                        padding: '1.25rem 1.5rem', 
                                        borderRadius: '16px',
                                        marginBottom: '2rem',
                                        fontSize: '0.9rem',
                                        borderLeft: language === 'arabic' ? 'none' : '3px solid var(--accent-emerald)',
                                        borderRight: language === 'arabic' ? '3px solid var(--accent-emerald)' : 'none',
                                        color: 'var(--text-primary)'
                                      }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                                          <FileText size={12} />
                                          {t.reflectionsLabel}
                                        </div>
                                        <p style={{ fontStyle: 'italic' }}>"{notes[hadith.id]}"</p>
                                      </div>
                                    )}

                                    {/* Actions */}
                                    {!focusMode && (
                                      <div className="hadith-actions">
                                        <button 
                                          className={`action-btn ${isBookmarked ? 'active' : ''}`}
                                          onClick={() => handleToggleBookmark(hadith)}
                                        >
                                          <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                                          <span>{isBookmarked ? t.saved : t.save}</span>
                                        </button>

                                        <button 
                                          className={`action-btn ${readHadithIds.has(hadith.id) ? 'active' : ''}`}
                                          onClick={() => handleToggleRead(hadith.id)}
                                        >
                                          <CheckCircle size={15} fill={readHadithIds.has(hadith.id) ? "currentColor" : "none"} style={{ color: readHadithIds.has(hadith.id) ? 'var(--accent-emerald)' : 'inherit' }} />
                                          <span>{readHadithIds.has(hadith.id) ? t.markUnread : t.markRead}</span>
                                        </button>

                                        <button 
                                          className={`action-btn ${hasNote ? 'active' : ''}`}
                                          onClick={() => handleOpenNoteModal(hadith)}
                                        >
                                          <FileText size={15} />
                                          <span>{hasNote ? t.editNote : t.addNote}</span>
                                        </button>

                                        <button 
                                          className={`action-btn ${playingHadithId === hadith.id ? 'active' : ''}`}
                                          onClick={() => handleToggleAudio(hadith)}
                                        >
                                          {playingHadithId === hadith.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                          <span>{playingHadithId === hadith.id ? t.stop : t.listen}</span>
                                        </button>

                                        <button 
                                          className="action-btn"
                                          onClick={() => handleCopyArabic(hadith)}
                                        >
                                          <Copy size={15} />
                                          <span>{t.copyArabic}</span>
                                        </button>

                                        {displayMode !== 'arabic-only' && (
                                          <button 
                                            className="action-btn"
                                            onClick={() => handleCopyEnglish(hadith)}
                                          >
                                            <Copy size={15} />
                                            <span>{t.copyEnglish}</span>
                                          </button>
                                        )}

                                        <button 
                                          className="action-btn"
                                          onClick={() => handleShare(hadith)}
                                        >
                                          <Share2 size={15} />
                                          <span>{t.share}</span>
                                        </button>
                                      </div>
                                    )}
                                  </motion.article>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          /* Page-by-page view layout */
                          (() => {
                            const hadith = chapterHadiths[currentHadithIndex];
                            if (!hadith) return null;
                            const isBookmarked = bookmarkedIds.includes(hadith.id);
                            const hasNote = !!notes[hadith.id];
                            const isFirst = currentHadithIndex === 0;
                            const isLast = currentHadithIndex === chapterHadiths.length - 1;
                            
                            // Check if there are other chapters
                            const currentChapterIdx = chapters.findIndex(c => c.id === activeChapter.id);
                            const hasPrevChapter = currentChapterIdx > 0;
                            const hasNextChapter = currentChapterIdx !== -1 && currentChapterIdx < chapters.length - 1;
                            
                            return (
                              <div className="hadith-page-view-wrapper">
                                <AnimatePresence mode="wait" initial={false}>
                                  <motion.div
                                    key={hadith.id}
                                    initial={{ opacity: 0, x: slideDirection * 150 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -slideDirection * 150 }}
                                    transition={{ duration: 0.35, ease: "easeInOut" }}
                                  >
                                    <article className="hadith-glass-panel" id={`hadith-card-${hadith.id}`}>
                                      {/* Hadith Header with Arabic Bab Title */}
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginBottom: '2.5rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                          <span style={{ 
                                            color: 'var(--accent-gold)', 
                                            fontSize: '1.15rem', 
                                            fontWeight: 500,
                                            fontFamily: 'var(--font-arabic)',
                                            direction: 'rtl'
                                          }}>
                                            {language === 'arabic' ? 'باب: ' : 'Bab: '}{hadith.babArabic || hadith.bab}
                                          </span>
                                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            {t.hadithShort} {formatNumber(hadith.number)}
                                          </span>
                                        </div>
                                        {language !== 'arabic' && hadith.babArabic && (
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                                            Bab: {hadith.bab}
                                          </span>
                                        )}
                                      </div>

                                      {/* Scrollable container box for Hadith text content */}
                                      <div className="hadith-scroll-box" ref={readingBoxRef}>
                                        {/* English Narrator Chain */}
                                        {showSanad && displayMode !== 'arabic-only' && hadith.englishNarrator && (
                                          <div style={{ color: 'var(--accent-emerald)', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '1.2rem', lineHeight: 1.5 }}>
                                            {hadith.englishNarrator}
                                          </div>
                                        )}

                                        {/* Text content layout */}
                                        <div className="hadith-text-layout">
                                          {/* Arabic text */}
                                          {displayMode !== 'translation-only' && (
                                            <div className="arabic" style={{ fontFamily: arabicFont, textAlign: textAlignment, fontSize: 'var(--font-scale-arabic)', lineHeight: 1.9, marginBottom: '2.5rem', direction: 'rtl' }}>
                                              {colorizeHadithArabic(hadith.arabic)}
                                            </div>
                                          )}

                                          {/* English Translation */}
                                          {displayMode !== 'arabic-only' && (
                                            <div className="translation" style={{ textAlign: language === 'arabic' ? 'right' : 'left', fontSize: 'var(--font-scale-translation)', lineHeight: 1.7, color: 'var(--text-primary)', marginBottom: '2.5rem' }}>
                                              {colorizeHadithEnglish(hadith.translation)}
                                            </div>
                                          )}
                                        </div>

                                        {/* Note block if exists */}
                                        {hasNote && (
                                          <div style={{ 
                                            background: 'var(--accent-emerald-light)', 
                                            padding: '1.25rem 1.5rem', 
                                            borderRadius: '16px',
                                            marginBottom: '2rem',
                                            fontSize: '0.9rem',
                                            borderLeft: language === 'arabic' ? 'none' : '3px solid var(--accent-emerald)',
                                            borderRight: language === 'arabic' ? '3px solid var(--accent-emerald)' : 'none',
                                            color: 'var(--text-primary)'
                                          }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                                              <FileText size={12} />
                                              {t.reflectionsLabel}
                                            </div>
                                            <p style={{ fontStyle: 'italic' }}>"{notes[hadith.id]}"</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Actions */}
                                      {!focusMode && (
                                        <div className="hadith-actions">
                                          <button 
                                            className={`action-btn ${isBookmarked ? 'active' : ''}`}
                                            onClick={() => handleToggleBookmark(hadith)}
                                          >
                                            <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                                            <span>{isBookmarked ? t.saved : t.save}</span>
                                          </button>

                                          <button 
                                            className={`action-btn ${readHadithIds.has(hadith.id) ? 'active' : ''}`}
                                            onClick={() => handleToggleRead(hadith.id)}
                                          >
                                            <CheckCircle size={15} fill={readHadithIds.has(hadith.id) ? "currentColor" : "none"} style={{ color: readHadithIds.has(hadith.id) ? 'var(--accent-emerald)' : 'inherit' }} />
                                            <span>{readHadithIds.has(hadith.id) ? t.markUnread : t.markRead}</span>
                                          </button>

                                          <button 
                                            className={`action-btn ${hasNote ? 'active' : ''}`}
                                            onClick={() => handleOpenNoteModal(hadith)}
                                          >
                                            <FileText size={15} />
                                            <span>{hasNote ? t.editNote : t.addNote}</span>
                                          </button>

                                          <button 
                                            className={`action-btn ${playingHadithId === hadith.id ? 'active' : ''}`}
                                            onClick={() => handleToggleAudio(hadith)}
                                          >
                                            {playingHadithId === hadith.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                            <span>{playingHadithId === hadith.id ? t.stop : t.listen}</span>
                                          </button>

                                          <button 
                                            className="action-btn"
                                            onClick={() => handleCopyArabic(hadith)}
                                          >
                                            <Copy size={15} />
                                            <span>{t.copyArabic}</span>
                                          </button>

                                          <button 
                                            className="action-btn"
                                            onClick={() => handleCopyEnglish(hadith)}
                                          >
                                            <Copy size={15} />
                                            <span>{t.copyEnglish}</span>
                                          </button>

                                          <button 
                                            className="action-btn"
                                            onClick={() => handleShare(hadith)}
                                          >
                                            <Share2 size={15} />
                                            <span>{t.share}</span>
                                          </button>
                                        </div>
                                      )}
                                    </article>
                                  </motion.div>
                                </AnimatePresence>

                                {/* Pagination controls */}
                                <div className="hadith-page-nav" style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                  <button
                                    type="button"
                                    disabled={isFirst && !hasPrevChapter}
                                    onClick={(e) => { e.preventDefault(); handlePrevHadith(); }}
                                    className="glass-card"
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.5rem',
                                      padding: '0.9rem 1.25rem',
                                      cursor: (isFirst && !hasPrevChapter) ? 'not-allowed' : 'pointer',
                                      opacity: (isFirst && !hasPrevChapter) ? 0.4 : 1,
                                      border: '1px solid var(--glass-border)',
                                      background: 'var(--glass-bg)',
                                      color: 'var(--text-primary)',
                                      borderRadius: '14px',
                                      fontSize: '0.9rem',
                                      minHeight: '48px',
                                      transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={(e) => { if (!(isFirst && !hasPrevChapter)) e.currentTarget.style.borderColor = 'var(--accent-emerald)'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
                                  >
                                    <span>
                                      {isFirst 
                                        ? (hasPrevChapter ? t.prevChapterBtn : t.prevHadith)
                                        : t.prevHadith
                                      }
                                    </span>
                                  </button>

                                  <button
                                    type="button"
                                    disabled={isLast && !hasNextChapter}
                                    onClick={(e) => { e.preventDefault(); handleNextHadith(); }}
                                    className="primary-btn"
                                    style={{
                                      flex: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      gap: '0.5rem',
                                      padding: '0.9rem 1.25rem',
                                      background: isLast ? 'var(--accent-gold)' : 'var(--accent-emerald)',
                                      borderColor: isLast ? 'var(--accent-gold)' : 'var(--accent-emerald)',
                                      color: 'white',
                                      borderRadius: '14px',
                                      cursor: (isLast && !hasNextChapter) ? 'not-allowed' : 'pointer',
                                      opacity: (isLast && !hasNextChapter) ? 0.4 : 1,
                                      fontSize: '0.9rem',
                                      minHeight: '48px',
                                      transition: 'all 0.2s'
                                    }}
                                  >
                                    <span>
                                      {isLast 
                                        ? (hasNextChapter ? t.nextChapterBtn : t.nextHadith)
                                        : t.nextHadith
                                      }
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })()
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* TAB 3: NARRATORS DIRECTORY (RUWAATS) */}
            {currentTab === 'narrators' && (
              <motion.div
                key="narrators"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>
                    {language === 'arabic' ? 'المؤلف والرواة' : 'The Author & Narrators'}
                  </h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {language === 'arabic' 
                      ? 'تعرف على سيرة الإمام البخاري (المؤلف) والصحابة الكرام الذين نقلوا أحاديث وسنن النبي ﷺ.' 
                      : 'Explore the life of Imam al-Bukhari (the Compiler) and the noble companions who narrated the Prophet’s sunnah.'}
                  </p>
                </div>

                {/* Segmented Sub-nav Bar */}
                <div className="sub-tab-nav">
                  <button
                    type="button"
                    className={`sub-tab-btn ${ruwaatSubTab === 'author' ? 'active' : ''}`}
                    onClick={() => setRuwaatSubTab('author')}
                  >
                    <span>✒️</span>
                    <span>{language === 'arabic' ? 'سيرة المؤلف' : 'Imam Al-Bukhari'}</span>
                  </button>
                  <button
                    type="button"
                    className={`sub-tab-btn ${ruwaatSubTab === 'narrators' ? 'active' : ''}`}
                    onClick={() => setRuwaatSubTab('narrators')}
                  >
                    <span>👥</span>
                    <span>{language === 'arabic' ? 'رواة الأحاديث' : 'Hadith Narrators'}</span>
                  </button>
                </div>

                {ruwaatSubTab === 'author' ? (
                  /* 1. Imam Al-Bukhari Premium Card */
                  <div className="glass-card author-featured-card" style={{ padding: '2rem', marginBottom: '3rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', flexDirection: language === 'arabic' ? 'row-reverse' : 'row' }}>
                      <div style={{ textAlign: language === 'arabic' ? 'right' : 'left' }}>
                        <div className="author-title-badge" style={{ marginBottom: '0.8rem' }}>
                          <Award size={13} />
                          {language === 'arabic' ? 'أمير المؤمنين في الحديث' : 'Commander of the Faithful in Hadith'}
                        </div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, fontFamily: language === 'arabic' ? 'var(--font-arabic)' : 'inherit' }}>
                          {language === 'arabic' ? 'الإمام أبو عبد الله البخاري' : 'Imam Al-Bukhari'}
                        </h2>
                        <span style={{ fontSize: '0.9rem', color: 'var(--accent-emerald)', fontWeight: 500, display: 'block', marginTop: '0.2rem' }}>
                          {language === 'arabic' 
                            ? 'محمد بن إسماعيل بن إبراهيم البخاري' 
                            : 'Muhammad ibn Isma\'il al-Bukhari'}
                        </span>
                      </div>
                      
                      {/* Compilation Stat Badge */}
                      <div style={{ background: 'var(--accent-gold-light)', border: '1px solid rgba(210, 183, 115, 0.3)', padding: '0.5rem 1rem', borderRadius: '12px', textAlign: 'center' }}>
                        <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                          {formatNumber('16')}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          {language === 'arabic' ? 'عاماً من البحث والجمع' : 'Years of Compilation'}
                        </span>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', lineHeight: 1.65, marginTop: '1.2rem', marginBottom: '1.8rem', textAlign: language === 'arabic' ? 'right' : 'left' }}>
                      {language === 'arabic' 
                        ? 'هو إمام الحفاظ وجامع أصح كتب السنة النبوية المطهرة. ولد في بخارى ونشأ يتيماً، فكرس حياته للارتحال طلباً للعلم وحفظ السنن، واشتهر بالورع والتقوى والذكاء الخارق والذاكرة الفولاذية.' 
                        : 'The legendary Islamic scholar and master of prophetic traditions. Born in Bukhara, Uzbekistan, he grew up as an orphan and dedicated his life to traveling across the Islamic world to collect, verify, and document authentic hadiths.'}
                    </p>

                    {/* Author Fact Grid */}
                    <div className="author-fact-grid">
                      <div className="author-fact-box">
                        <div className="author-fact-value">{formatNumber('194 AH')}</div>
                        <div className="author-fact-label">{language === 'arabic' ? 'الميلاد (بخارى)' : 'Birth (Bukhara)'}</div>
                      </div>
                      <div className="author-fact-box">
                        <div className="author-fact-value">{formatNumber('256 AH')}</div>
                        <div className="author-fact-label">{language === 'arabic' ? 'الوفاة (خرتنك)' : 'Death (Khartank)'}</div>
                      </div>
                      <div className="author-fact-box">
                        <div className="author-fact-value">{formatNumber('600,000')}</div>
                        <div className="author-fact-label">{language === 'arabic' ? 'حديث خضع للتمحيص' : 'Hadiths Screened'}</div>
                      </div>
                      <div className="author-fact-box">
                        <div className="author-fact-value">{formatNumber('7,276')}</div>
                        <div className="author-fact-label">{language === 'arabic' ? 'حديث في الصحيح' : 'Hadiths in Sahih'}</div>
                      </div>
                    </div>

                    {/* Famous Devotional Quote */}
                    <div className="author-quote-box">
                      <p className="author-quote-text" style={{ textAlign: language === 'arabic' ? 'right' : 'left', fontFamily: language === 'arabic' ? 'var(--font-arabic)' : 'inherit', fontSize: language === 'arabic' ? '1.15rem' : '0.95rem' }}>
                        {language === 'arabic' 
                          ? '«ما وضعت في كتابي الصحيح حديثًا إلا اغتسلت قبل ذلك وصليت ركعتين.»' 
                          : '"I did not write any Hadith in this book except that I performed a bath (ghusl) and prayed two units of prayer (rak\'ah) first."'}
                      </p>
                    </div>

                    {/* Expandable biography text toggled by button */}
                    <div style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => setIsAuthorBioExpanded(!isAuthorBioExpanded)}
                        className="glass-card"
                        style={{
                          padding: '0.6rem 1.4rem',
                          fontSize: '0.85rem',
                          borderRadius: '12px',
                          border: '1px solid var(--glass-border)',
                          cursor: 'pointer',
                          color: 'var(--text-primary)',
                          background: 'transparent',
                          transition: 'all 0.2s ease',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                      >
                        <span>{isAuthorBioExpanded 
                          ? (language === 'arabic' ? 'إغلاق التفاصيل' : 'Hide Details') 
                          : (language === 'arabic' ? 'اقرأ سيرة الإمام كاملة' : 'Read Full Biography')}</span>
                        <ChevronDown size={14} style={{ transform: isAuthorBioExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isAuthorBioExpanded && (
                        <motion.div
                          className="author-expanded-story"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.35 }}
                          style={{ overflow: 'hidden', textAlign: language === 'arabic' ? 'right' : 'left' }}
                        >
                          {/* 1. Journey */}
                          <div className="author-section-heading">
                            {language === 'arabic' ? 'رحلته في طلب العلم والاستقصاء' : 'His Journeys for Hadith'}
                          </div>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                            {language === 'arabic'
                              ? 'سافر الإمام البخاري في سن السادسة عشرة بصحبة أمه وأخيه لأداء مناسك الحج، وبقي هناك في الحجاز مجاوراً لطلب العلم. ثم رحل طيلة ستة عشر عاماً إلى معظم عواصم العلم الإسلامي آنذاك، فارتحل إلى البصرة، الكوفة، بغداد، المدينة، مكة، مصر، الشام، والري. ولقي خلال رحلاته أكثر من ألف شيخ ومحدث، وكتب وصنف تاريخه الشهير وهو بجوار قبر النبي ﷺ.'
                              : 'At the young age of 16, he set off for pilgrimage in Makkah alongside his mother and brother, remaining in the Hijaz to study under its elite scholars. He spent the next 16 years traveling through Iraq, Syria, Egypt, Basra, Kufa, Baghdad, and the Levant. Throughout these extensive travels, he met over a thousand scholars, recording and cross-referencing chains of transmissions.'}
                          </p>

                          {/* 2. Conditions */}
                          <div className="author-section-heading">
                            {language === 'arabic' ? 'شروط البخاري الصارمة لتصحيح الحديث' : 'His Strict Conditions of Authenticity'}
                          </div>
                          <ul className="author-conditions-list">
                            <li className="author-condition-item">
                              <span className="author-condition-bullet">✦</span>
                              <div>
                                <strong>{language === 'arabic' ? 'الاتصال الكامل للسند:' : 'Connected Chain (Ittisal):'}</strong>{' '}
                                {language === 'arabic' ? 'يجب أن يكون السند متصلاً اتصالاً قاطعاً دون أي انقطاع أو إرسال.' : 'Every narrator must have received the Hadith directly from the previous authority.'}
                              </div>
                            </li>
                            <li className="author-condition-item">
                              <span className="author-condition-bullet">✦</span>
                              <div>
                                <strong>{language === 'arabic' ? 'عدالة الرواة وضبطهم:' : 'Integrity & Precision (Adalah & Dabt):'}</strong>{' '}
                                {language === 'arabic' ? 'كل راوٍ في السند يجب أن يكون معروفاً بالأمانة الدينية والصدق، والدقة البالغة في الحفظ والنقل.' : 'Narrators must possess high religious and moral character, alongside flawless memorization.'}
                              </div>
                            </li>
                            <li className="author-condition-item">
                              <span className="author-condition-bullet">✦</span>
                              <div>
                                <strong>{language === 'arabic' ? 'إثبات اللقاء والملاقاة المعاصرة:' : 'Proven Contact (Liqa\'):'}</strong>{' '}
                                {language === 'arabic' ? 'تميز البخاري بشرطه الفريد وهو إثبات التقاء كل راوٍ بشيخه ولو لمرة واحدة في حياتهما، ولا يكتفي بمجرد المعاصرة الزمنية.' : 'Unique to Imam Bukhari, he required absolute proof that two consecutive narrators in the chain met face-to-face, not merely lived at the same time.'}
                              </div>
                            </li>
                            <li className="author-condition-item">
                              <span className="author-condition-bullet">✦</span>
                              <div>
                                <strong>{language === 'arabic' ? 'السلامة من الشذوذ والعلة القادحة:' : 'Free from Shadhdh & \'Illah:'}</strong>{' '}
                                {language === 'arabic' ? 'ألا يكون متن الحديث أو إسناده شاذاً أو معلولاً بعلة خفية تقدح في صحته.' : 'The tradition must not contradict a stronger source or contain subtle defects in its wording or chain.'}
                              </div>
                            </li>
                          </ul>

                          {/* 3. Memory test */}
                          <div className="author-section-heading">
                            {language === 'arabic' ? 'حفظه وقصة اختبار بغداد الشهيرة' : 'His Miraculous Memory: The Baghdad Test'}
                          </div>
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 0 }}>
                            {language === 'arabic'
                              ? 'عندما قدم بغداد، أراد علماء الحديث اختبار قوة حفظه؛ فاجتمع عشرة علماء، وقام كل واحد منهم بتركيب متون أحاديث على أسانيد غير أسانيدها (بقلب مائة حديث). فلما ألقوها عليه، كان جوابه لكل حديث: «لا أعرفه». فظن الجهال أنه عاجز، بينما علم العلماء أنه أدرك الاختبار. فلما فرغوا، قام بسرد الأحاديث المائة بخلطها الذي ذكروه، ثم رد كل متن إلى إسناده الصحيح واحداً تلو الآخر بالترتيب دون خطأ واحد، فأقر له الجميع بالحفظ والسيادة.'
                              : 'Upon his arrival in Baghdad, ten prominent scholars gathered to test his memory. They shuffled the chains of transmission (sanad) of 100 hadiths, changing which narrator went with which text. They recited them to him one by one. To each, he replied, "I do not recognize it." The crowd thought he was ignorant, but the scholars knew he saw the test. Once they finished, he repeated all 100 wrong versions exactly as they had read them, and then paired each text back to its correct chain from memory, completely flawless. The scholars stood up and bowed in respect of his unparalleled mastery.'}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  /* 2. Standard Narrators loop */
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {ruwaatsData.map((narrator) => {
                      const isExpanded = expandedNarrator === narrator.id;
                      return (
                        <div 
                          key={narrator.id} 
                          className="narrator-card"
                          style={{ cursor: 'pointer', border: '1px solid var(--glass-border)' }}
                          onClick={() => setExpandedNarrator(isExpanded ? null : narrator.id)}
                        >
                          <div className="narrator-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h3 style={{ fontSize: '1.2rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {language === 'arabic' ? narrator.arabicName : narrator.name}
                                {language !== 'arabic' && (
                                  <span style={{ fontSize: '1rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-arabic)' }}>
                                    ({narrator.arabicName})
                                  </span>
                                )}
                              </h3>
                              <span className="narrator-title" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                                {language === 'arabic' ? narrator.titleArabic : narrator.title}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontSize: '0.85rem', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 600 }}>
                                {formatNumber(narrator.totalNarrations)} {t.hadithsCount}
                              </span>
                              {isExpanded ? <ChevronDown size={18} /> : (language === 'arabic' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />)}
                            </div>
                          </div>

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ overflow: 'hidden' }}
                              >
                                <p style={{ 
                                  color: 'var(--text-secondary)', 
                                  fontSize: '0.95rem', 
                                  lineHeight: 1.7, 
                                  paddingTop: '1rem', 
                                  fontStyle: 'italic',
                                  textAlign: language === 'arabic' ? 'right' : 'left'
                                }}>
                                  {language === 'arabic' ? narrator.bioArabic : narrator.bio}
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 4: BOOKMARKS & NOTES (MOMENTS) */}
            {currentTab === 'bookmarks' && (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t.savedMomentsTitle}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t.savedMomentsDesc}
                  </p>
                </div>

                {/* Bookmarks Section */}
                <h3 style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bookmark size={14} /> {t.bookmarksLabel} ({formatNumber(bookmarkedHadiths.length)})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
                  {bookmarkedHadiths.length > 0 ? (
                    bookmarkedHadiths.map(h => (
                      <div key={h.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', border: '1px solid var(--glass-border)' }}>
                        <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelectChapter(h.chapterId || 1, h.id)}>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.3rem', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <span style={{ fontFamily: 'var(--font-arabic)' }}>{h.kitabArabic || h.kitab}</span>
                            <span>•</span>
                            <span>{t.hadithShort} {formatNumber(h.number)}</span>
                          </div>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', textAlign: language === 'arabic' ? 'right' : 'left' }}>
                            {language === 'arabic' ? h.arabic : h.translation}
                          </p>
                        </div>
                        <button 
                          onClick={() => handleToggleBookmark(h)}
                          style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', padding: '0.5rem' }}
                        >
                          <Bookmark size={16} fill="currentColor" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', background: 'var(--input-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <p>{t.emptyMoments}</p>
                    </div>
                  )}
                </div>

                {/* Reflections Section */}
                <h3 style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} /> {t.reflectionsLabel} ({formatNumber(notesWithHadiths.length)})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {notesWithHadiths.length > 0 ? (
                    notesWithHadiths.map(item => (
                      <div key={item.hadith.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--glass-border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ cursor: 'pointer' }} onClick={() => handleSelectChapter(item.hadith.chapterId || 1, item.hadith.id)}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{t.hadithShort} {formatNumber(item.hadith.number)}</span>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 500, fontFamily: 'var(--font-arabic)' }}>{item.hadith.babArabic || item.hadith.bab}</h4>
                          </div>
                          <button 
                            onClick={() => handleOpenNoteModal(item.hadith)}
                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                          >
                            {t.edit}
                          </button>
                        </div>
                        <div style={{ 
                          background: 'var(--accent-emerald-light)', 
                          padding: '1rem', 
                          borderRadius: '12px', 
                          fontSize: '0.9rem', 
                          fontStyle: 'italic', 
                          borderLeft: language === 'arabic' ? 'none' : '3px solid var(--accent-emerald)',
                          borderRight: language === 'arabic' ? '3px solid var(--accent-emerald)' : 'none',
                          textAlign: language === 'arabic' ? 'right' : 'left'
                        }}>
                          "{item.content}"
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', background: 'var(--input-bg)', borderRadius: '16px', border: '1px solid var(--glass-border)' }}>
                      <p>{t.emptyReflections}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 5: SETTINGS */}
            {currentTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>{t.settingsTitle}</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {t.settingsDesc}
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '2rem', border: '1px solid var(--glass-border)' }}>
                  {/* Language Toggle */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.languageLabel}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.languageDesc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button 
                        onClick={() => setLanguage('english')}
                        style={{ 
                          background: language === 'english' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: language === 'english' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        English
                      </button>
                      <button 
                        onClick={() => setLanguage('arabic')}
                        style={{ 
                          background: language === 'arabic' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: language === 'arabic' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          fontFamily: 'var(--font-arabic)',
                          transition: 'all 0.2s'
                        }}
                      >
                        العربية
                      </button>
                    </div>
                  </div>

                  {/* Theme Select */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.spiritualThemes}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.themeDesc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '340px' }}>
                      <button 
                        onClick={() => setTheme('night')}
                        style={{ background: '#080D0A', color: '#ECF3EF', border: theme === 'night' ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {t.themeNight}
                      </button>
                      <button 
                        onClick={() => setTheme('paper')}
                        style={{ background: '#F4F8F5', color: '#1E2D23', border: theme === 'paper' ? '2px solid var(--accent-emerald)' : '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {t.themePaper}
                      </button>
                      <button 
                        onClick={() => setTheme('sepia')}
                        style={{ background: '#EFEBDE', color: '#382D20', border: theme === 'sepia' ? '2px solid var(--accent-emerald)' : '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {t.themeSepia}
                      </button>
                      <button 
                        onClick={() => setTheme('indigo')}
                        style={{ background: '#0A0D1A', color: '#E2E8F0', border: theme === 'indigo' ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {t.themeIndigo}
                      </button>
                      <button 
                        onClick={() => setTheme('emerald')}
                        style={{ background: '#04140D', color: '#F0FDF4', border: theme === 'emerald' ? '2px solid var(--accent-gold)' : '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {t.themeEmerald}
                      </button>
                      <button 
                        onClick={() => setTheme('clay')}
                        style={{ background: '#B87B52', color: '#381E10', border: theme === 'clay' ? '2px solid var(--accent-emerald)' : '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.8rem', cursor: 'pointer' }}
                      >
                        {t.themeClay}
                      </button>
                    </div>
                  </div>

                  {/* Reading Layout Style */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.readingLayoutLabel}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.readingLayoutDesc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button 
                        onClick={() => setReadingLayout('scroll')}
                        style={{ 
                          background: readingLayout === 'scroll' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: readingLayout === 'scroll' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t.layoutScroll}
                      </button>
                      <button 
                        onClick={() => setReadingLayout('page')}
                        style={{ 
                          background: readingLayout === 'page' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: readingLayout === 'page' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t.layoutPage}
                      </button>
                    </div>
                  </div>

                  {/* Hadith Reminders Setting Row */}
                  <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.notificationTitle}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.notificationDesc}</p>
                      </div>
                      
                      <div>
                        {notificationPermission !== 'granted' ? (
                          <button 
                            onClick={handleRequestPermission}
                            className="primary-btn"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                          >
                            {t.notificationEnable}
                          </button>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <button 
                              onClick={() => setRemindersEnabled(!remindersEnabled)}
                              style={{ 
                                background: remindersEnabled ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                                color: remindersEnabled ? 'white' : 'var(--text-primary)', 
                                border: '1px solid var(--glass-border)', 
                                padding: '0.5rem 1rem', 
                                borderRadius: '10px', 
                                fontSize: '0.85rem', 
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              {remindersEnabled ? (language === 'arabic' ? 'مفعل' : 'Enabled') : t.notificationDisabled}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {notificationPermission === 'granted' && remindersEnabled && (
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '0.8rem 1rem',
                        borderRadius: '12px',
                        border: '1px solid var(--glass-border)',
                        marginTop: '0.5rem'
                      }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.reminderTime}</span>
                        <input 
                          type="time" 
                          value={reminderTime}
                          onChange={(e) => setReminderTime(e.target.value)}
                          style={{
                            background: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            padding: '0.3rem 0.6rem',
                            fontSize: '0.85rem',
                            outline: 'none'
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Arabic Font Family */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.arabicFontLabel}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.arabicFontDesc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '340px' }}>
                      {['Amiri', 'Scheherazade New', 'Lateef', 'Cairo', 'Tajawal'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setArabicFont(f as ArabicFont)}
                          style={{
                            fontFamily: f === 'Amiri' ? 'Amiri' : (f === 'Scheherazade New' ? 'Scheherazade New' : (f === 'Lateef' ? 'Lateef' : (f === 'Cairo' ? 'Cairo' : 'Tajawal'))),
                            fontSize: '0.85rem',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            background: arabicFont === f ? 'var(--accent-emerald)' : 'var(--input-bg)',
                            color: arabicFont === f ? 'white' : 'var(--text-primary)',
                            border: '1px solid var(--glass-border)',
                            transition: 'all 0.2s'
                          }}
                        >
                          {f === 'Scheherazade New' ? 'Scheherazade' : f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hadith Display Mode (hidden in Arabic-only mode) */}
                  {displayMode !== 'arabic-only' && (
                    <div className="setting-row">
                      <div>
                        <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.displayModeLabel}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.displayModeDesc}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button 
                          onClick={() => setDisplayMode('bilingual')}
                          style={{ 
                            background: displayMode === 'bilingual' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                            color: displayMode === 'bilingual' ? 'white' : 'var(--text-primary)', 
                            border: '1px solid var(--glass-border)', 
                            padding: '0.5rem 0.8rem', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.displayBilingual}
                        </button>
                        <button 
                          onClick={() => setDisplayMode('arabic-only')}
                          style={{ 
                            background: (displayMode as string) === 'arabic-only' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                            color: (displayMode as string) === 'arabic-only' ? 'white' : 'var(--text-primary)', 
                            border: '1px solid var(--glass-border)', 
                            padding: '0.5rem 0.8rem', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.displayArabicOnly}
                        </button>
                        <button 
                          onClick={() => setDisplayMode('translation-only')}
                          style={{ 
                            background: displayMode === 'translation-only' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                            color: displayMode === 'translation-only' ? 'white' : 'var(--text-primary)', 
                            border: '1px solid var(--glass-border)', 
                            padding: '0.5rem 0.8rem', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.displayTranslationOnly}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Arabic Text Alignment */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.alignmentLabel}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.alignmentDesc}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button 
                        onClick={() => setTextAlignment('right')}
                        style={{ 
                          background: textAlignment === 'right' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: textAlignment === 'right' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t.alignRight}
                      </button>
                      <button 
                        onClick={() => setTextAlignment('center')}
                        style={{ 
                          background: textAlignment === 'center' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: textAlignment === 'center' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t.alignCenter}
                      </button>
                      <button 
                        onClick={() => setTextAlignment('justify')}
                        style={{ 
                          background: textAlignment === 'justify' ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                          color: textAlignment === 'justify' ? 'white' : 'var(--text-primary)', 
                          border: '1px solid var(--glass-border)', 
                          padding: '0.5rem 1rem', 
                          borderRadius: '10px', 
                          fontSize: '0.85rem', 
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        {t.alignJustify}
                      </button>
                    </div>
                  </div>

                  {/* Show Sanad (hidden in Arabic-only mode) */}
                  {displayMode !== 'arabic-only' && (
                    <div className="setting-row">
                      <div>
                        <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.sanadLabel}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.sanadDesc}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.8rem' }}>
                        <button 
                          onClick={() => setShowSanad(true)}
                          style={{ 
                            background: showSanad ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                            color: showSanad ? 'white' : 'var(--text-primary)', 
                            border: '1px solid var(--glass-border)', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '10px', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.sanadShow}
                        </button>
                        <button 
                          onClick={() => setShowSanad(false)}
                          style={{ 
                            background: !showSanad ? 'var(--accent-emerald)' : 'var(--input-bg)', 
                            color: !showSanad ? 'white' : 'var(--text-primary)', 
                            border: '1px solid var(--glass-border)', 
                            padding: '0.5rem 1rem', 
                            borderRadius: '10px', 
                            fontSize: '0.85rem', 
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.sanadHide}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Arabic Font Size */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.arabicTypography}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.arabicTypographyDesc}</p>
                    </div>
                    <div className="slider-container">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatNumber(arabicFontSize)}px</span>
                      <input 
                        type="range" 
                        min="24" 
                        max="46" 
                        className="font-slider" 
                        value={arabicFontSize} 
                        onChange={(e) => setArabicFontSize(parseInt(e.target.value))} 
                      />
                    </div>
                  </div>

                  {/* Translation Font Size (hidden in Arabic-only mode) */}
                  {displayMode !== 'arabic-only' && (
                    <div className="setting-row">
                      <div>
                        <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.translationTypography}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.translationTypographyDesc}</p>
                      </div>
                      <div className="slider-container">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatNumber(translationFontSize)}px</span>
                        <input 
                          type="range" 
                          min="14" 
                          max="24" 
                          className="font-slider" 
                          value={translationFontSize} 
                          onChange={(e) => setTranslationFontSize(parseInt(e.target.value))} 
                        />
                      </div>
                    </div>
                  )}

                  {/* Supabase Check */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>{t.dbConfig}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.dbDesc}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSupabaseConfigured ? 'var(--accent-emerald)' : 'var(--accent-gold)' }}>
                      <Database size={16} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {isSupabaseConfigured ? t.dbLive : t.dbOffline}
                      </span>
                    </div>
                  </div>

                  {/* Offline Sync Manager */}
                  <div className="setting-row" style={{ borderBottom: 'none' }}>
                    <div style={{ flex: 1 }}>
                       <h4 style={{ fontWeight: 500, marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {language === 'arabic' ? 'إدارة القراءة دون اتصال' : 'Offline Reading Manager'}
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '0.1rem 0.4rem', 
                          borderRadius: '4px',
                          background: isOnline ? 'rgba(46, 159, 133, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isOnline ? 'var(--accent-emerald)' : 'var(--accent-red)',
                          fontWeight: 500
                        }}>
                          {isOnline ? (language === 'arabic' ? 'متصل' : 'Online') : (language === 'arabic' ? 'غير متصل' : 'Offline')}
                        </span>
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {language === 'arabic' 
                          ? 'قم بتنزيل صحيح البخاري كاملاً للوصول إليه بدون إنترنت.' 
                          : 'Download the entire Sahih Al-Bukhari library for complete offline access.'}
                      </p>
                      
                      {/* Status Info */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0', fontSize: '0.85rem' }}>
                        <span style={{ 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '6px', 
                          background: cachedChapterIds.size === (chapters.length || 97) ? 'rgba(46, 159, 133, 0.15)' : 'rgba(210, 183, 115, 0.15)',
                          color: cachedChapterIds.size === (chapters.length || 97) ? 'var(--accent-emerald)' : 'var(--accent-gold)',
                          fontWeight: 500
                        }}>
                          {cachedChapterIds.size} / {chapters.length || 97} {language === 'arabic' ? 'أبواب محملة' : 'chapters cached'}
                        </span>
                        
                        {cachedChapterIds.size === (chapters.length || 97) && (
                          <span style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <CheckCircle size={14} /> {language === 'arabic' ? 'مكتمل ومزامن' : 'Fully Synced'}
                          </span>
                        )}
                      </div>

                      {/* Download Progress Bar */}
                      {isDownloadingAll && (
                        <div style={{ marginTop: '0.8rem', width: '100%', maxWidth: '400px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                            <span style={{ color: 'var(--accent-emerald)', fontWeight: 500 }}>
                              {language === 'arabic' ? 'جاري تحميل الأحاديث...' : 'Downloading scriptures...'}
                            </span>
                            <span>
                              {formatNumber(downloadAllCurrent)} / {formatNumber(downloadAllTotal)}
                            </span>
                          </div>
                          <div style={{ 
                            height: '6px', 
                            width: '100%', 
                            background: 'var(--input-bg)', 
                            borderRadius: '999px', 
                            overflow: 'hidden', 
                            border: '1px solid var(--glass-border)' 
                          }}>
                            <div style={{ 
                              height: '100%', 
                              background: 'linear-gradient(90deg, var(--accent-emerald) 0%, var(--accent-gold) 100%)', 
                              width: `${(downloadAllCurrent / (downloadAllTotal || 1)) * 100}%`,
                              transition: 'width 0.2s ease-out'
                            }} />
                          </div>
                        </div>
                      )}

                      {/* Error Display */}
                      {downloadAllError && (
                        <p style={{ color: 'var(--accent-red)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                          {downloadAllError}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                      {isDownloadingAll ? (
                        <button
                          onClick={() => { downloadCancelRef.current = true; }}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: 'var(--accent-red)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            padding: '0.5rem 1rem',
                            borderRadius: '10px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          {t.cancel}
                        </button>
                      ) : (
                        <>
                          {cachedChapterIds.size > 0 && (
                            <button
                              onClick={() => {
                                if (window.confirm(language === 'arabic' ? 'هل أنت متأكد من حذف جميع الملفات المحملة؟ ستحتاج إلى الإنترنت مجدداً لقراءتها.' : 'Are you sure you want to clear all offline cached chapters? You will need internet connection to read them again.')) {
                                  handleClearOfflineCache();
                                }
                              }}
                              style={{
                                background: 'transparent',
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--glass-border)',
                                padding: '0.5rem 1rem',
                                borderRadius: '10px',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                              {language === 'arabic' ? 'مسح التخزين' : 'Clear Cache'}
                            </button>
                          )}
                          
                          {cachedChapterIds.size < (chapters.length || 97) && (
                            <button
                              onClick={handleDownloadAllChapters}
                              style={{
                                background: 'var(--accent-emerald)',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem 1.2rem',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Download size={14} />
                              {language === 'arabic' ? 'تحميل الكل' : 'Download All'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* Sidebar / Bottom Navigator Glass Panel */}
      <AnimatePresence>
        {showToolbar && !focusMode && (
          <motion.nav 
            className="bottom-nav-bar"
            initial={{ y: 80, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 80, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
          >
            {/* Sidebar Brand Header (Desktop Sidebar only) */}
            <div className="nav-brand-header">
              <img src="/app-icon.png" alt="Sahih Bukhari Logo" className="nav-brand-logo" />
              <h3 style={{ fontFamily: 'var(--font-arabic)', fontSize: '1.4rem' }}>{t.bukhariTitle}</h3>
            </div>

            <div className="nav-items-container">
              <button 
                type="button"
                className={`nav-item-btn ${currentTab === 'home' ? 'active' : ''}`}
                onClick={() => handleTabClick('home')}
              >
                <Home size={18} />
                <span>{t.home}</span>
              </button>

              <button 
                type="button"
                className={`nav-item-btn ${currentTab === 'chapters' ? 'active' : ''}`}
                onClick={() => handleTabClick('chapters')}
              >
                <Menu size={18} />
                <span>{t.fahrs}</span>
              </button>

              <button 
                type="button"
                className={`nav-item-btn ${currentTab === 'narrators' ? 'active' : ''}`}
                onClick={() => handleTabClick('narrators')}
              >
                <Users size={18} />
                <span>{t.ruwaat}</span>
              </button>

              <button 
                type="button"
                className={`nav-item-btn ${currentTab === 'bookmarks' ? 'active' : ''}`}
                onClick={() => handleTabClick('bookmarks')}
              >
                <Bookmark size={18} />
                <span>{t.moments}</span>
              </button>

              <button 
                type="button"
                className={`nav-item-btn ${currentTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleTabClick('settings')}
              >
                <Settings size={18} />
                <span>{t.settings}</span>
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Floating Focus Toggle (Shown only in chapter reading view) */}
      {currentTab === 'chapters' && activeChapter && (
        <button
          onClick={() => setFocusMode(!focusMode)}
          style={{
            position: 'fixed',
            top: '2rem',
            [language === 'arabic' ? 'left' : 'right']: '2rem',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--glass-border)',
            borderRadius: '50%',
            padding: '0.8rem',
            color: focusMode ? 'var(--accent-emerald)' : 'var(--text-secondary)',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 4px 20px var(--glass-shadow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title={focusMode ? t.focusModeDisable : t.focusModeEnable}
        >
          {focusMode ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}

      {/* Reflection Notes Modal Popup */}
      <AnimatePresence>
        {activeNoteHadith && (
          <motion.div 
            className="overlay-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
            >
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{t.hadithShort} #{formatNumber(activeNoteHadith.number)}</span>
                  <h3 style={{ fontWeight: 500, fontSize: '1.25rem' }}>{t.reflectionModalTitle}</h3>
                </div>
                <button 
                  onClick={() => setActiveNoteHadith(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ 
                  maxHeight: '120px', 
                  overflowY: 'auto', 
                  background: 'var(--input-bg)', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)', 
                  border: '1px solid var(--glass-border)',
                  textAlign: language === 'arabic' ? 'right' : 'left'
                }}>
                  <p style={{ fontStyle: 'italic' }}>"{language === 'arabic' ? activeNoteHadith.arabic : activeNoteHadith.translation}"</p>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t.thoughtsInsights}
                  </label>
                  <textarea
                    className="notes-textarea"
                    placeholder={t.notePlaceholder}
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    style={{ textAlign: language === 'arabic' ? 'right' : 'left', direction: language === 'arabic' ? 'rtl' : 'ltr' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                  {notes[activeNoteHadith.id] ? (
                    <button 
                      onClick={() => handleDeleteNote(activeNoteHadith.id)}
                      style={{ background: 'rgba(235, 94, 85, 0.1)', color: '#eb5e55', border: 'none', borderRadius: '12px', padding: '0.8rem 1.4rem', cursor: 'pointer' }}
                    >
                      {t.deleteNote}
                    </button>
                  ) : <div />}
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => setActiveNoteHadith(null)}
                      style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '12px', padding: '0.8rem 1.4rem', cursor: 'pointer' }}
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={handleSaveNote}
                      className="primary-btn"
                    >
                      {t.recordNote}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal Popup */}
      <AnimatePresence>
        {showPrivacyModal && (
          <motion.div 
            className="overlay-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              style={{ maxWidth: '600px' }}
            >
              <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 500, fontSize: '1.25rem', color: 'var(--accent-gold)' }}>
                  {language === 'arabic' ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </h3>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem', 
                overflowY: 'auto', 
                maxHeight: '60vh', 
                fontSize: '0.9rem', 
                color: 'var(--text-secondary)', 
                lineHeight: 1.65, 
                textAlign: language === 'arabic' ? 'right' : 'left', 
                direction: language === 'arabic' ? 'rtl' : 'ltr' 
              }}>
                {language === 'arabic' ? (
                  <>
                    <p style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>آخر تحديث: مايو ٢٠٢٦</p>
                    <p>نحن نقدر خصوصيتك بشكل كبير. تطبيق <strong>صحيح البخاري</strong> مصمم ليعمل محلياً بالكامل ولا يقوم بجمع، تخزين، أو نقل أي بيانات شخصية خاصة بك إلى أي خوادم خارجية.</p>
                    <p><strong>١. تخزين البيانات محلياً:</strong> جميع الملاحظات الشخصية، الإشارات المرجعية، إعدادات السمات، وحالة تقدم القراءة يتم تخزينها محلياً على جهازك فقط (باستخدام LocalStorage و IndexedDB المدمجين في متصفحك).</p>
                    <p><strong>٢. تكامل قاعدة البيانات الاختياري:</strong> إذا قمت بإدخال إعدادات Supabase الخاصة بك للنسخ الاحتياطي السحابي، فسيتم إرسال بياناتك فقط إلى مثيل قاعدة البيانات الخاص بك مباشرة ولا يمكننا الوصول إليها.</p>
                    <p><strong>٣. عدم وجود إعلانات أو تعقب:</strong> لا يحتوي هذا التطوق على أي إعلانات، أو أدوات تتبع جهات خارجية.</p>
                  </>
                ) : (
                  <>
                    <p style={{ color: 'var(--accent-gold)', fontWeight: 500 }}>Last Updated: May 2026</p>
                    <p>We deeply respect your privacy. <strong>Sahih Al-Bukhari</strong> is designed to operate fully offline and does not collect, store, or transmit any of your personal data to external servers.</p>
                    <p><strong>1. Local Storage:</strong> All your personal notes, bookmarks, configuration settings, and reading progress are stored locally on your device (using browser LocalStorage and IndexedDB).</p>
                    <p><strong>2. Database Integration:</strong> If you choose to configure custom Supabase database settings for cloud synchronization, your data is sent directly to your own private database instance. We do not have access to it.</p>
                    <p><strong>3. No Ads or Tracking:</strong> There are no third-party advertisements or tracking profiles integrated into this app.</p>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <button 
                  onClick={() => setShowPrivacyModal(false)}
                  className="primary-btn"
                  style={{ padding: '0.6rem 1.4rem' }}
                >
                  {language === 'arabic' ? 'إغلاق' : 'Close'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            style={{
              position: 'fixed',
              bottom: '7.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--accent-emerald)',
              color: '#ffffff',
              padding: '0.8rem 1.6rem',
              borderRadius: '12px',
              fontSize: '0.9rem',
              zIndex: 300,
              boxShadow: '0 8px 30px rgba(46, 159, 133, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Check size={16} />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Card Modal Overlay */}
      <AnimatePresence>
        {activeShareHadith && (
          <motion.div 
            className="overlay-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ zIndex: 350 }}
          >
            <motion.div 
              className="modal-card"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              style={{ maxWidth: '580px' }}
            >
              <div className="modal-header">
                <h3 style={{ fontWeight: 500, fontSize: '1.25rem', color: 'var(--accent-gold)' }}>
                  {language === 'arabic' ? 'إنشاء بطاقة المشاركة' : 'Generate Share Card'}
                </h3>
                <button 
                  onClick={() => setActiveShareHadith(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {/* Pattern selector */}
                <div style={{ textAlign: 'center', marginBottom: '0.8rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>
                    {language === 'arabic' ? 'اختر نمط الخلفية:' : 'Select Card Style:'}
                  </span>
                  <div className="share-pattern-bar">
                    {[
                      { id: 'emerald', color: '#04140D', label: 'Emerald' },
                      { id: 'night', color: '#080D0A', label: 'Night' },
                      { id: 'indigo', color: '#0A0D1A', label: 'Indigo' },
                      { id: 'clay', color: '#B87B52', label: 'Clay' },
                      { id: 'parchment', color: '#EFEBDE', label: 'Parchment' }
                    ].map((pattern) => (
                      <button
                        key={pattern.id}
                        type="button"
                        className={`share-pattern-dot ${shareBgPattern === pattern.id ? 'active' : ''}`}
                        style={{ backgroundColor: pattern.color }}
                        onClick={() => setShareBgPattern(pattern.id as any)}
                        title={pattern.label}
                      />
                    ))}
                  </div>
                </div>

                {/* The Card mockup canvas */}
                <div className={`share-card-canvas share-bg-${shareBgPattern}`}>
                  <p className="share-card-arabic" style={{ fontFamily: arabicFont }}>
                    {activeShareHadith.arabic}
                  </p>
                  
                  <p className="share-card-english">
                    {activeShareHadith.translation}
                  </p>

                  <div className="share-card-meta">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', textAlign: 'left' }}>
                      <span style={{ fontWeight: 600 }}>Sahih Al-Bukhari</span>
                      <span style={{ opacity: 0.8, fontSize: '0.68rem' }}>
                        Hadith {formatNumber(activeShareHadith.number)} • Book {activeShareHadith.kitab}
                      </span>
                    </div>
                    <span className="share-card-logo" style={{ color: shareBgPattern === 'parchment' ? 'var(--accent-emerald)' : 'var(--accent-gold)' }}>
                      UMMUHAT
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontStyle: 'italic' }}>
                  {language === 'arabic' ? '💡 نصيحة: التقط لقطة شاشة (Screenshot) للبطاقة أعلاه لمشاركتها مباشرة على حالات واتساب أو شبكات التواصل الاجتماعي!' : '💡 Tip: Take a screenshot of the card above to share directly on WhatsApp status or social stories!'}
                </p>

                {/* Sharing Actions */}
                <div className="share-card-actions">
                  <button
                    type="button"
                    className="primary-btn"
                    onClick={() => handleCopyFormattedShare(activeShareHadith)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    <Share2 size={16} />
                    <span>{language === 'arabic' ? 'نسخ النص بالكامل للمشاركة' : 'Copy Full Share Text'}</span>
                  </button>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="glass-card"
                      onClick={() => handleCopyArabic(activeShareHadith)}
                      style={{ 
                        flex: 1, 
                        padding: '0.8rem', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer', 
                        border: '1px solid var(--glass-border)', 
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        borderRadius: '12px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      <Copy size={14} style={{ marginRight: '0.4rem' }} />
                      {language === 'arabic' ? 'العربية' : 'Arabic'}
                    </button>
                    
                    <button
                      type="button"
                      className="glass-card"
                      onClick={() => handleCopyEnglish(activeShareHadith)}
                      style={{ 
                        flex: 1, 
                        padding: '0.8rem', 
                        fontSize: '0.85rem', 
                        cursor: 'pointer', 
                        border: '1px solid var(--glass-border)', 
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        borderRadius: '12px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                    >
                      <Copy size={14} style={{ marginRight: '0.4rem' }} />
                      {language === 'arabic' ? 'الإنجليزية' : 'English'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
