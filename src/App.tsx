import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Share2, 
  Moon, 
  Sun, 
  Menu, 
  Search, 
  X, 
  FileText, 
  Sparkles, 
  Compass, 
  Eye, 
  EyeOff, 
  Check, 
  BookOpen, 
  ArrowUpRight
} from 'lucide-react';
import { db, isSupabaseConfigured } from './supabaseClient';
import type { Theme, Hadith } from './types';

const App: React.FC = () => {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('night');
  const [showToolbar, setShowToolbar] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Modals state
  const [showQuickJump, setShowQuickJump] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [activeNoteHadith, setActiveNoteHadith] = useState<Hadith | null>(null);
  
  // Interactive features state
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [noteInput, setNoteInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastReadId, setLastReadId] = useState<number | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Intersection observer ref to track reading progress
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

  // Scroll listener for toolbar visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < 120) {
        setShowToolbar(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up -> reveal toolbar
        setShowToolbar(true);
      } else {
        // Scrolling down -> hide toolbar
        setShowToolbar(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Observer to track which Hadith is in view to save progress
  useEffect(() => {
    if (hadiths.length === 0) return;

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
  }, [hadiths]);

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
      triggerToast("Moments saved to spiritual repository.");
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
      triggerToast("Reflection note recorded successfully.");
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

  // Scroll to hadith function
  const scrollToHadith = (id: number) => {
    const el = document.getElementById(`hadith-card-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Reset modal toggles
      setShowQuickJump(false);
      setShowBookmarks(false);
      setShowSearch(false);
    }
  };

  // Filtered Hadiths for search
  const filteredHadiths = hadiths.filter(h => 
    h.arabic.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.translation.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.kitab.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.bab.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.number.includes(searchQuery)
  );

  const nextTheme = () => {
    if (theme === 'night') setTheme('paper');
    else if (theme === 'paper') setTheme('sepia');
    else setTheme('night');
  };

  // Global tap to toggle toolbar when not focusing an element
  const handleGlobalTap = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea') || (e.target as HTMLElement).closest('input')) return;
    setShowToolbar(!showToolbar);
  };

  return (
    <div className="app-root" onClick={handleGlobalTap}>
      <div className="nature-bg-overlay" />
      <div className="nature-ambient-glow" />
      <div className="fade-top" />
      <div className="fade-bottom" />

      {/* Main Header Space */}
      <AnimatePresence>
        {!focusMode && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{ 
              textAlign: 'center', 
              paddingTop: '6rem', 
              paddingBottom: '2rem', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              gap: '1rem' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-emerald)' }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.8rem', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: 600 }}>
                Spiritual Oasis
              </span>
            </div>
            
            <h1 style={{ fontFamily: 'var(--font-arabic)', fontSize: '2.5rem', fontWeight: 400 }}>
              صحيح البخاري
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic', maxWidth: '320px' }}>
              "The words fade, only the wisdom remains."
            </p>

            {/* Smart Resume Banner */}
            {lastReadId && (
              <motion.button
                onClick={() => scrollToHadith(lastReadId)}
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'var(--glass-bg)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '12px',
                  padding: '0.6rem 1.2rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  marginTop: '1rem',
                  boxShadow: '0 4px 20px var(--glass-shadow)'
                }}
              >
                <Compass size={14} style={{ color: 'var(--accent-gold)' }} />
                Continue reading from Hadith {hadiths.find(h => h.id === lastReadId)?.number}
                <ArrowUpRight size={14} style={{ opacity: 0.6 }} />
              </motion.button>
            )}

            {!isSupabaseConfigured && (
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', opacity: 0.8, marginTop: '0.5rem' }}>
                Operating in Local Storage fallback mode
              </p>
            )}
          </motion.header>
        )}
      </AnimatePresence>

      {/* Reader Layout */}
      <main className="reading-container" style={{ paddingTop: focusMode ? '4rem' : '4rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '5rem' }}>
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
          hadiths.map((hadith) => {
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

                  {/* Hadith Action panel */}
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
                </motion.article>
              </div>
            );
          })
        )}
      </main>

      {/* Floating Glass Toolbar */}
      <AnimatePresence>
        {showToolbar && (
          <motion.nav 
            className="toolbar-pill"
            initial={{ y: 80, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 80, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 280 }}
          >
            <button className="toolbar-button" onClick={() => setShowQuickJump(true)} title="Quick Jump">
              <Menu size={18} />
            </button>
            <button className="toolbar-button" onClick={() => setShowSearch(true)} title="Search Hadiths">
              <Search size={18} />
            </button>
            <button className="toolbar-button" onClick={nextTheme} title="Change Theme">
              {theme === 'night' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button className="toolbar-button" onClick={() => setShowBookmarks(true)} title="Saved Moments">
              <Bookmark size={18} />
              {bookmarkedIds.length > 0 && (
                <div style={{ position: 'absolute', top: 4, right: 4, width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
              )}
            </button>
            <button 
              className={`toolbar-button ${focusMode ? 'active' : ''}`} 
              onClick={() => setFocusMode(!focusMode)} 
              title={focusMode ? "Show Navigation" : "Focus Mode"}
            >
              {focusMode ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* Modal 1: Quick Jump */}
      <AnimatePresence>
        {showQuickJump && (
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
              transition={{ type: "spring", damping: 30 }}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <BookOpen size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <h3 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Sahih al-Bukhari Index</h3>
                </div>
                <button 
                  onClick={() => setShowQuickJump(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                {Array.from(new Set(hadiths.map(h => h.kitab))).map(kitab => (
                  <div key={kitab} style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--accent-gold)', marginBottom: '0.8rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600 }}>
                      {kitab}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {hadiths.filter(h => h.kitab === kitab).map(h => (
                        <button
                          key={h.id}
                          onClick={() => scrollToHadith(h.id)}
                          style={{
                            textAlign: 'left',
                            padding: '1rem 1.25rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '12px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'border-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        >
                          <span>{h.bab}</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Hadith {h.number}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 2: Search */}
      <AnimatePresence>
        {showSearch && (
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
                <h3 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Search Sacred Words</h3>
                <button 
                  onClick={() => setShowSearch(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div className="search-input-wrapper">
                  <Search size={18} className="search-icon-inside" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search Arabic text, English content, chapters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {searchQuery ? (
                    filteredHadiths.length > 0 ? (
                      filteredHadiths.map(h => (
                        <button
                          key={h.id}
                          onClick={() => scrollToHadith(h.id)}
                          style={{
                            textAlign: 'left',
                            padding: '1.2rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.5rem',
                            transition: 'border-color 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                            <span>{h.kitab} • {h.bab}</span>
                            <span>Hadith {h.number}</span>
                          </div>
                          <p style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-secondary)',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {h.translation}
                          </p>
                        </button>
                      ))
                    ) : (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                        No matching words found. Try different search queries.
                      </p>
                    )
                  ) : (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>
                      Start typing to search across all compiled chapters.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 3: Saved Moments */}
      <AnimatePresence>
        {showBookmarks && (
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
                <h3 style={{ fontWeight: 500, fontSize: '1.25rem' }}>Saved Moments</h3>
                <button 
                  onClick={() => setShowBookmarks(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {bookmarkedIds.length > 0 ? (
                    hadiths
                      .filter(h => bookmarkedIds.includes(h.id))
                      .map(h => (
                        <div 
                          key={h.id}
                          style={{
                            padding: '1.2rem',
                            background: 'var(--input-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <button
                            onClick={() => scrollToHadith(h.id)}
                            style={{
                              textAlign: 'left',
                              background: 'none',
                              border: 'none',
                              color: 'inherit',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.4rem',
                              flex: 1
                            }}
                          >
                            <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                              {h.kitab} • Hadith {h.number}
                            </div>
                            <p style={{ 
                              fontSize: '0.85rem', 
                              color: 'var(--text-secondary)',
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {h.translation}
                            </p>
                          </button>
                          
                          <button 
                            onClick={() => handleToggleBookmark(h.id)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent-emerald)', cursor: 'pointer', padding: '0.5rem' }}
                          >
                            <Bookmark size={16} fill="currentColor" />
                          </button>
                        </div>
                      ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem 0' }}>
                      <Bookmark size={24} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                      <p>Your saved moments will appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal 4: Reflection Notes */}
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
