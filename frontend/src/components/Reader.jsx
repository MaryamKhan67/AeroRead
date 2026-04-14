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
            .filter(block => block.text && block.text.toLowerCase().includes(searchTerm.toLowerCase()))
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
        if (!text || !highlight.trim()) return text;
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
                }, 1000);
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
                    <span>Document Integrity Engine</span>
                </div>
            </div>

            <main className="flex-grow">
                {readingMode === 'scroll' ? (
                    <div className="max-w-4xl mx-auto space-y-16 pb-32">
                        {pages.map((page) => (
                            <div key={page.number} className="page-sheet rounded-[2rem] md:rounded-[3rem] p-10 md:p-20 relative overflow-hidden min-h-[600px]">
                                {/* Page Marker Overlay */}
                                <div className="absolute top-8 right-12 opacity-20 text-[10px] uppercase tracking-[0.3em] font-bold pointer-events-none">
                                    Page {page.number}
                                </div>

                                <div className="space-y-6">
                                    {page.blocks.map((block) => {
                                        const { bbox, pageWidth } = block;
                                        const style = {};

                                        if (bbox && pageWidth) {
                                            const [x0, y0, x1, y1] = bbox;
                                            style.marginLeft = `${(x0 / pageWidth) * 100}%`;
                                            style.width = `${((x1 - x0) / pageWidth) * 100}%`;
                                            style.maxWidth = '100%';
                                        }

                                        if (block.type === 'image') {
                                            return (
                                                <div key={block.id} className="relative z-10" style={style}>
                                                    <div className="my-12 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/30 p-2">
                                                        <img src={block.src} alt="Document illustration" className="w-full h-auto object-contain max-h-[75vh]" loading="lazy" />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        if (block.type === 'heading') {
                                            return (
                                                <div id={block.id} key={block.id} className="relative group mt-14 mb-8" style={style}>
                                                    <h2 className="font-bold font-display-premium leading-tight tracking-tight text-left" style={{ fontSize: `${parseFloat(fontSize) * 1.5}px` }}>
                                                        {highlightText(block.text, searchTerm, block.id)}
                                                    </h2>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div id={block.id} key={block.id} className="reader-content-block opacity-90 mb-6" style={{ ...style, fontSize: `${fontSize}px` }}>
                                                {highlightText(block.text, searchTerm, block.id)}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto h-full flex flex-col items-center justify-start p-4">
                        <div
                            className="page-sheet rounded-[2.5rem] md:rounded-[3.5rem] p-10 md:p-20 w-full animate-in fade-in zoom-in-95 duration-700 ease-out relative overflow-hidden flex flex-col"
                            style={{
                                aspectRatio: pages[currentPageIndex]?.blocks[0]?.pageWidth ? `${pages[currentPageIndex].blocks[0].pageWidth} / ${pages[currentPageIndex].blocks[0].pageHeight}` : '1 / 1.41',
                                minHeight: 'auto'
                            }}
                        >
                            {/* Page Marker Overlay */}
                            <div className="absolute top-10 right-14 opacity-20 text-[10px] uppercase tracking-[0.4em] font-bold pointer-events-none">
                                Page {pages[currentPageIndex]?.number}
                            </div>

                            <div className="space-y-6 pt-4">
                                {pages[currentPageIndex]?.blocks.map((block) => {
                                    const { bbox, pageWidth } = block;
                                    const style = {};

                                    if (bbox && pageWidth) {
                                        const [x0, y0, x1, y1] = bbox;
                                        // Use horizontal absolute positioning relative to page width
                                        // BUT use vertical flow (relative) to avoid overlap when text scales
                                        style.marginLeft = `${(x0 / pageWidth) * 100}%`;
                                        style.width = `${((x1 - x0) / pageWidth) * 100}%`;
                                        style.maxWidth = '100%';
                                    }

                                    if (block.type === 'image') {
                                        return (
                                            <div key={block.id} className="relative z-10" style={style}>
                                                <div className="my-6 rounded-2xl overflow-hidden shadow-sm border border-black/5 dark:border-white/5 bg-gray-50/50 dark:bg-gray-900/30 p-2">
                                                    <img src={block.src} alt="Document illustration" className="w-full h-auto object-contain max-h-[65vh] mx-auto" loading="lazy" />
                                                </div>
                                            </div>
                                        );
                                    }

                                    if (block.type === 'heading') {
                                        return (
                                            <div id={block.id} key={block.id} className="relative group mt-12 mb-8" style={style}>
                                                <h2 className="font-bold font-display-premium leading-tight tracking-tight text-left" style={{ fontSize: `${parseFloat(fontSize) * 1.6}px` }}>
                                                    {highlightText(block.text, searchTerm, block.id)}
                                                </h2>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div id={block.id} key={block.id} className="reader-content-block opacity-95 mb-4" style={{ ...style, fontSize: `${fontSize}px` }}>
                                            {highlightText(block.text, searchTerm, block.id)}
                                        </div>
                                    );
                                })}
                            </div>
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
