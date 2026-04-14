import { useState, useEffect } from 'react';
import Uploader from './components/Uploader';
import Reader from './components/Reader';
import MobileNav from './components/MobileNav';
import SettingsDrawer from './components/SettingsDrawer';
import TOCSidebar from './components/TOCSidebar';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';

function App() {
  const [readingData, setReadingData] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [theme, setTheme] = useState('light'); // light, dark, sepia
  const [fontSize, setFontSize] = useState(18); // default font size
  const [searchTerm, setSearchTerm] = useState('');
  const [readingMode, setReadingMode] = useState('paginated'); // 'scroll' or 'paginated'
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [letterSpacing, setLetterSpacing] = useState(0); // in px
  const [searchNavCommand, setSearchNavCommand] = useState(null);
  const [isNavVisible, setIsNavVisible] = useState(true);

  useEffect(() => {
    // Apply theme class to document body for global transitions
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const handleUploadSuccess = (response) => {
    // Response check based on backend upgrade
    const data = response.data || response;
    setReadingData(data);
    if (response.fileUrl) {
      setFileUrl(response.fileUrl);
    }
    setIsSidebarOpen(false);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNum) => {
    setCurrentPage(pageNum);
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === 'dark' ? 'dark text-white' : ''} ${readingData ? 'pb-24' : ''}`}>

      {/* Global Search Overlay (Mobile Style) */}
      {isSearchActive && readingData && (
        <div className={`fixed top-0 left-0 right-0 z-[60] p-4 pb-6 shadow-2xl animate-in slide-in-from-top duration-300 border-b border-current/10
          ${theme === 'dark' ? 'bg-gray-900' : theme === 'sepia' ? 'bg-[#f4ecd8]' : 'bg-white'}`}>
          <div className="max-w-xl mx-auto flex items-center gap-3">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
              <input
                autoFocus
                type="text"
                placeholder="Find in manuscript..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-black/5 dark:bg-white/5 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className={`flex items-center gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 ${!searchTerm ? 'opacity-20 pointer-events-none' : ''}`}>
              <button onClick={() => setSearchNavCommand('prev')} className="p-3 hover:bg-black/5 rounded-xl"><ChevronUp className="w-5 h-5" /></button>
              <button onClick={() => setSearchNavCommand('next')} className="p-3 hover:bg-black/5 rounded-xl"><ChevronDown className="w-5 h-5" /></button>
            </div>

            <button onClick={() => { setIsSearchActive(false); setSearchTerm(''); }} className="p-3 text-blue-500 font-bold text-sm uppercase tracking-widest">
              Done
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-grow relative">
        {readingData && (
          <TOCSidebar
            blocks={readingData.blocks || readingData.content || []}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            theme={theme}
            onSelectChapter={(id, pageNum) => {
              if (pageNum) handlePageChange(pageNum);
              setIsSidebarOpen(false);
            }}
          />
        )}

        <main
          className="flex-grow flex flex-col relative w-full overflow-x-hidden cursor-pointer"
          onClick={() => {
            if (readingData && !isSidebarOpen && !isSettingsOpen && !isSearchActive) {
              setIsNavVisible(v => !v);
            }
          }}
        >
          <div className="w-full max-w-5xl mx-auto py-4 cursor-default" onClick={e => e.stopPropagation()}>
            {!readingData ? (
              <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
                <Uploader onUploadSuccess={handleUploadSuccess} />
              </div>
            ) : (
              <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
                <Reader
                  data={readingData}
                  fontSize={fontSize}
                  letterSpacing={letterSpacing}
                  searchTerm={searchTerm}
                  readingMode={readingMode}
                  searchNavCommand={searchNavCommand}
                  onSearchNavComplete={() => setSearchNavCommand(null)}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Navigation & Controls Overlay */}
      {readingData && (
        <>
          <MobileNav
            isVisible={isNavVisible}
            readingMode={readingMode}
            setReadingMode={setReadingMode}
            currentPage={currentPage}
            totalPages={readingData?.metadata?.page_count || 1}
            onPageChange={handlePageChange}
            onOpenTOC={() => setIsSidebarOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleSearch={() => setIsSearchActive(!isSearchActive)}
            isSearchActive={isSearchActive}
            onHome={() => setReadingData(null)}
          />

          <SettingsDrawer
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            setTheme={setTheme}
            fontSize={fontSize}
            setFontSize={setFontSize}
            letterSpacing={letterSpacing}
            setLetterSpacing={setLetterSpacing}
            readingMode={readingMode}
            setReadingMode={setReadingMode}
          />
        </>
      )}

    </div>
  );
}

export default App;
