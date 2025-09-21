import React from 'react';
import { ArrowLeftIcon } from '../common/Icons';

interface LogViewProps {
    onBack: () => void;
}

const LogView: React.FC<LogViewProps> = ({ onBack }) => {
    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-white">Logs & Errors</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                 <div className="max-w-3xl mx-auto">
                    <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">
                        <p><span className="text-green-400">[INFO]</span> Application initialized successfully.</p>
                        <p><span className="text-green-400">[INFO]</span> Fetching conversations...</p>
                        <p><span className="text-yellow-400">[WARN]</span> API response time is high: 1500ms.</p>
                        <p><span className="text-red-500">[ERROR]</span> Failed to load resource: conversation_id_123.</p>
                        <p>No new logs.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LogView;