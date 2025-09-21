import React, { useEffect } from 'react';
import { XIcon } from './Icons';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
        >
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in border border-gray-700 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 id="modal-title" className="text-lg font-semibold text-white">{title}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700" aria-label="Close modal">
                        <XIcon size={20} />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto">
                    {children}
                </main>
                {footer && (
                    <footer className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800/50 rounded-b-2xl">
                        {footer}
                    </footer>
                )}
            </div>
        </div>
    );
};

export default Modal;