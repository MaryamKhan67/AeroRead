import { Menu, Search, Type, Home, Layout } from 'lucide-react';

export default function MobileNav({
    onOpenTOC,
    onOpenSettings,
    onToggleSearch,
    isSearchActive,
    onHome
}) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 py-4 bg-inherit border-t border-current/10 backdrop-blur-xl flex justify-between items-center safe-area-bottom">
            <button
                onClick={onHome}
                className="p-3 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Home"
            >
                <Home className="w-6 h-6" />
            </button>

            <button
                onClick={onOpenTOC}
                className="p-3 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Table of Contents"
            >
                <Menu className="w-6 h-6" />
            </button>

            <button
                onClick={onToggleSearch}
                className={`p-3 transition-opacity ${isSearchActive ? 'text-blue-500 opacity-100' : 'opacity-60 hover:opacity-100'}`}
                aria-label="Search"
            >
                <Search className="w-6 h-6" />
            </button>

            <button
                onClick={onOpenSettings}
                className="p-3 opacity-60 hover:opacity-100 transition-opacity"
                aria-label="Settings"
            >
                <Type className="w-6 h-6" />
            </button>
        </nav>
    );
}
