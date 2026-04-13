import { AlignLeft, X, ChevronRight } from 'lucide-react';

export default function TOCSidebar({ blocks, isOpen, setIsOpen, theme }) {
    const headings = blocks.filter(block => block.type === 'heading');

    const scrollToHeading = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Close sidebar on mobile after clicking
            if (window.innerWidth < 768) {
                setIsOpen(false);
            }
        }
    };

    return (
        <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            ></div>

            <aside
                className={`absolute top-0 left-0 h-full w-[85%] max-w-sm transition-transform duration-500 ease-in-out border-r shadow-2xl
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${theme === 'dark' ? 'bg-gray-900 border-gray-800' :
                        theme === 'sepia' ? 'bg-[#f4ecd8] border-[#ad7641]/20' :
                            'bg-white border-gray-100'}`}
            >
                <div className={`h-full overflow-y-auto w-full p-8 custom-scrollbar`}>
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold font-display-premium flex items-center gap-3">
                            <AlignLeft className="w-6 h-6" />
                            Contents
                        </h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-3 bg-black/5 dark:bg-white/5 rounded-full"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {headings.length === 0 ? (
                        <p className="text-lg opacity-40 font-serif-premium italic mt-10 text-center">No chapters found.</p>
                    ) : (
                        <nav className="space-y-2 pb-20">
                            {headings.map((heading) => (
                                <button
                                    key={heading.id}
                                    onClick={() => scrollToHeading(heading.id)}
                                    className={`w-full text-left p-4 rounded-2xl text-lg transition-all flex items-start gap-3 group
                                        ${theme === 'dark' ? 'hover:bg-white/5 active:bg-white/10' : 'hover:bg-black/5 active:bg-black/10'}`}
                                >
                                    <ChevronRight className="w-5 h-5 mt-1 opacity-20 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    <span className="leading-snug font-serif-premium">{heading.text}</span>
                                </button>
                            ))}
                        </nav>
                    )}
                </div>
            </aside>
        </div>
    );
}
