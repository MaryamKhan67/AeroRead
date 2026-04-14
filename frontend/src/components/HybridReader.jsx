import { useState, useEffect, useMemo, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, Minimize2 } from 'lucide-react';

// Configure the worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

export default function HybridReader({
    fileUrl,
    theme,
    readingMode,
    currentPage,
    onPageChange,
    onLoadSuccess
}) {
    const [numPages, setNumPages] = useState(null);
    const [zoom, setZoom] = useState(1.0);
    const containerRef = useRef(null);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        if (onLoadSuccess) onLoadSuccess(numPages);
    }

    // Apply theme inversion at the canvas level for Dark/Sepia
    const canvasFilter = useMemo(() => {
        if (theme === 'dark') return 'invert(1) hue-rotate(180deg) contrast(0.95) brightness(0.95)';
        if (theme === 'sepia') return 'sepia(0.6) contrast(1.1) brightness(0.95)';
        return 'none';
    }, [theme]);

    const pageScale = useMemo(() => {
        // Adjust scale based on zoom and container width
        return zoom;
    }, [zoom]);

    return (
        <div className="flex flex-col h-full bg-transparent overflow-hidden">
            {/* Context Stats */}
            <div className="flex items-center justify-between px-6 py-2 border-b border-black/5 dark:border-white/5 opacity-50 text-[10px] uppercase tracking-widest font-bold">
                <span>{theme === 'dark' ? 'Night Fidelity' : 'Direct Render'}</span>
                <div className="flex items-center gap-4">
                    <button onClick={() => setZoom(z => Math.max(0.5, z - 0.1))} className="hover:opacity-100"><ZoomOut size={14} /></button>
                    <span>{Math.round(zoom * 100)}%</span>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="hover:opacity-100"><ZoomIn size={14} /></button>
                </div>
            </div>

            <main ref={containerRef} className="flex-grow overflow-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
                <div className="max-w-max mx-auto">
                    <Document
                        file={fileUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                                <div className="w-12 h-12 border-4 border-black/10 dark:border-white/10 border-t-black dark:border-t-white rounded-full animate-spin"></div>
                                <p className="text-xs font-bold uppercase tracking-widest opacity-30">Summoning Document...</p>
                            </div>
                        }
                    >
                        {readingMode === 'scroll' ? (
                            Array.from(new Array(numPages), (el, index) => (
                                <div
                                    key={`page_${index + 1}`}
                                    className="page-sheet mb-16 shadow-2xl relative"
                                    style={{ filter: canvasFilter }}
                                >
                                    <Page
                                        pageNumber={index + 1}
                                        scale={pageScale}
                                        renderAnnotationLayer={true}
                                        renderTextLayer={true}
                                        className="rounded-lg overflow-hidden"
                                    />
                                    {/* Selectable text layer needs to NOT be filtered for colors to be correct */}
                                    {/* Note: React-PDF allows text layer to be separate but usually it's inside the Page wrapper */}
                                </div>
                            ))
                        ) : (
                            <div className="page-sheet shadow-2xl relative" style={{ filter: canvasFilter }}>
                                <Page
                                    pageNumber={currentPage}
                                    scale={pageScale}
                                    renderAnnotationLayer={true}
                                    renderTextLayer={true}
                                    className="rounded-lg overflow-hidden"
                                />
                            </div>
                        )}
                    </Document>
                </div>
            </main>

            {readingMode === 'paginated' && numPages && (
                <div className="fixed bottom-12 left-0 right-0 flex justify-center items-center gap-10 px-10 pointer-events-none">
                    <div className="pointer-events-auto flex items-center gap-6 bg-white/80 dark:bg-black/80 backdrop-blur-xl p-3 rounded-full border border-black/5 dark:border-white/5 shadow-2xl">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-5"
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col items-center min-w-[60px]">
                            <span className="text-[10px] uppercase tracking-widest font-bold opacity-30 leading-none mb-1">Page</span>
                            <span className="text-lg font-display-premium font-medium opacity-60 leading-none">
                                {currentPage} <span className="text-xs opacity-30 mx-0.5">/</span> {numPages}
                            </span>
                        </div>

                        <button
                            onClick={() => onPageChange(Math.min(numPages, currentPage + 1))}
                            className="p-3 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-all disabled:opacity-5"
                            disabled={currentPage === numPages}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
