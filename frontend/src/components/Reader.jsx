import { useEffect, useRef, useState, useMemo } from 'react';
import useProgress from '../hooks/useProgress';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Reader({
    data, fontSize, letterSpacing, searchTerm, readingMode,
    searchNavCommand, onSearchNavComplete
}) {
    const { metadata, content } = data;
    const blocks = content || [];
    const documentId = metadata.title || 'untitled-document';

    // Group blocks by their original page number
    const pages = useMemo(() => {
        const grouped = {};
        blocks.forEach(block => {
            const pageNum = block.page || 1;
            if (!grouped[pageNum]) grouped[pageNum] = [];
            grouped[pageNum].push(block);
        });
        return Object.keys(grouped)
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(num => ({
                number: parseInt(num),
                blocks: grouped[num]
            }));
    }, [blocks]);

    const { progress, saveProgress, addBookmark, removeBookmark } = useProgress(documentId);

    const containerRef = useRef(null);
    const [restored, setRestored] = useState(false);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);

    // Track all block IDs that contain the search term
    const searchMatches = useMemo(() => {
        if (!searchTerm.trim()) return [];
        return blocks
            .filter(block => block.text.toLowerCase().includes(searchTerm.toLowerCase()))
            .map(block => block.id);
    }, [blocks, searchTerm]);

    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

    // Reset current match when search term changes
    useEffect(() => {
        setCurrentMatchIndex(searchMatches.length > 0 ? 0 : -1);
    }, [searchMatches]);

    // Handle search navigation commands
    useEffect(() => {
        if (!searchNavCommand || searchMatches.length === 0) return;

        if (searchNavCommand === 'next') {
            setCurrentMatchIndex(prev => (prev + 1) % searchMatches.length);
        } else if (searchNavCommand === 'prev') {
            setCurrentMatchIndex(prev => (prev - 1 + searchMatches.length) % searchMatches.length);
        }

        onSearchNavComplete();
    }, [searchNavCommand, searchMatches, onSearchNavComplete]);

    // Scroll to active match (and switch page if needed)
    useEffect(() => {
        if (currentMatchIndex >= 0 && searchMatches[currentMatchIndex]) {
            const id = searchMatches[currentMatchIndex];
            const activeBlock = blocks.find(b => b.id === id);

            if (readingMode === 'paginated' && activeBlock) {
                const targetPageIndex = pages.findIndex(p => p.number === activeBlock.page);
                if (targetPageIndex !== -1) setCurrentPageIndex(targetPageIndex);
            }

            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [currentMatchIndex, searchMatches, blocks, pages, readingMode]);


    // Helper to highlight search matches
    const highlightText = (text, highlight, blockId) => {
        if (!highlight.trim()) return text;
        const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
        const isActive = searchMatches[currentMatchIndex] === blockId;

        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <mark
                            key={i}
                            className={`rounded-sm px-0.5 transition-all duration-300 ${isActive
                                ? 'bg-orange-500 text-white shadow-sm scale-110 ring-2 ring-orange-400/50'
                                : 'bg-yellow-300 dark:bg-yellow-600 dark:text-white'
                                }`}
                        >
                            {part}
                        </mark>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };


    // Load initial progress
    useEffect(() => {
        if (progress && progress.scrollTop && !restored && readingMode === 'scroll') {
            // Smoothly restore the scroll position after a tiny delay for layout
            setTimeout(() => {
                window.scrollTo({ top: progress.scrollTop, behavior: 'auto' });
                setRestored(true);
            }, 100);
        } else if (progress && progress.currentPageIndex !== undefined && !restored && readingMode === 'paginated') {
            setCurrentPageIndex(progress.currentPageIndex);
            setRestored(true);
        } else {
            setRestored(true);
        }
    }, [progress, restored, readingMode]);

    // Automatically save scroll position
    useEffect(() => {
        if (readingMode !== 'scroll') return;

        const handleScroll = () => {
            const scrollY = window.scrollY;
            saveProgress({ scrollTop: scrollY, timestamp: Date.now() });
        };

        let timeoutId;
        const throttledScroll = () => {
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    handleScroll();
                    timeoutId = null;
                }, 1000); // Save every second of scrolling
            }
        };

        window.addEventListener('scroll', throttledScroll);
        return () => {
            window.removeEventListener('scroll', throttledScroll);
            clearTimeout(timeoutId);
        };
    }, [saveProgress, readingMode]);

    // Save page in paginated mode
    useEffect(() => {
        if (readingMode === 'paginated' && restored) {
            saveProgress({ currentPageIndex, timestamp: Date.now() });
        }
    }, [currentPageIndex, readingMode, restored, saveProgress]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (readingMode !== 'paginated') return;
            if (e.key === 'ArrowRight') setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1));
            if (e.key === 'ArrowLeft') setCurrentPageIndex(prev => Math.max(0, prev - 1));
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [readingMode, pages.length]);

    if (!blocks || blocks.length === 0) {
        return <div className="p-8 text-center text-lg font-serif-premium italic opacity-50">No content found in this document.</div>;
    }

    const baseTextStyle = {
        fontSize: `${fontSize}px`,
        lineHeight: 1.7,
        letterSpacing: `${letterSpacing}px`,
        transition: 'all 0.3s ease-out'
    };

    return (
        <div className={`relative py-8 h-full flex flex-col`} style={baseTextStyle}>

            <div className={`mb-16 text-center pb-12 border-b border-current/10 opacity-90 ${readingMode === 'paginated' ? 'hidden' : ''}`}>
                <h1 className="text-5xl font-bold font-display-premium mb-4 leading-tight tracking-tight">{metadata.title}</h1>
                <p className="opacity-70 text-xl font-serif-premium italic">By {metadata.author}</p>
                <div className="flex items-center justify-center gap-4 mt-6 text-xs uppercase tracking-[0.2em] font-medium opacity-40">
                    <span>{metadata.page_count} pages</span>
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    <span>Anti-Gravity Layout</span>
                </div>
            </div>

            <main className="flex-grow">
                {readingMode === 'scroll' ? (
                    <div className="max-w-3xl mx-auto space-y-12 font-serif-premium">
                        {pages.map((page) => (
                            <div key={page.number} className="relative pt-12">
                                {/* Page Marker */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-4 w-full opacity-20 pointer-events-none">
                                    <div className="flex-grow h-px bg-current"></div>
                                    <span className="text-[10px] uppercase tracking-[0.5em] font-bold whitespace-nowrap">Page {page.number}</span>
                                    <div className="flex-grow h-px bg-current"></div>
                                </div>

                                <div className="space-y-8 text-justify">
                                    {page.blocks.map((block) => {
                                        const isBookmarked = progress?.bookmarks?.find(b => b.id === block.id);
                                        if (block.type === 'heading') {
                                            return (
                                                <div key={block.id} className="relative group mt-16 mb-8">
                                                    <h2 className="font-bold font-display-premium leading-tight" style={{ fontSize: `${parseFloat(fontSize) * 1.5}px` }}>
                                                        {highlightText(block.text, searchTerm)}
                                                    </h2>
                                                    <button onClick={() => isBookmarked ? removeBookmark(block.id) : addBookmark(block.id, block.text)} className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                        {isBookmarked ? <BookmarkCheck className="w-6 h-6 text-blue-500" /> : <Bookmark className="w-6 h-6 opacity-30" />}
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return <p key={block.id} className="opacity-90 leading-relaxed mb-6">{highlightText(block.text, searchTerm)}</p>;
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="max-w-3xl mx-auto h-full flex items-center justify-center">
                        <div className="w-full animate-in fade-in slide-in-from-right-8 duration-500 ease-out font-serif-premium space-y-8 text-justify">
                            {pages[currentPageIndex]?.blocks.map((block) => {
                                const isBookmarked = progress?.bookmarks?.find(b => b.id === block.id);
                                if (block.type === 'heading') {
                                    return (
                                        <div key={block.id} className="relative group mt-12 mb-8">
                                            <h2 className="font-bold font-display-premium leading-tight" style={{ fontSize: `${parseFloat(fontSize) * 1.5}px` }}>
                                                {highlightText(block.text, searchTerm)}
                                            </h2>
                                            <button onClick={() => isBookmarked ? removeBookmark(block.id) : addBookmark(block.id, block.text)} className="absolute -left-16 top-1/2 -translate-y-1/2 p-3 opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                {isBookmarked ? <BookmarkCheck className="w-6 h-6 text-blue-500" /> : <Bookmark className="w-6 h-6 opacity-30" />}
                                            </button>
                                        </div>
                                    );
                                }
                                return <p key={block.id} className="opacity-90 leading-relaxed mb-6">{highlightText(block.text, searchTerm)}</p>;
                            })}
                        </div>
                    </div>
                )}
            </main>

            {readingMode === 'paginated' && (
                <div className="fixed bottom-12 left-0 right-0 flex justify-center items-center gap-10 px-10">
                    <button
                        onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
                        className="p-5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all disabled:opacity-5 group"
                        disabled={currentPageIndex === 0}
                    >
                        <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col items-center">
                        <span className="text-xs uppercase tracking-widest font-bold opacity-30 mb-1">Page</span>
                        <span className="text-xl font-display-premium font-medium opacity-60">
                            {pages[currentPageIndex]?.number || 1} <span className="text-sm opacity-30 mx-1">/</span> {pages[pages.length - 1]?.number || 1}
                        </span>
                    </div>
                    <button
                        onClick={() => setCurrentPageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                        className="p-5 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-all group disabled:opacity-5"
                        disabled={currentPageIndex === pages.length - 1}
                    >
                        <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            )}

        </div>
    );
}


