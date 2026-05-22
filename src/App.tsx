import React, { useState, useEffect, useRef } from 'react';
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
  ChevronDown,
  ArrowUpRight,
  Database
} from 'lucide-react';
import { db, isSupabaseConfigured } from './supabaseClient';
import { ruwaatsData } from './ruwaats';
import type { Theme, Hadith } from './types';

type Tab = 'home' | 'reader' | 'chapters' | 'narrators' | 'bookmarks' | 'settings';

const App: React.FC = () => {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('night');
  const [currentTab, setCurrentTab] = useState<Tab>('home');
  const [showToolbar, setShowToolbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Interactive features state
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [noteInput, setNoteInput] = useState('');
  const [activeNoteHadith, setActiveNoteHadith] = useState<Hadith | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastReadId, setLastReadId] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings state
  const [arabicFontSize, setArabicFontSize] = useState(32);
  const [translationFontSize, setTranslationFontSize] = useState(17);

  // Narrators UI state
  const [expandedNarrator, setExpandedNarrator] = useState<number | null>(null);

  // Intersection observer ref to track reading progress in reader view
  const hadithRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await db.getHadiths();
        setHadiths(data);
        
        const bms = await db.getBookmarks();
        setBookmarkedIds(bms);
        
        const nts = await db.getNotes();
        setNotes(nts);
        
        const progress = await db.getReadingProgress();
        setLastReadId(progress);
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
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // CSS variables updater for font-scaling
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale-arabic', `${arabicFontSize}px`);
  }, [arabicFontSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale-translation', `${translationFontSize}px`);
  }, [translationFontSize]);

  // Scroll listener for bottom navigation bar visibility (only in Reader tab)
  useEffect(() => {
    if (currentTab !== 'reader') {
      setShowToolbar(true);
      return;
    }
    const handleScroll = () => {
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
  }, [lastScrollY, currentTab]);

  // Observer to track which Hadith is in view to save progress
  useEffect(() => {
    if (hadiths.length === 0 || currentTab !== 'reader') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idStr = entry.target.getAttribute('data-hadith-id');
            if (idStr) {
              const id = parseInt(idStr, 10);
              db.saveReadingProgress(id);
              setLastReadId(id);
            }
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -200px 0px" }
    );

    Object.values(hadithRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [hadiths, currentTab]);

  // Helper for custom short toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Toggle bookmark function
  const handleToggleBookmark = async (id: number) => {
    const isBookmarked = await db.toggleBookmark(id);
    if (isBookmarked) {
      setBookmarkedIds(prev => [...prev, id]);
      triggerToast("Moment saved to repository.");
    } else {
      setBookmarkedIds(prev => prev.filter(bId => bId !== id));
      triggerToast("Removed from repository.");
    }
  };

  // Notes Functions
  const handleOpenNoteModal = (hadith: Hadith) => {
    setActiveNoteHadith(hadith);
    setNoteInput(notes[hadith.id] || '');
  };

  const handleSaveNote = async () => {
    if (!activeNoteHadith) return;
    const success = await db.saveNote(activeNoteHadith.id, noteInput);
    if (success) {
      setNotes(prev => ({ ...prev, [activeNoteHadith.id]: noteInput }));
      triggerToast("Reflection note recorded.");
      setActiveNoteHadith(null);
    } else {
      triggerToast("Failed to record reflection.");
    }
  };

  const handleDeleteNote = async (id: number) => {
    const success = await db.deleteNote(id);
    if (success) {
      const updatedNotes = { ...notes };
      delete updatedNotes[id];
      setNotes(updatedNotes);
      triggerToast("Reflection removed.");
      setActiveNoteHadith(null);
    }
  };

  // Share Function
  const handleShare = (hadith: Hadith) => {
    const shareText = `Sahih al-Bukhari (Hadith ${hadith.number})\n\n[Arabic]\n${hadith.arabic}\n\n[Translation]\n${hadith.translation}\n\n- Spiritual Reading Space`;
    navigator.clipboard.writeText(shareText);
    triggerToast("Hadith copied to clipboard.");
  };

  // Jump to specific hadith inside the reader tab
  const handleJumpToHadith = (id: number) => {
    setCurrentTab('reader');
    setTimeout(() => {
      const el = document.getElementById(`hadith-card-${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // Search filter
  const filteredHadiths = hadiths.filter(h => 
    h.arabic.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.translation.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.kitab.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.bab.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.number.includes(searchQuery)
  );

  return (
    <div className="app-root">
      <div className="nature-bg-overlay" />
      <div className="nature-ambient-glow" />
      <div className="fade-top" />
      <div className="fade-bottom" />

      {/* Main Content Containers based on active Tab */}
      <main className="reading-container">
        
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
            <p>Gathering scripture wisdom...</p>
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
                {/* Header Welcome */}
                <div style={{ textAlign: 'center', marginBottom: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                    <Sparkles size={18} />
                    <span style={{ fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
                      Spiritual Oasis
                    </span>
                  </div>
                  <h1 style={{ fontFamily: 'var(--font-arabic)', fontSize: '2.8rem', fontWeight: 400 }}>
                    صحيح البخاري
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '420px', lineHeight: 1.6 }}>
                    Welcome to your minimal spiritual library. A peaceful environment to read, study, and reflect on the authentic actions of the Prophet Muhammad (ﷺ).
                  </p>
                </div>

                {/* Statistics Row */}
                <div className="dashboard-grid">
                  <div className="stat-card">
                    <div className="stat-number">{hadiths.length}</div>
                    <div className="stat-label">Hadiths Compiled</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{bookmarkedIds.length}</div>
                    <div className="stat-label">Saved Moments</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-number">{Object.keys(notes).length}</div>
                    <div className="stat-label">Insights Recorded</div>
                  </div>
                </div>

                {/* Continue reading panel */}
                {lastReadId && (
                  <div className="glass-card" style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ color: 'var(--accent-emerald)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.4rem' }}>
                        Last Reading Session
                      </h4>
                      <p style={{ fontWeight: 500 }}>
                        Hadith {hadiths.find(h => h.id === lastReadId)?.number} — {hadiths.find(h => h.id === lastReadId)?.bab}
                      </p>
                    </div>
                    <button 
                      className="primary-btn" 
                      onClick={() => handleJumpToHadith(lastReadId)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem' }}
                    >
                      Resume <ArrowUpRight size={16} />
                    </button>
                  </div>
                )}

                {/* Curated Daily Hadith Reflection */}
                <div className="daily-reflection-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)', marginBottom: '1.5rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <Sparkles size={14} />
                    Curated Hadith Reflection
                  </div>
                  {hadiths.length > 0 && (
                    <div>
                      <p className="arabic" style={{ fontSize: '1.6rem', lineHeight: 1.9, marginBottom: '1.5rem' }}>
                        {hadiths[hadiths.length - 1].arabic}
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', fontStyle: 'italic', marginBottom: '1.5rem' }}>
                        "{hadiths[hadiths.length - 1].translation}"
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--accent-emerald)', fontWeight: 500 }}>
                          {hadiths[hadiths.length - 1].kitab} • Bab {hadiths[hadiths.length - 1].number}
                        </span>
                        <button 
                          className="primary-btn" 
                          onClick={() => handleJumpToHadith(hadiths[hadiths.length - 1].id)}
                          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        >
                          Read in Context
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 2: READER CANVAS */}
            {currentTab === 'reader' && (
              <motion.div
                key="reader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Modern Glass Search Bar */}
                <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem', width: '100%' }}>
                  <div style={{
                    position: 'relative',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Search size={18} style={{
                      position: 'absolute',
                      left: '1.2rem',
                      color: 'var(--text-secondary)'
                    }} />
                    <input
                      type="text"
                      placeholder="Search translation, Arabic, chapters, or hadith number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        background: 'var(--glass-bg)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '16px',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        style={{
                          position: 'absolute',
                          right: '1.2rem',
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
                </div>

                {filteredHadiths.length === 0 ? (
                  <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
                    No hadiths match your search query.
                  </div>
                ) : (
                  filteredHadiths.map((hadith) => {
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
                          {/* Hadith Metadata */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                            <span style={{ 
                              color: 'var(--accent-gold)', 
                              fontSize: '0.85rem', 
                              fontWeight: 500,
                              letterSpacing: '1px',
                              textTransform: 'uppercase'
                            }}>
                              {hadith.kitab} • {hadith.bab}
                            </span>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              #{hadith.number}
                            </span>
                          </div>

                          {/* Arabic text */}
                          <div className="arabic">
                            {hadith.arabic}
                          </div>

                          {/* English Translation */}
                          <div className="translation">
                            {hadith.translation}
                          </div>

                          {/* Note block if exists */}
                          {hasNote && (
                            <div style={{ 
                              background: 'var(--accent-emerald-light)', 
                              padding: '1.25rem 1.5rem', 
                              borderRadius: '16px',
                              marginBottom: '2rem',
                              fontSize: '0.9rem',
                              borderLeft: '3px solid var(--accent-emerald)',
                              color: 'var(--text-primary)'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                                <FileText size={12} />
                                Personal Reflection Note
                              </div>
                              <p style={{ fontStyle: 'italic' }}>"{notes[hadith.id]}"</p>
                            </div>
                          )}

                          {/* Actions */}
                          {!focusMode && (
                            <div className="hadith-actions">
                              <button 
                                className={`action-btn ${isBookmarked ? 'active' : ''}`}
                                onClick={() => handleToggleBookmark(hadith.id)}
                              >
                                <Bookmark size={15} fill={isBookmarked ? "currentColor" : "none"} />
                                <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                              </button>

                              <button 
                                className={`action-btn ${hasNote ? 'active' : ''}`}
                                onClick={() => handleOpenNoteModal(hadith)}
                              >
                                <FileText size={15} />
                                <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
                              </button>

                              <button 
                                className="action-btn"
                                onClick={() => handleShare(hadith)}
                              >
                                <Share2 size={15} />
                                <span>Share</span>
                              </button>
                            </div>
                          )}
                        </motion.article>
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* TAB 3: CHAPTERS INDEX (LIST FAHRS) */}
            {currentTab === 'chapters' && (
              <motion.div
                key="chapters"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Fahras (Chapters Index)</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
                    <BookOpen size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>Index Compiled</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {Array.from(new Set(hadiths.map(h => h.kitab))).map(kitab => (
                    <div key={kitab} className="glass-card" style={{ padding: '2rem' }}>
                      <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.25rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                        {kitab}
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                        {hadiths.filter(h => h.kitab === kitab).map(h => (
                          <button
                            key={h.id}
                            onClick={() => handleJumpToHadith(h.id)}
                            style={{
                              textAlign: 'left',
                              background: 'var(--input-bg)',
                              border: '1px solid var(--glass-border)',
                              borderRadius: '12px',
                              padding: '1rem 1.25rem',
                              color: 'var(--text-primary)',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              width: '100%',
                              transition: 'border-color 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                          >
                            <span style={{ fontSize: '0.95rem', fontWeight: 400 }}>{h.bab}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                              <span>Hadith #{h.number}</span>
                              <ChevronRight size={14} />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* TAB 4: NARRATORS DIRECTORY (RUWAATS) */}
            {currentTab === 'narrators' && (
              <motion.div
                key="narrators"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>Ruwaat (Prominent Narrators)</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Explore the biographies of the noble Companions who preserved the Prophet's words and practices.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {ruwaatsData.map((narrator) => {
                    const isExpanded = expandedNarrator === narrator.id;
                    return (
                      <div 
                        key={narrator.id} 
                        className="narrator-card"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setExpandedNarrator(isExpanded ? null : narrator.id)}
                      >
                        <div className="narrator-header">
                          <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              {narrator.name}
                              <span style={{ fontSize: '1rem', color: 'var(--accent-emerald)', fontFamily: 'var(--font-arabic)' }}>
                                ({narrator.arabicName})
                              </span>
                            </h3>
                            <span className="narrator-title">{narrator.title}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontSize: '0.85rem', background: 'var(--accent-emerald-light)', color: 'var(--accent-emerald)', padding: '0.3rem 0.6rem', borderRadius: '8px', fontWeight: 600 }}>
                              {narrator.totalNarrations} Hadiths
                            </span>
                            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
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
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, paddingTop: '0.5rem', fontStyle: 'italic' }}>
                                {narrator.bio}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB 5: BOOKMARKS & NOTES */}
            {currentTab === 'bookmarks' && (
              <motion.div
                key="bookmarks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>Saved Moments & Insights</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Access your personal repository of saved Hadiths and reflection notes.
                  </p>
                </div>

                {/* Bookmarks Section */}
                <h3 style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Bookmark size={14} /> Bookmarks ({bookmarkedIds.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '4rem' }}>
                  {bookmarkedIds.length > 0 ? (
                    hadiths
                      .filter(h => bookmarkedIds.includes(h.id))
                      .map(h => (
                        <div key={h.id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
                          <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleJumpToHadith(h.id)}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
                              {h.kitab} • Hadith #{h.number}
                            </div>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {h.translation}
                            </p>
                          </div>
                          <button 
                            onClick={() => handleToggleBookmark(h.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', padding: '0.5rem' }}
                          >
                            <Bookmark size={16} fill="currentColor" />
                          </button>
                        </div>
                      ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', background: 'var(--input-bg)', borderRadius: '16px' }}>
                      <p>Your saved moments will appear here.</p>
                    </div>
                  )}
                </div>

                {/* Reflections Section */}
                <h3 style={{ color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={14} /> Reflections Notes ({Object.keys(notes).length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.keys(notes).length > 0 ? (
                    hadiths
                      .filter(h => !!notes[h.id])
                      .map(h => (
                        <div key={h.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ cursor: 'pointer' }} onClick={() => handleJumpToHadith(h.id)}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Hadith #{h.number}</span>
                              <h4 style={{ fontSize: '0.95rem', fontWeight: 500 }}>{h.bab}</h4>
                            </div>
                            <button 
                              onClick={() => handleOpenNoteModal(h)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                            >
                              Edit
                            </button>
                          </div>
                          <div style={{ background: 'var(--accent-emerald-light)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', fontStyle: 'italic', borderLeft: '3px solid var(--accent-emerald)' }}>
                            "{notes[h.id]}"
                          </div>
                        </div>
                      ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0', background: 'var(--input-bg)', borderRadius: '16px' }}>
                      <p>Your recorded reflections will appear here.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 6: SETTINGS */}
            {currentTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div style={{ marginBottom: '3rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '0.5rem' }}>Settings</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Personalize your reading environment and verify database connectivity.
                  </p>
                </div>

                <div className="glass-card" style={{ padding: '2rem' }}>
                  {/* Theme Select */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>Spiritual Themes</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Select background and contrast palette.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                      <button 
                        onClick={() => setTheme('night')}
                        style={{ background: '#080D0A', color: '#fff', border: theme === 'night' ? '2px solid var(--accent-emerald)' : '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Night Forest
                      </button>
                      <button 
                        onClick={() => setTheme('paper')}
                        style={{ background: '#F4F8F5', color: '#1E2D23', border: theme === 'paper' ? '2px solid var(--accent-emerald)' : '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Sunlit Paper
                      </button>
                      <button 
                        onClick={() => setTheme('sepia')}
                        style={{ background: '#EFEBDE', color: '#382D20', border: theme === 'sepia' ? '2px solid var(--accent-emerald)' : '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', cursor: 'pointer' }}
                      >
                        Moss Sepia
                      </button>
                    </div>
                  </div>

                  {/* Arabic Font Size */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>Arabic Typography</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scale sizes of the sacred Arabic script.</p>
                    </div>
                    <div className="slider-container">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{arabicFontSize}px</span>
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

                  {/* Translation Font Size */}
                  <div className="setting-row">
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>Translation Typography</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Scale translation texts to prevent strain.</p>
                    </div>
                    <div className="slider-container">
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{translationFontSize}px</span>
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

                  {/* Supabase Check */}
                  <div className="setting-row" style={{ borderBottom: 'none' }}>
                    <div>
                      <h4 style={{ fontWeight: 500, marginBottom: '0.2rem' }}>Database Configuration</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Status of the Supabase cloud connection.</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isSupabaseConfigured ? 'var(--accent-emerald)' : 'var(--accent-gold)' }}>
                      <Database size={16} />
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                        {isSupabaseConfigured ? 'Live Database Active' : 'Offline Mode (Local Storage)'}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </main>

      {/* Floating Navigator Glass Pill (bottom-nav-bar) */}
      <AnimatePresence>
        {showToolbar && !focusMode && (
          <motion.nav 
            className="bottom-nav-bar"
            initial={{ y: 80, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 80, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
          >
            <button 
              className={`nav-item-btn ${currentTab === 'home' ? 'active' : ''}`}
              onClick={() => setCurrentTab('home')}
            >
              <Home size={18} />
              <span>Home</span>
            </button>

            <button 
              className={`nav-item-btn ${currentTab === 'reader' ? 'active' : ''}`}
              onClick={() => setCurrentTab('reader')}
            >
              <BookOpen size={18} />
              <span>Reader</span>
            </button>

            <button 
              className={`nav-item-btn ${currentTab === 'chapters' ? 'active' : ''}`}
              onClick={() => setCurrentTab('chapters')}
            >
              <Menu size={18} />
              <span>Fahrs</span>
            </button>

            <button 
              className={`nav-item-btn ${currentTab === 'narrators' ? 'active' : ''}`}
              onClick={() => setCurrentTab('narrators')}
            >
              <Users size={18} />
              <span>Ruwaat</span>
            </button>

            <button 
              className={`nav-item-btn ${currentTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setCurrentTab('bookmarks')}
            >
              <Bookmark size={18} />
              <span>Moments</span>
            </button>

            <button 
              className={`nav-item-btn ${currentTab === 'settings' ? 'active' : ''}`}
              onClick={() => setCurrentTab('settings')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Floating Focus Toggle (Shown only in Reader mode) */}
      {currentTab === 'reader' && (
        <button
          onClick={() => setFocusMode(!focusMode)}
          style={{
            position: 'fixed',
            top: '2rem',
            right: '2rem',
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
          title={focusMode ? "Disable Focus Mode" : "Enable Focus Mode"}
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
              <div className="modal-header">
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Hadith #{activeNoteHadith.number}</span>
                  <h3 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Personal Reflection</h3>
                </div>
                <button 
                  onClick={() => setActiveNoteHadith(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ maxHeight: '120px', overflowY: 'auto', background: 'var(--input-bg)', padding: '1rem', borderRadius: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)' }}>
                  <p style={{ fontStyle: 'italic' }}>"{activeNoteHadith.translation}"</p>
                </div>
                
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Your thoughts & insights
                  </label>
                  <textarea
                    className="notes-textarea"
                    placeholder="Write down your insights, spiritual feelings, or notes about this Hadith..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                  {notes[activeNoteHadith.id] ? (
                    <button 
                      onClick={() => handleDeleteNote(activeNoteHadith.id)}
                      style={{ background: 'rgba(235, 94, 85, 0.1)', color: '#eb5e55', border: 'none', borderRadius: '12px', padding: '0.8rem 1.4rem', cursor: 'pointer' }}
                    >
                      Delete Note
                    </button>
                  ) : <div />}
                  
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={() => setActiveNoteHadith(null)}
                      style={{ background: 'none', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '12px', padding: '0.8rem 1.4rem', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveNote}
                      className="primary-btn"
                    >
                      Record Note
                    </button>
                  </div>
                </div>
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
    </div>
  );
};

export default App;
