import { Menu, Search, Type, Home, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MobileNav({
    isVisible = true,
    onOpenTOC,
    onOpenSettings,
    onToggleSearch,
    isSearchActive,
    onHome,
    currentPage,
    totalPages,
    onPageChange,
    readingMode
}) {
    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 px-6 py-4 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-black/5 dark:border-white/10 flex flex-col gap-4 safe-area-bottom shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-out ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>

            {/* Progress Bar (Subtle) */}
            <div className="w-full h-1 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                />
            </div>

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <button
                        onClick={onHome}
                        className="p-3 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Home"
                    >
                        <Home className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onOpenTOC}
                        className="p-3 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Table of Contents"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                </div>

                {/* Page Navigation Controls */}
                {readingMode === 'paginated' && (
                    <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 rounded-2xl px-2 py-1">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            className="p-2 opacity-60 hover:opacity-100 disabled:opacity-10"
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex flex-col items-center min-w-[60px]">
                            <span className="text-[10px] uppercase tracking-widest font-black opacity-30 leading-none">Page</span>
                            <span className="text-sm font-bold opacity-60">
                                {currentPage} <span className="opacity-30">/</span> {totalPages}
                            </span>
                        </div>

                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            className="p-2 opacity-60 hover:opacity-100 disabled:opacity-10"
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <button
                        onClick={onToggleSearch}
                        className={`p-3 transition-opacity ${isSearchActive ? 'text-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5" />
                    </button>

                    <button
                        onClick={onOpenSettings}
                        className="p-3 opacity-60 hover:opacity-100 transition-opacity"
                        aria-label="Settings"
                    >
                        <Type className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </nav>
    );
}
