import React from 'react';
import { ArrowLeftIcon, TrashIcon, ChevronRightIcon } from '../common/Icons';

interface TrashSettingsViewProps {
    onBack: () => void;
    trashRetentionDays: number;
    setTrashRetentionDays: (days: number) => void;
    onEmptyTrash: () => void;
    onNavigateToTrashItems: () => void;
}

const NavigationalItem: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-4 text-left hover:bg-gray-800/80 transition-colors bg-gray-800/50 rounded-lg">
        <div className="w-8 text-gray-400">{icon}</div>
        <div className="flex-grow ml-1">
            <h3 className="font-medium text-gray-200">{title}</h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <ChevronRightIcon size={20} className="text-gray-500" />
    </button>
);

const TrashSettingsView: React.FC<TrashSettingsViewProps> = ({ onBack, trashRetentionDays, setTrashRetentionDays, onEmptyTrash, onNavigateToTrashItems }) => {
    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900 z-10">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-white">Trash Settings</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                     <div className="mb-6">
                        <NavigationalItem
                            icon={<TrashIcon size={20} />}
                            title="View Trashed Items"
                            subtitle="Review and restore deleted conversations"
                            onClick={onNavigateToTrashItems}
                        />
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
                        <h2 className="font-medium text-gray-200 mb-1">Trash Retention Period</h2>
                        <p className="text-xs text-gray-400 mb-4">Automatically delete items from the trash after this many days.</p>
                        <div className="flex items-center">
                            <input
                                type="range"
                                min="1"
                                max="30"
                                step="1"
                                value={trashRetentionDays}
                                onChange={(e) => setTrashRetentionDays(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="ml-4 text-sm font-mono w-16 text-right text-gray-300">{trashRetentionDays} day{trashRetentionDays > 1 ? 's' : ''}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-700/50 my-6"></div>

                    <div>
                         <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h3>
                         <div className="bg-gray-800/50 rounded-lg p-4 flex items-center justify-between">
                             <div>
                                 <h4 className="font-semibold text-red-400">Empty Trash</h4>
                                 <p className="text-sm text-gray-400">Permanently delete all items currently in the trash. This action cannot be undone.</p>
                             </div>
                            <button
                                onClick={onEmptyTrash}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors flex-shrink-0 ml-4"
                            >
                                <TrashIcon size={16} />
                                Empty Trash Now
                            </button>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TrashSettingsView;