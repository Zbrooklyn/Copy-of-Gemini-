import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, AdvancedSearchOptions, Label } from '../../types';
import * as Icons from '../common/Icons';
import PopoverMenu, { PopoverMenuItem } from '../common/PopoverMenu';
import { Theme, Density, LineCount } from '../../App';
import SearchResultsView from './SearchResultsView';
import Modal from '../common/Modal';

// --- Helper Components for AdvancedSearchPanel ---

const SearchSegmentedControl: React.FC<{
    options: { label: string, value: any }[];
    value: any;
    onChange: (value: any) => void;
}> = ({ options, value, onChange }) => (
    <div className="flex items-center rounded-lg bg-gray-700/50 p-1 space-x-1 w-full">
        {options.map(option => (
            <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors w-full ${value === option.value ? 'bg-accent text-white' : 'text-gray-200 hover:bg-gray-600'}`}
            >
                {option.label}
            </button>
        ))}
    </div>
);

const SearchCheckbox: React.FC<{ label: string; checked: boolean; onChange: (checked: boolean) => void; }> = ({ label, checked, onChange }) => (
    <label className="flex items-center space-x-2 cursor-pointer">
        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${checked ? 'bg-accent border-accent' : 'border-gray-500'}`}>
            {checked && <Icons.CheckIcon size={12} className="text-white" strokeWidth={3} />}
        </div>
        <span className="text-sm text-gray-300">{label}</span>
    </label>
);

const AttachmentTypeToggle: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
     <button
        type="button"
        onClick={onClick}
        className={`flex items-center space-x-2 px-3 py-1.5 text-sm rounded-full transition-colors ${isActive ? 'bg-accent text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-200'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);


// --- AdvancedSearchPanel Component ---

interface AdvancedSearchPanelProps {
    options: AdvancedSearchOptions;
    onOptionChange: (newOptions: AdvancedSearchOptions) => void;
    onApply: () => void;
    onClear: () => void;
}

const AdvancedSearchPanel: React.FC<AdvancedSearchPanelProps> = ({ options, onOptionChange, onApply, onClear }) => {
    const handleAttachmentTypeToggle = (type: 'image' | 'video' | 'file') => {
        const newTypes = new Set(options.attachmentTypes);
        if (newTypes.has(type)) {
            newTypes.delete(type);
        } else {
            newTypes.add(type);
        }
        onOptionChange({ ...options, attachmentTypes: newTypes });
    };

    return (
        <div className="bg-gray-800/70 border-b border-gray-700/50">
            <div className="p-4 space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Search In</label>
                    <SearchSegmentedControl
                        options={[{ label: 'Everywhere', value: 'everywhere' }, { label: 'Title', value: 'title' }, { label: 'Messages', value: 'messages' }]}
                        value={options.searchIn}
                        onChange={val => onOptionChange({ ...options, searchIn: val })}
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Date Range</label>
                    <div className="flex items-center space-x-2">
                        <input type="date" value={options.dateFrom} onChange={e => onOptionChange({ ...options, dateFrom: e.target.value })} className="w-full bg-gray-700/50 text-gray-200 text-sm rounded-md p-1.5 border border-gray-600 focus:ring-accent focus:border-accent" />
                        <span className="text-gray-400">-</span>
                        <input type="date" value={options.dateTo} onChange={e => onOptionChange({ ...options, dateTo: e.target.value })} className="w-full bg-gray-700/50 text-gray-200 text-sm rounded-md p-1.5 border border-gray-600 focus:ring-accent focus:border-accent" />
                    </div>
                </div>
                <div>
                    <SearchCheckbox
                        label="Has Attachment"
                        checked={options.hasAttachment}
                        onChange={val => onOptionChange({ ...options, hasAttachment: val })}
                    />
                    {options.hasAttachment && (
                        <div className="mt-2 flex items-center space-x-2 pl-6">
                            <AttachmentTypeToggle label="Images" icon={<Icons.ImageIcon size={14} />} isActive={options.attachmentTypes.has('image')} onClick={() => handleAttachmentTypeToggle('image')} />
                            <AttachmentTypeToggle label="Videos" icon={<Icons.PlayIcon size={14} />} isActive={options.attachmentTypes.has('video')} onClick={() => handleAttachmentTypeToggle('video')} />
                            <AttachmentTypeToggle label="Files" icon={<Icons.FileTextIcon size={14} />} isActive={options.attachmentTypes.has('file')} onClick={() => handleAttachmentTypeToggle('file')} />
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-700"></div>

                <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Sort By</label>
                     <div className="flex items-center space-x-2">
                        <SearchSegmentedControl
                            options={[{ label: 'Last Updated', value: 'timestamp' }, { label: 'Title', value: 'title' }]}
                            value={options.sortBy}
                            onChange={val => onOptionChange({ ...options, sortBy: val })}
                        />
                        <SearchSegmentedControl
                            options={[{ label: 'Desc', value: 'desc' }, { label: 'Asc', value: 'asc' }]}
                            value={options.sortOrder}
                            onChange={val => onOptionChange({ ...options, sortOrder: val })}
                        />
                    </div>
                </div>
            </div>
            <div className="bg-gray-900/50 p-2 flex justify-end space-x-2">
                <button onClick={onClear} className="px-3 py-1 text-sm font-semibold text-gray-300 hover:bg-gray-700 rounded-md">Clear</button>
                <button onClick={onApply} className="px-3 py-1 text-sm font-semibold text-white bg-accent hover:opacity-80 rounded-md">Apply</button>
            </div>
        </div>
    );
};


const FilterPill: React.FC<{ label: string; active?: boolean; isDropTarget?: boolean; onClick: () => void; onDragOver: (e: React.DragEvent) => void; onDragLeave: (e: React.DragEvent) => void; onDrop: (e: React.DragEvent) => void; onDragEnter: (e: React.DragEvent) => void; }> = ({ label, active, isDropTarget, onClick, ...dragProps }) => (
    <button
        onClick={onClick}
        {...dragProps}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap ${
            active ? 'bg-accent text-white' : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
        } ${isDropTarget ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-accent scale-110' : ''}`}
    >
        {label}
    </button>
);

const LabelChip: React.FC<{ label: string; allLabels: Label[] }> = ({ label, allLabels }) => {
    const labelData = allLabels.find(l => l.name === label);
    const color = labelData ? labelData.color : '#9CA3AF'; // Default gray
    
    // Basic function to determine if a color is light or dark
    const isLight = (hex: string) => {
        const { r, g, b } = {
            r: parseInt(hex.slice(1, 3), 16),
            g: parseInt(hex.slice(3, 5), 16),
            b: parseInt(hex.slice(5, 7), 16),
        };
        return (r * 299 + g * 587 + b * 114) / 1000 > 150;
    }

    const textColor = isLight(color) ? 'text-gray-800' : 'text-gray-100';

    return (
        <span
            className={`px-2 py-0.5 text-xs font-medium rounded-md ${textColor}`}
            style={{ backgroundColor: color }}
        >
            {label}
        </span>
    );
};

const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) {
        return text;
    }
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? (
                    <strong key={index} className="bg-yellow-500/40 font-semibold text-yellow-200 rounded-[3px]">
                        {part}
                    </strong>
                ) : (
                    part
                )
            )}
        </>
    );
};

