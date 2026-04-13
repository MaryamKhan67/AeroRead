// frontend/src/hooks/useProgress.js
import { useState, useCallback } from 'react';

export default function useProgress(documentId) {
    const getInitialProgress = () => {
        try {
            const stored = localStorage.getItem(`progress_${documentId}`);
            return stored ? JSON.parse(stored) : { scrollTop: 0, bookmarks: [] };
        } catch (err) {
            return { scrollTop: 0, bookmarks: [] };
        }
    };

    const [progress, setProgressState] = useState(getInitialProgress);

    const saveProgress = useCallback((newProgressData) => {
        setProgressState(prev => {
            const updated = { ...prev, ...newProgressData };
            localStorage.setItem(`progress_${documentId}`, JSON.stringify(updated));
            return updated;
        });
    }, [documentId]);

    const addBookmark = useCallback((bookmarkId, title) => {
        setProgressState(prev => {
            const bookmarks = prev.bookmarks || [];
            if (!bookmarks.find(b => b.id === bookmarkId)) {
                const updated = { ...prev, bookmarks: [...bookmarks, { id: bookmarkId, title, timestamp: Date.now() }] };
                localStorage.setItem(`progress_${documentId}`, JSON.stringify(updated));
                return updated;
            }
            return prev;
        });
    }, [documentId]);

    const removeBookmark = useCallback((bookmarkId) => {
        setProgressState(prev => {
            const bookmarks = prev.bookmarks || [];
            const updated = { ...prev, bookmarks: bookmarks.filter(b => b.id !== bookmarkId) };
            localStorage.setItem(`progress_${documentId}`, JSON.stringify(updated));
            return updated;
        });
    }, [documentId]);

    return {
        progress,
        saveProgress,
        addBookmark,
        removeBookmark
    };
}
