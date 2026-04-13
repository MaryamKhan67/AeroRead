import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';

export default function Uploader({ onUploadSuccess }) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setIsDragActive(true);
        } else if (e.type === 'dragleave') {
            setIsDragActive(false);
        }
    };

    const processFile = async (file) => {
        if (file.type !== 'application/pdf') {
            setError('Please upload a valid PDF file.');
            return;
        }

        setError(null);
        setLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const backendUrl = '/api/upload';
            const response = await fetch(backendUrl, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to process PDF');

            onUploadSuccess(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full my-auto py-10 px-4">
            <div className="text-center mb-12 max-w-2xl">
                <h2 className="text-5xl md:text-6xl font-bold mb-4 font-display-premium leading-tight tracking-tight">AeroRead Engine</h2>
                <p className="text-lg md:text-xl font-serif-premium opacity-60 leading-relaxed italic">Transform your PDF into a mobile-first, reflowable experience.</p>
            </div>

            <div
                className={`w-full max-w-2xl p-12 md:p-20 border-2 border-dashed rounded-[2.5rem] md:rounded-[3rem] flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group relative overflow-hidden
          ${isDragActive ? 'border-blue-500 bg-blue-500/5 scale-[1.02] shadow-2xl' : 'border-current/10 hover:border-current/30 hover:bg-black/5 dark:hover:bg-white/5'}
          ${loading ? 'pointer-events-none' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload').click()}
            >
                {/* Decorative background element */}
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                {loading ? (
                    <div className="flex flex-col items-center relative z-10 text-center">
                        <div className="relative mb-6">
                            <Loader2 className="w-16 h-16 md:w-20 md:h-20 animate-spin text-blue-500 opacity-20" />
                            <Loader2 className="w-16 h-16 md:w-20 md:h-20 animate-[spin_3s_linear_infinite] text-blue-500 absolute top-0" />
                        </div>
                        <p className="text-2xl md:text-3xl font-display-premium font-medium tracking-tight">Reconstructing...</p>
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-30 mt-4">Anti-Gravity Engine</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center relative z-10">
                        <div className="w-20 h-20 md:w-24 md:h-24 mb-6 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                            <UploadCloud className="w-8 h-8 md:w-10 md:h-10 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-2xl md:text-3xl text-center font-display-premium font-medium tracking-tight">Tap to upload</p>
                        <p className="text-sm opacity-40 mt-3 font-serif-premium italic">or drag a file here</p>
                    </div>
                )}
                <input
                    id="file-upload"
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={handleChange}
                />
            </div>

            {error && (
                <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl max-w-2xl w-full text-center font-medium shadow-sm flex items-center justify-center gap-3">
                    {error}
                </div>
            )}
        </div>
    );
}
