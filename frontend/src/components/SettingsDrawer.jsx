import { Sun, Moon, Coffee, X, ZoomIn, ZoomOut, Type, AlignLeft, Columns } from 'lucide-react';

export default function SettingsDrawer({
    isOpen,
    onClose,
    theme, setTheme,
    fontSize, setFontSize,
    letterSpacing, setLetterSpacing,
    readingMode, setReadingMode
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-24 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-inherit border border-current/10 rounded-[2.5rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-bold font-display-premium">Reading Settings</h3>
                    <button onClick={onClose} className="p-2 opacity-40 hover:opacity-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-12">
                    {/* Reading Mode */}
                    <section>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4 text-center">Reading Mode</p>
                        <div className="grid grid-cols-2 gap-4 p-1 rounded-2xl bg-black/5 dark:bg-white/5">
                            <button
                                onClick={() => setReadingMode('scroll')}
                                className={`flex items-center justify-center gap-3 py-4 rounded-xl transition-all ${readingMode === 'scroll' ? 'bg-white dark:bg-gray-800 shadow-lg scale-[1.02]' : 'opacity-40'}`}
                            >
                                <AlignLeft className="w-5 h-5" />
                                <span className="font-medium">Scroll</span>
                            </button>
                            <button
                                onClick={() => setReadingMode('paginated')}
                                className={`flex items-center justify-center gap-3 py-4 rounded-xl transition-all ${readingMode === 'paginated' ? 'bg-white dark:bg-gray-800 shadow-lg scale-[1.02]' : 'opacity-40'}`}
                            >
                                <Columns className="w-5 h-5" />
                                <span className="font-medium">Pages</span>
                            </button>
                        </div>
                    </section>

                    {/* Font Size & Spacing */}
                    <section className="grid grid-cols-1 gap-10">
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">Text Size</p>
                            <div className="flex items-center justify-between w-full px-4">
                                <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-4 rounded-full bg-black/5 dark:bg-white/5"><ZoomOut className="w-6 h-6" /></button>
                                <span className="text-2xl font-display-premium">{fontSize}px</span>
                                <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-4 rounded-full bg-black/5 dark:bg-white/5"><ZoomIn className="w-6 h-6" /></button>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30">Comfort Spacing</p>
                            <div className="flex items-center justify-between w-full px-4">
                                <button onClick={() => setLetterSpacing(Math.max(-1, letterSpacing - 0.5))} className="p-4 rounded-full bg-black/5 dark:bg-white/5"><Type className="w-4 h-4" /></button>
                                <span className="text-2xl font-display-premium">{letterSpacing}</span>
                                <button onClick={() => setLetterSpacing(Math.min(5, letterSpacing + 0.5))} className="p-4 rounded-full bg-black/5 dark:bg-white/5"><Type className="w-6 h-6" /></button>
                            </div>
                        </div>
                    </section>

                    {/* Themes */}
                    <section>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mb-4 text-center">Appearance</p>
                        <div className="flex justify-between items-center gap-4">
                            {[
                                { id: 'light', icon: Sun, label: 'Light', color: 'bg-white text-orange-500' },
                                { id: 'sepia', icon: Coffee, label: 'Sepia', color: 'bg-[#f4ecd8] text-[#ad7641]' },
                                { id: 'dark', icon: Moon, label: 'Dark', color: 'bg-gray-800 text-blue-400 font-bold' }
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex-1 flex flex-col items-center gap-3 py-6 rounded-3xl transition-all border-2
                                        ${theme === t.id ? `border-blue-500 ${t.color} scale-105 shadow-xl` : 'border-transparent bg-black/5 dark:bg-white/5 opacity-50'}`}
                                >
                                    <t.icon className="w-6 h-6" />
                                    <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