const Avatar: React.FC<{ conversation: Conversation; isCondensed: boolean }> = ({ conversation, isCondensed }) => {
    const sizeClasses = isCondensed ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl';
    const baseClasses = `rounded-full flex-shrink-0 mr-4 flex items-center justify-center text-white font-bold`;

    if (conversation.type === 'group') {
        return (
            <div className={`${sizeClasses} ${baseClasses} bg-gray-600`}>
                <Icons.UsersIcon size={isCondensed ? 20 : 24} />
            </div>
        );
    }

    if (conversation.type === 'persona_1_on_1' && conversation.avatar) {
        const IconComponent = (Icons as any)[`${conversation.avatar}Icon`] || Icons.BotIcon;
        return (
            <div className={`${sizeClasses} ${baseClasses} bg-purple-500`}>
                <IconComponent size={isCondensed ? 20 : 24} />
            </div>
        );
    }
    
    // Default for 'personal'
    return (
        <div className={`${sizeClasses} ${baseClasses} ${conversation.avatar}`}>
            {conversation.title.charAt(0)}
        </div>
    );
};

const ConversationRow: React.FC<{ 
    conversation: Conversation; 
    isSelected: boolean; 
    onSelect: (id: string) => void; 
    onDeselect: (id: string) => void; 
    isMultiSelectMode: boolean; 
    onConversationSelect: (id: string) => void; 
    onMoreClick: (event: React.MouseEvent, conversation: Conversation) => void;
    onContextMenu: (event: React.MouseEvent, conversation: Conversation) => void;
    onDragStart: (event: React.DragEvent, id: string) => void;
    density: Density;
    lineCount: LineCount;
    searchQuery: string;
    trashRetentionDays: number;
    allLabels: Label[];
}> = ({ conversation, isSelected, onSelect, onDeselect, isMultiSelectMode, onConversationSelect, onMoreClick, onContextMenu, onDragStart, density, lineCount, searchQuery, trashRetentionDays, allLabels }) => {
    
    const handleRowClick = () => {
        if (isMultiSelectMode) {
            if (isSelected) {
                onDeselect(conversation.id);
            } else {
                onSelect(conversation.id);
            }
        } else {
            onConversationSelect(conversation.id);
        }
    }

    const isCondensed = density === 'condensed';
    
    let retentionInfo: string | null = null;
    if (conversation.deletedTimestamp && trashRetentionDays) {
        const deletionTime = conversation.deletedTimestamp + trashRetentionDays * 24 * 60 * 60 * 1000;
        const remainingMs = deletionTime - Date.now();
        if (remainingMs > 0) {
            const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
            retentionInfo = `Deletes in ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        } else {
            retentionInfo = 'Pending permanent deletion';
        }
    }

    return (
        <div
            className={`relative flex items-center pl-4 cursor-pointer transition-colors duration-150 group border-b border-gray-800 ${isSelected ? 'bg-accent/20' : 'hover:bg-gray-800/60'} ${isCondensed ? 'py-2' : 'py-3'}`}
            role="button"
            aria-label={`Open conversation: ${conversation.title}`}
            onClick={handleRowClick}
            onContextMenu={(e) => onContextMenu(e, conversation)}
            draggable={!isMultiSelectMode}
            onDragStart={(e) => onDragStart(e, conversation.id)}
        >
            {isMultiSelectMode && (
                <div className="mr-4">
                    <div className={`w-5 h-5 rounded border-2 ${isSelected ? 'bg-accent border-accent' : 'border-gray-600'}`}>
                        {isSelected && <svg viewBox="0 0 16 16" fill="white"><path d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/></svg>}
                    </div>
                </div>
            )}
            <Avatar conversation={conversation} isCondensed={isCondensed} />

            <div className={`flex-grow overflow-hidden ${isMultiSelectMode ? 'pr-4' : 'pr-4 md:pr-12'}`}>
                <div className="flex justify-between items-center">
                    <h3 className={`truncate ${isCondensed ? 'text-sm' : 'text-base'} ${conversation.unread && !retentionInfo ? 'font-semibold text-white' : 'font-medium text-gray-300'}`}>
                        {highlightText(conversation.title, searchQuery)}
                    </h3>
                    <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{conversation.timestamp}</span>
                </div>
                
                {lineCount === 2 ? (
                    <div className="flex justify-between items-start mt-1">
                        <p className={`text-gray-400 truncate ${conversation.unread && !retentionInfo ? 'font-medium text-gray-200' : ''} ${isCondensed ? 'text-xs' : 'text-sm'}`}>
                            {retentionInfo ? (
                                <span className="text-red-400 italic">{retentionInfo}</span>
                            ) : (
                                highlightText(conversation.lastMessage, searchQuery)
                            )}
                        </p>
                        <div className="flex items-center space-x-2 flex-shrink-0">
                             {conversation.cost && <span className="text-xs font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-md">{conversation.cost.total}</span>}
                            {conversation.labels && conversation.labels.length > 0 && <LabelChip label={conversation.labels[0]} allLabels={allLabels} />}
                            {conversation.labels && conversation.labels.length > 1 && <span className="text-xs font-medium text-gray-400">+ {conversation.labels.length - 1}</span>}
                            {conversation.starred && <Icons.StarIcon className="text-yellow-400" size={14}/>}
                            {conversation.pinned && <Icons.PinIcon className="text-gray-500" size={14}/>}
                            {typeof conversation.unread === 'number' && conversation.unread > 0 ? (
                                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">{conversation.unread}</div>
                            ) : conversation.unread && (
                                <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>
                            )}
                        </div>
                    </div>
                ) : ( // 3-line layout
                    <>
                        <p className={`text-gray-400 truncate ${conversation.unread && !retentionInfo ? 'font-medium text-gray-200' : ''} ${isCondensed ? 'text-xs' : 'text-sm'} mt-0.5`}>
                             {retentionInfo ? (
                                <span className="text-red-400 italic">{retentionInfo}</span>
                            ) : (
                                highlightText(conversation.lastMessage, searchQuery)
                            )}
                        </p>
                        <div className="flex justify-between items-center mt-1.5">
                            <div className="flex items-center space-x-2 flex-shrink-0">
                                {conversation.cost && <span className="text-xs font-mono text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-md">{conversation.cost.total}</span>}
                                {conversation.labels?.slice(0, 3).map(label => <LabelChip key={label} label={label} allLabels={allLabels} />)}
                                {conversation.labels && conversation.labels.length > 3 && <span className="text-xs font-medium text-gray-400">+ {conversation.labels.length - 3}</span>}
                            </div>
                             <div className="flex items-center space-x-2 flex-shrink-0">
                                {conversation.starred && <Icons.StarIcon className="text-yellow-400" size={14}/>}
                                {conversation.pinned && <Icons.PinIcon className="text-gray-500" size={14}/>}
                                {typeof conversation.unread === 'number' && conversation.unread > 0 ? (
                                    <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">{conversation.unread}</div>
                                ) : conversation.unread && (
                                    <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            {!isMultiSelectMode && <button onClick={(e) => onMoreClick(e, conversation)} className="absolute right-2 top-1/2 -translate-y-1.2 opacity-25 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-700 transition-opacity hidden md:block" aria-label="More options">
                <Icons.MoreVerticalIcon size={20} className="text-gray-400" />
            </button>}
        </div>
    );
};

const SkeletonLoader: React.FC = () => (
    <div className="flex items-center px-4 py-3 animate-pulse border-b border-gray-800">
        <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 mr-4"></div>
        <div className="flex-grow">
            <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700 rounded w-1/6"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-full mt-2"></div>
        </div>
    </div>
);

// --- Label Assignment Modal ---
const LabelAssignmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    allLabels: Label[];
    initialSelectedLabels: Set<string>;
    onSave: (newLabels: string[]) => void;
}> = ({ isOpen, onClose, allLabels, initialSelectedLabels, onSave }) => {
    const [selectedLabels, setSelectedLabels] = useState(initialSelectedLabels);

    // Sync state when modal opens with new initial labels
    useEffect(() => {
        if (isOpen) {
            setSelectedLabels(initialSelectedLabels);
        }
    }, [isOpen, initialSelectedLabels]);

    const handleToggle = (labelName: string) => {
        setSelectedLabels(prev => {
            const next = new Set(prev);
            if (next.has(labelName)) {
                next.delete(labelName);
            } else {
                next.add(labelName);
            }
            return next;
        });
    };
    
    const handleSave = () => {
        onSave(Array.from(selectedLabels));
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assign Labels"
            footer={
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm font-semibold text-white bg-accent hover:opacity-80 rounded-lg transition-colors">Apply</button>
                </div>
            }
        >
            <div className="space-y-2">
                {allLabels.map(label => (
                    <label key={label.id} className="flex items-center p-2 rounded-md hover:bg-gray-700/50 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={selectedLabels.has(label.name)}
                            onChange={() => handleToggle(label.name)}
                            className="w-4 h-4 rounded text-accent bg-gray-700 border-gray-600 focus:ring-accent"
                        />
                        <span className="w-3 h-3 rounded-full mx-3" style={{ backgroundColor: label.color }}></span>
                        <span className="text-sm text-gray-200">{label.name}</span>
                    </label>
                ))}
            </div>
        </Modal>
    );
};

type ListViewProps = {
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    allLabels: Label[];
    onConversationSelect: (id: string) => void;
    onNavigateToMessage: (convId: string, msgId: string) => void;
    theme: Theme;
    density: Density;
    lineCount: LineCount;
    onOpenQuickSettings: () => void;
    addNotification: (notification: { message: string; onUndo?: () => void }) => void;
    trashRetentionDays: number;
    onStartNewChat: () => void;
    activeFilters: string[];
    setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
    onTogglePin: (id: string) => void;
    onToggleStar: (id: string) => void;
    onToggleArchive: (id: string) => void;
    onDuplicate: (id: string) => void;
    onDelete: (id: string) => void;
    onApplyLabels: (conversationIds: string[], newLabels: string[]) => void;
}

const defaultAdvancedSearchOptions: AdvancedSearchOptions = {
    searchIn: 'everywhere',
    dateFrom: '',
    dateTo: '',
    hasAttachment: false,
    attachmentTypes: new Set(),
    sortBy: 'timestamp',
    sortOrder: 'desc',
};

const ListView: React.FC<ListViewProps> = ({
    conversations, setConversations, allLabels, onConversationSelect, onNavigateToMessage, 
    theme, density, lineCount, onOpenQuickSettings, addNotification, 
    trashRetentionDays, onStartNewChat, activeFilters, setActiveFilters,
    onTogglePin, onToggleStar, onToggleArchive, onDuplicate, onDelete, onApplyLabels
}) => {
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    const [popoverState, setPopoverState] = useState<{ position: { x: number; y: number }; conversation: Conversation } | null>(null);
    const [isLabelModalOpen, setIsLabelModalOpen] = useState(false);
    const [labelTargetIds, setLabelTargetIds] = useState<string[]>([]);
    
    // State for Advanced Search
    const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
    const [tempAdvancedOptions, setTempAdvancedOptions] = useState<AdvancedSearchOptions>(defaultAdvancedSearchOptions);
    const [appliedAdvancedOptions, setAppliedAdvancedOptions] = useState<AdvancedSearchOptions>(defaultAdvancedSearchOptions);
    const [isSearchResultsView, setIsSearchResultsView] = useState(false);
    
    // State for Collapsible Header & Drag and Drop
    const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
    const [dropTargetLabel, setDropTargetLabel] = useState<string | null>(null);
    const listRef = useRef<HTMLElement>(null);
    const lastScrollY = useRef(0);
    
    const areAdvancedFiltersActive = JSON.stringify(appliedAdvancedOptions) !== JSON.stringify(defaultAdvancedSearchOptions);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500); // Simulate loading
        return () => clearTimeout(timer);
    }, []);
    
    // Collapsible header logic
    useEffect(() => {
        const handleScroll = () => {
            const container = listRef.current;
            if (!container) return;
            const currentScrollY = container.scrollTop;

            if (currentScrollY > lastScrollY.current && currentScrollY > 50) { // Scrolling down
                setIsHeaderCollapsed(true);
            } else if (currentScrollY < lastScrollY.current) { // Scrolling up
                setIsHeaderCollapsed(false);
            }
            lastScrollY.current = currentScrollY;
        };
        const container = listRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);
    
    const handleExport = (conversation: Conversation) => {
        const content = `Title: ${conversation.title}\nLast Message: ${conversation.lastMessage}\nTimestamp: ${conversation.timestamp}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${conversation.title.replace(/ /g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        addNotification({ message: `Exported "${conversation.title}"` });
    };

    // --- Search Handlers ---
    const handleSearchSubmit = () => {
        if (searchQuery.trim()) {
            setIsSearchResultsView(true);
        }
    };
    
    const handleExitSearch = () => {
        setSearchQuery('');
        setIsSearchResultsView(false);
    };

    // --- Advanced Search Handlers ---
    const handleAdvancedSearchApply = () => {
        setAppliedAdvancedOptions(tempAdvancedOptions);
        setIsAdvancedSearchOpen(false);
    };
    
    const handleAdvancedSearchClear = () => {
        const clearedOptions = defaultAdvancedSearchOptions;
        setTempAdvancedOptions(clearedOptions);
        setAppliedAdvancedOptions(clearedOptions);
    };

    const handleAdvancedSearchToggle = () => {
        if (!isAdvancedSearchOpen) {
            setTempAdvancedOptions(appliedAdvancedOptions);
        }
        setIsAdvancedSearchOpen(prev => !prev);
    };

    const labelFilters = allLabels.map(l => l.name);
    const presetFilters = ['Unread', 'Pinned', 'Starred'];
    const allFilterPills = [...presetFilters, ...labelFilters];

    const handleFilterClick = (clickedFilter: string) => {
        if (clickedFilter === 'All') {
            setActiveFilters(['All']);
            return;
        }
        setActiveFilters(prev => {
            const newFilters = new Set(prev.filter(f => f !== 'All'));
            if (newFilters.has(clickedFilter)) {
                newFilters.delete(clickedFilter);
            } else {
                newFilters.add(clickedFilter);
            }
            return newFilters.size === 0 ? ['All'] : Array.from(newFilters);
        });
    };

    const handleSelect = (id: string) => setSelectedIds(prev => new Set(prev.add(id)));
    const handleDeselect = (id: string) => setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    
    const handleClearSelection = () => {
        setSelectedIds(new Set());
        setIsMultiSelectMode(false);
    }
    
    const filteredConversations = conversations
        .filter(c => {
            // Hide trashed items from all views
            if (c.deletedTimestamp) {
                return false;
            }

            // Standard filters
            if (!showArchived && c.archived) return false;
            if (activeFilters.includes('All')) return true;

            const activePresets = activeFilters.filter(f => presetFilters.includes(f));
            const activeLabels = activeFilters.filter(f => labelFilters.includes(f));

            const presetMatch = activePresets.every(p => {
                switch (p) {
                    case 'Unread': return c.unread;
                    case 'Pinned': return c.pinned;
                    case 'Starred': return c.starred;
                    default: return true;
                }
            });
            const labelMatch = activeLabels.length === 0 || activeLabels.some(l => c.labels?.includes(l));
            return presetMatch && labelMatch;
        })
        .filter(c => {
             // Search query filter
            if (!searchQuery) return true;
            const lowerQuery = searchQuery.toLowerCase();
            const inTitle = c.title.toLowerCase().includes(lowerQuery);
            const inMessage = c.lastMessage.toLowerCase().includes(lowerQuery);

            switch (appliedAdvancedOptions.searchIn) {
                case 'title': return inTitle;
                case 'messages': return inMessage;
                case 'everywhere':
                default: return inTitle || inMessage;
            }
        })
        .filter(c => {
            // Advanced attachment filter (mock logic)
            if (!appliedAdvancedOptions.hasAttachment) return true;
            return parseInt(c.id) % 2 === 0; // Mock: has attachment if ID is even
        })
        .sort((a, b) => {
            // Advanced sorting
            if (appliedAdvancedOptions.sortBy === 'title') {
                const compare = a.title.localeCompare(b.title);
                return appliedAdvancedOptions.sortOrder === 'asc' ? compare : -compare;
            }
            // Default sort by timestamp is implicit (original order)
            return 0;
        });
    
    const handleSelectAll = () => setSelectedIds(new Set(filteredConversations.map(c => c.id)));

    const handleBulkDelete = () => {
        Array.from(selectedIds).forEach(id => onDelete(id));
        handleClearSelection();
    };

    const handleBulkArchive = () => {
        const idsToArchive = Array.from(selectedIds);
        idsToArchive.forEach(id => onToggleArchive(id));
        addNotification({ message: `${idsToArchive.length} conversation(s) archived.` });
        handleClearSelection();
    };
    
    const handleOpenLabelModal = (ids: string[]) => {
        setLabelTargetIds(ids);
        setIsLabelModalOpen(true);
        closePopover();
    }

    const pinnedConversations = filteredConversations.filter(c => c.pinned && !c.deletedTimestamp);
    const otherConversations = filteredConversations.filter(c => !c.pinned || !!c.deletedTimestamp);
    
    const handleMoreClick = (event: React.MouseEvent, conversation: Conversation) => {
        event.stopPropagation();
        const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        setPopoverState({
            position: { x: rect.right - 200, y: rect.bottom + 4 }, // 200 is popover width
            conversation,
        });
    };

    const handleContextMenu = (event: React.MouseEvent, conversation: Conversation) => {
        event.preventDefault();
        event.stopPropagation();
        setPopoverState({
            position: { x: event.clientX, y: event.clientY },
            conversation,
        });
    };
    
    // --- Drag and Drop Handlers ---
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData("application/gemini-chat-id", id);
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const handleDrop = (e: React.DragEvent, label: string) => {
        e.preventDefault();
        const convId = e.dataTransfer.getData("application/gemini-chat-id");
        if (convId) {
            const conversation = conversations.find(c => c.id === convId);
            if (conversation) {
                const newLabels = Array.from(new Set([...(conversation.labels || []), label]));
                onApplyLabels([convId], newLabels);
            }
        }
        setDropTargetLabel(null);
    };

    const closePopover = () => setPopoverState(null);

    const clearFiltersAndSearch = () => {
        setActiveFilters(['All']);
        setSearchQuery('');
        setAppliedAdvancedOptions(defaultAdvancedSearchOptions);
        setTempAdvancedOptions(defaultAdvancedSearchOptions);
    };
    
    const renderEmptyState = () => {
        const hasActiveFilters = !(activeFilters.length === 1 && activeFilters[0] === 'All');
        const hasSearchQuery = searchQuery.trim() !== '';

        if (!hasActiveFilters && !hasSearchQuery && !areAdvancedFiltersActive) {
            return <p className="text-gray-400">No conversations found</p>;
        }

        let message = `No conversations match your criteria.`;
        if (hasSearchQuery) {
            message = `No results for "${searchQuery}"`;
            if (hasActiveFilters || areAdvancedFiltersActive) message += ` with the current filters.`;
        }

        return (
            <div className="flex flex-col items-center gap-4">
                <p className="text-gray-400">{message}</p>
                <button
                    onClick={clearFiltersAndSearch}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                    <Icons.FilterXIcon size={16} />
                    Clear Filters & Search
                </button>
            </div>
        );
    };

    const stickyHeaderBg = theme === 'oled' ? 'bg-black' : 'bg-gray-900';

    if (isSearchResultsView) {
        return (
            <SearchResultsView 
                searchQuery={searchQuery}
                conversations={conversations} 
                onResultClick={(convId, msgId) => {
                    handleExitSearch();
                    onNavigateToMessage(convId, msgId);
                }}
                onBack={handleExitSearch}
            />
        );
    }

    const initialLabelsForModal = () => {
        if (labelTargetIds.length === 1) {
            const convo = conversations.find(c => c.id === labelTargetIds[0]);
            return new Set(convo?.labels || []);
        }
        // For bulk edit, show common labels or start fresh
        return new Set<string>();
    }

    return (
        <div className={`flex flex-col h-full w-full overflow-hidden md:border-r border-gray-700/50 relative ${
            theme === 'oled' ? 'bg-black' : 'bg-gray-900'
        }`}>
            {/* Header */}
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 flex-shrink-0 z-20 bg-inherit">
                {isMultiSelectMode ? (
                     <div className="flex items-center space-x-2">
                        <button onClick={handleClearSelection} className="p-2 rounded-full hover:bg-gray-800"><Icons.XIcon size={20} /></button>
                        <h2 className="text-xl font-bold">{selectedIds.size} Selected</h2>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold text-white">Chats</h1>
                        {showArchived && (
                            <span className="text-xs font-semibold uppercase bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">
                                Incl. Archived
                            </span>
                        )}
                    </div>
                )}
                <div className="flex items-center space-x-1">
                    {!isMultiSelectMode && (
                        <>
                             <button onClick={() => setIsMultiSelectMode(true)} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Select Messages">
                                <Icons.CheckSquareIcon size={20} className="text-gray-300" />
                            </button>
                            <button 
                                className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${showArchived ? 'text-accent' : 'text-gray-300'}`} 
                                aria-label="Show Archived"
                                onClick={() => setShowArchived(!showArchived)}
                            >
                                <Icons.ArchiveBoxIcon size={20} />
                            </button>
                            <button onClick={onOpenQuickSettings} className="p-2 rounded-full hover:bg-gray-800 transition-colors" aria-label="Settings">
                                <Icons.SettingsIcon size={20} className="text-gray-300" />
                            </button>
                        </>
                    )}
                    {isMultiSelectMode && <button onClick={handleSelectAll} className="font-semibold text-sm px-3 py-1.5 hover:bg-gray-800 rounded-md">Select All</button>}
                    <div className="hidden md:block">
                        <button onClick={onStartNewChat} className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors" aria-label="New Chat">
                            <Icons.PlusIcon size={16} />
                            <span>Compose</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Conversation List */}
            <main ref={listRef} className="flex-grow overflow-y-auto">
                <div className={`flex-shrink-0 ${stickyHeaderBg} md:static sticky top-0 z-10 transition-transform duration-300 ${isHeaderCollapsed ? '-translate-y-full' : 'translate-y-0'} md:transform-none`}>
                    <form className="px-4 py-3 border-b border-gray-700/50" onSubmit={(e) => { e.preventDefault(); handleSearchSubmit(); }}>
                        <div className="relative flex items-center bg-gray-800 rounded-full focus-within:ring-2 focus-within:ring-accent transition-colors">
                            <Icons.SearchIcon size={20} className="absolute left-3 text-gray-400 pointer-events-none" />
                            <input 
                                type="text"
                                placeholder="Search all messages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-0 focus:ring-0 py-2 pl-10 pr-10 text-sm text-gray-100 placeholder:text-gray-400 outline-none"
                            />
                             <button
                                type="button"
                                onClick={handleAdvancedSearchToggle}
                                className={`absolute right-2 p-1.5 rounded-full transition-colors ${isAdvancedSearchOpen ? 'bg-accent/30 text-accent' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`}
                                aria-label="Advanced search options"
                            >
                                <Icons.SlidersHorizontalIcon size={16} />
                                {areAdvancedFiltersActive && <div className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full ring-2 ring-gray-800"></div>}
                            </button>
                        </div>
                    </form>
                    
                    <div className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${isAdvancedSearchOpen ? 'max-h-[22rem]' : 'max-h-0'}`}>
                        <AdvancedSearchPanel
                            options={tempAdvancedOptions}
                            onOptionChange={setTempAdvancedOptions}
                            onApply={handleAdvancedSearchApply}
                            onClear={handleAdvancedSearchClear}
                        />
                    </div>

                    {/* Filter Pills */}
                    <div className="px-4 py-2 border-b border-gray-700/50">
                        <div className="flex items-center space-x-2 pb-2">
                            <FilterPill
                                label="All"
                                active={activeFilters.includes('All')}
                                onClick={() => handleFilterClick('All')}
                                onDragOver={handleDragOver} onDrop={(e)=>e.preventDefault()} onDragLeave={()=>{}} onDragEnter={(e)=>e.preventDefault()}
                            />
                            <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                                {allFilterPills.map(filter => (
                                    <FilterPill
                                        key={filter}
                                        label={filter}
                                        active={activeFilters.includes(filter)}
                                        isDropTarget={dropTargetLabel === filter}
                                        onClick={() => handleFilterClick(filter)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, filter)}
                                        onDragEnter={() => labelFilters.includes(filter) && setDropTargetLabel(filter)}
                                        onDragLeave={() => setDropTargetLabel(null)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                <div>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => <SkeletonLoader key={i} />)
                    ) : filteredConversations.length === 0 ? (
                         <div className="text-center py-16 px-4">
                            {renderEmptyState()}
                         </div>
                    ) : (
                        <>
                            {pinnedConversations.length > 0 && (
                                <div>
                                    <h2 className="px-4 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Pinned</h2>
                                    {pinnedConversations.map(c => <ConversationRow key={c.id} conversation={c} isSelected={selectedIds.has(c.id)} onSelect={handleSelect} onDeselect={handleDeselect} isMultiSelectMode={isMultiSelectMode} onConversationSelect={onConversationSelect} onMoreClick={handleMoreClick} onContextMenu={handleContextMenu} onDragStart={handleDragStart} density={density} lineCount={lineCount} searchQuery={searchQuery} trashRetentionDays={trashRetentionDays} allLabels={allLabels} />)}
                                </div>
                            )}
                            
                            {pinnedConversations.length > 0 && otherConversations.length > 0 && (
                                <div className="px-4 pt-4 pb-2">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                            <div className="w-full border-t border-gray-700/50"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className={`px-3 text-xs font-medium text-gray-400 uppercase tracking-wider ${
                                                theme === 'oled' ? 'bg-black' : 'bg-gray-900'
                                            }`}>
                                                Recent
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {otherConversations.length > 0 && (
                                <div>
                                     {pinnedConversations.length === 0 && <h2 className="px-4 pt-4 pb-2 text-xs font-bold text-gray-500 uppercase tracking-wider">Recent</h2>}
                                    {otherConversations.map(c => <ConversationRow key={c.id} conversation={c} isSelected={selectedIds.has(c.id)} onSelect={handleSelect} onDeselect={handleDeselect} isMultiSelectMode={isMultiSelectMode} onConversationSelect={onConversationSelect} onMoreClick={handleMoreClick} onContextMenu={handleContextMenu} onDragStart={handleDragStart} density={density} lineCount={lineCount} searchQuery={searchQuery} trashRetentionDays={trashRetentionDays} allLabels={allLabels} />)}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
            
            {/* FAB for Mobile */}
            <div className="md:hidden absolute bottom-6 right-6 z-20">
                <button 
                    onClick={onStartNewChat}
                    className="p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all duration-200 active:scale-95"
                    aria-label="Compose new chat"
                >
                    <Icons.PlusIcon size={24} strokeWidth={2.5} />
                </button>
            </div>
            
            {popoverState && (
                 <PopoverMenu 
                    isOpen={!!popoverState} 
                    onClose={closePopover}
                    position={popoverState.position}
                >
                    <PopoverMenuItem icon={<Icons.PinIcon />} label={popoverState.conversation.pinned ? "Unpin" : "Pin"} onClick={() => { onTogglePin(popoverState.conversation.id); closePopover(); }} />
                    <PopoverMenuItem icon={<Icons.StarIcon />} label={popoverState.conversation.starred ? "Unstar" : "Star"} onClick={() => { onToggleStar(popoverState.conversation.id); closePopover(); }} />
                    <PopoverMenuItem icon={<Icons.ArchiveIcon />} label={popoverState.conversation.archived ? "Unarchive" : "Archive"} onClick={() => { onToggleArchive(popoverState.conversation.id); closePopover(); }} />
                    <PopoverMenuItem icon={<Icons.LabelIcon />} label="Labels" onClick={() => handleOpenLabelModal([popoverState.conversation.id])} />
                    <PopoverMenuItem icon={<Icons.DuplicateIcon />} label="Duplicate" onClick={() => { onDuplicate(popoverState.conversation.id); closePopover(); }} />
                    <PopoverMenuItem icon={<Icons.ShareIcon />} label="Export" onClick={() => { handleExport(popoverState.conversation); closePopover(); }} />
                    <div className="my-1 border-t border-gray-700"></div>
                    <PopoverMenuItem icon={<Icons.TrashIcon />} label="Delete" onClick={() => { onDelete(popoverState.conversation.id); closePopover(); }} className="text-red-500" />
                </PopoverMenu>
            )}

            {isLabelModalOpen && (
                <LabelAssignmentModal
                    isOpen={isLabelModalOpen}
                    onClose={() => setIsLabelModalOpen(false)}
                    allLabels={allLabels}
                    initialSelectedLabels={initialLabelsForModal()}
                    onSave={(newLabels) => onApplyLabels(labelTargetIds, newLabels)}
                />
            )}

             {isMultiSelectMode && (
                <footer className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 flex justify-around items-center z-10 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
                    <button onClick={handleBulkArchive} className="flex flex-col items-center text-xs p-2 rounded-md hover:bg-gray-700 w-20 text-gray-200">
                        <Icons.ArchiveIcon size={20} />
                        <span className="mt-1">Archive</span>
                    </button>
                    <button onClick={() => handleOpenLabelModal(Array.from(selectedIds))} className="flex flex-col items-center text-xs p-2 rounded-md hover:bg-gray-700 w-20 text-gray-200">
                        <Icons.LabelIcon size={20} />
                        <span className="mt-1">Label</span>
                    </button>
                    <button onClick={handleBulkDelete} className="flex flex-col items-center text-xs p-2 rounded-md hover:bg-gray-700 w-20 text-red-500">
                        <Icons.TrashIcon size={20} />
                        <span className="mt-1">Delete</span>
                    </button>
                </footer>
            )}
        </div>
    );
};

export default ListView;