import { Search, Settings, Menu, Layers, Type } from 'lucide-react';

export default function Toolbar({
    onToggleSidebar,
    onToggleSettings,
    onToggleSearch,
    isSearchActive,
    readingEngine,
    setReadingEngine
}) {
    return (
        <div className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex justify-between items-center bg-transparent pointer-events-none">
            {/* Left Actions */}
            <div className="flex items-center gap-3 pointer-events-auto">
                <button
                    onClick={onToggleSidebar}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg text-white hover:bg-white/20 transition-all active:scale-95"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 pointer-events-auto">
                {/* Engine Toggle */}
                <div className="flex p-1 bg-black/5 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
                    <button
                        onClick={() => setReadingEngine('fidelity')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${readingEngine === 'fidelity'
                                ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl'
                                : 'opacity-40 hover:opacity-100'
                            }`}
                    >
                        <Layers className="w-3 h-3" />
                        Fidelity
                    </button>
                    <button
                        onClick={() => setReadingEngine('reflow')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.2em] font-bold transition-all ${readingEngine === 'reflow'
                                ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-xl'
                                : 'opacity-40 hover:opacity-100'
                            }`}
                    >
                        <Type className="w-3 h-3" />
                        Reflow
                    </button>
                </div>

                <button
                    onClick={onToggleSearch}
                    className={`p-3 rounded-2xl border transition-all active:scale-95 ${isSearchActive
                            ? 'bg-blue-500 border-blue-400 text-white shadow-blue-500/40 shadow-xl'
                            : 'bg-white/10 backdrop-blur-md border-white/20 text-white shadow-lg hover:bg-white/20'
                        }`}
                >
                    <Search className="w-5 h-5" />
                </button>

                <button
                    onClick={onToggleSettings}
                    className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg text-white hover:bg-white/20 transition-all active:scale-95"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
