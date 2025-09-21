import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { FileReference } from '../../types';
import { XIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon, FileIcon, PlayIcon } from './Icons';

interface FileViewerModalProps {
    viewingState: { files: FileReference[]; startIndex: number } | null;
    onClose: () => void;
}

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


const Thumbnail: React.FC<{
    fileRef: FileReference;
    isActive: boolean;
    onClick: () => void;
}> = ({ fileRef, isActive, onClick }) => {
    const thumbRef = useRef<HTMLButtonElement>(null);

    const isMedia = fileRef.type.startsWith('image/') || fileRef.type.startsWith('video/');
    const isVideo = fileRef.type.startsWith('video/');

    const thumbnailUrl = useMemo(() => {
        if (fileRef.url) return fileRef.url;
        if (fileRef.file && isMedia) {
            try {
                return URL.createObjectURL(fileRef.file);
            } catch (error) {
                console.error('Error creating object URL for thumbnail:', error);
                return null;
            }
        }
        return null;
    }, [fileRef]);

    useEffect(() => {
        // Scroll the active thumbnail into view
        if (isActive) {
            thumbRef.current?.scrollIntoView({
                behavior: 'smooth',
                inline: 'center',
                block: 'nearest',
            });
        }
    }, [isActive]);
    
    useEffect(() => {
        // Cleanup blob URL
        return () => {
            if (thumbnailUrl && thumbnailUrl.startsWith('blob:')) {
                URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [thumbnailUrl]);

    return (
        <button
            ref={thumbRef}
            onClick={onClick}
            className={`relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 transition-all duration-200 ${isActive ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-900/50' : 'ring-1 ring-white/20 hover:ring-white/50'}`}
            aria-label={`View file ${fileRef.name}`}
        >
            {thumbnailUrl ? (
                <>
                    {isVideo ? (
                        <video src={thumbnailUrl} className="w-full h-full object-cover" />
                    ) : (
                        <img src={thumbnailUrl} alt={`Thumbnail for ${fileRef.name}`} className="w-full h-full object-cover" />
                    )}
                    {isVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                            <PlayIcon size={16} className="text-white" />
                        </div>
                    )}
                </>
            ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <FileIcon size={24} className="text-gray-400" />
                </div>
            )}
        </button>
    );
};


const FileViewerModal: React.FC<FileViewerModalProps> = ({ viewingState, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(viewingState?.startIndex ?? 0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [touchStartX, setTouchStartX] = useState<number | null>(null);

    const thumbnailContainerRef = useRef<HTMLDivElement>(null);
    const files = viewingState?.files;

    useEffect(() => {
        if (viewingState) {
            setCurrentIndex(viewingState.startIndex);
        }
    }, [viewingState]);

    const handlePrev = useCallback(() => {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, []);

    const handleNext = useCallback(() => {
        if (files) {
            setCurrentIndex(prev => (prev < files.length - 1 ? prev + 1 : prev));
        }
    }, [files]);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            else if (e.key === 'ArrowLeft') handlePrev();
            else if (e.key === 'ArrowRight') handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, handlePrev, handleNext]);

    const currentFile = files ? files[currentIndex] : null;

    const fileUrl = useMemo(() => {
        if (!currentFile) return null;
        if (currentFile.url) return currentFile.url;
        if (currentFile.file) {
            try {
                return URL.createObjectURL(currentFile.file);
            } catch (error) {
                console.error('Error creating object URL:', error);
                return null;
            }
        }
        return null;
    }, [currentFile]);

    useEffect(() => {
        return () => {
            if (fileUrl && fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(fileUrl);
            }
        };
    }, [fileUrl]);
    
    if (!viewingState || !currentFile) {
        return null;
    }

    const handleDownload = async () => {
        if (!fileUrl || !currentFile) return;
        setIsDownloading(true);
        try {
            const response = await fetch(fileUrl);
            if (!response.ok) throw new Error('Network response was not ok.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = currentFile.name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback for direct links
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = currentFile.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } finally {
            setIsDownloading(false);
        }
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        if (files && files.length > 1) {
            setTouchStartX(e.touches[0].clientX);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX === null) return;
        
        const touchCurrentX = e.touches[0].clientX;
        const deltaX = touchCurrentX - touchStartX;
        const swipeThreshold = 50; // pixels

        if (deltaX > swipeThreshold) {
            handlePrev();
            setTouchStartX(null); // Reset after swipe
        } else if (deltaX < -swipeThreshold) {
            handleNext();
            setTouchStartX(null); // Reset after swipe
        }
    };

    const handleTouchEnd = () => {
        setTouchStartX(null);
    };

    const renderFile = () => {
        if (!fileUrl) {
            return <div className="text-center text-gray-400">Could not display file.</div>;
        }

        const type = currentFile.type;

        if (type.startsWith('image/')) {
            return <img src={fileUrl} alt={currentFile.name} className="max-w-full max-h-full object-contain" />;
        }
        if (type.startsWith('video/')) {
            return <video src={fileUrl} controls autoPlay className="max-w-full max-h-full object-contain" />;
        }
        if (type === 'application/pdf') {
            return <iframe src={fileUrl} title={currentFile.name} className="w-full h-full border-0 bg-white rounded-lg" />;
        }
        
        return (
            <div className="flex flex-col items-center justify-center text-white bg-gray-800 p-8 rounded-lg">
                <FileIcon size={64} className="mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-1">{currentFile.name}</h3>
                <p className="text-sm text-gray-500">{formatBytes(currentFile.size)}</p>
                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="mt-6 flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-blue-800 disabled:cursor-wait"
                >
                    {isDownloading ? <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <DownloadIcon size={16} />}
                    {isDownloading ? 'Downloading...' : 'Download'}
                </button>
            </div>
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center p-4 backdrop-blur-sm animate-scale-in"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <header className="w-full flex items-center justify-between p-4 absolute top-0 left-0 text-white z-10 bg-black/50 backdrop-blur-sm" onClick={e => e.stopPropagation()}>
                <div>
                    <h3 className="font-semibold">{currentFile.name}</h3>
                    <p className="text-sm text-gray-400">
                        {currentIndex + 1} of {files.length} ({formatBytes(currentFile.size)})
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleDownload}
                        disabled={isDownloading}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
                        aria-label="Download file"
                    >
                        {isDownloading ? <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div> : <DownloadIcon size={20} />}
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                        aria-label="Close viewer"
                    >
                        <XIcon size={24} />
                    </button>
                </div>
            </header>
            
            <div 
                className="relative flex-grow w-full h-full flex items-center justify-center max-h-[calc(100vh-180px)] mt-16 mb-24"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {renderFile()}
            </div>

            {files.length > 1 && (
                <>
                    <div className="absolute inset-y-0 w-full flex items-center justify-between px-4 pointer-events-none z-20">
                        <button
                            onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                            disabled={currentIndex === 0}
                            className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
                            aria-label="Previous file"
                        >
                            <ChevronLeftIcon size={28} />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleNext(); }}
                            disabled={currentIndex === files.length - 1}
                            className="p-3 bg-black/40 rounded-full text-white hover:bg-black/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed pointer-events-auto"
                            aria-label="Next file"
                        >
                            <ChevronRightIcon size={28} />
                        </button>
                    </div>
                    <footer className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 backdrop-blur-sm z-10" onClick={e => e.stopPropagation()}>
                        <div ref={thumbnailContainerRef} className="flex items-center justify-center gap-3 overflow-x-auto no-scrollbar pb-1">
                            {files.map((file, index) => (
                                <Thumbnail
                                    key={index}
                                    fileRef={file}
                                    isActive={index === currentIndex}
                                    onClick={() => setCurrentIndex(index)}
                                />
                            ))}
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
};

export default FileViewerModal;