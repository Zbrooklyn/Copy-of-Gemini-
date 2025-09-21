import React from 'react';
import {
    Search,
    Plus,
    Settings,
    MoreVertical,
    Pin,
    Star,
    Archive,
    Trash2,
    Tag,
    Copy,
    Upload,
    CheckSquare,
    X,
    Sun,
    Moon,
    Sparkles,
    Rows3,
    Columns2,
    ChevronRight,
    Paperclip,
    Mic,
    Send,
    Download,
    ChevronDown,
    ChevronUp,
    Check,
    ArrowLeft,
    Play,
    FileCode2,
    FileJson,
    Terminal,
    RefreshCw,
    Pencil,
    File,
    Info,
    ChevronLeft,
    ChevronsDown,
    Camera,
    ImageIcon as ImageIconLucide,
    Bot,
    Library,
    Plug,
    GraduationCap,
    Globe,
    Bell,
    BellOff,
    Thermometer,
    Volume2,
    KeyRound,
    BrainCircuit,
    Languages,
    AudioWaveform,
    Database,
    SlidersHorizontal,
    CalendarDays,
    Clock,
    MessageSquare as MessageSquareLucide,
    DollarSign,
    FileText,
    Link,
    Share2,
    CopyPlus,
    FilePenLine,
    Clipboard,
    Undo2,
    FilterX,
    UploadCloud,
    Command,
    CornerUpLeft,
    Hash,
    Users,
    Monitor,
} from 'lucide-react';

// Fix: Re-defining IconProps to explicitly include size and other SVG attributes.
// This is necessary because the imported LucideProps seems to be failing to resolve correctly,
// leading to type errors about missing 'size' and 'className' properties across the app.
interface IconProps extends React.SVGAttributes<SVGSVGElement> {
    size?: string | number;
    absoluteStrokeWidth?: boolean;
    // FIX: Add title prop to allow tooltips on icons. This was causing a type error where used.
    title?: string;
}

export const SearchIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Search size={size} {...props} />
);

export const PlusIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Plus size={size} {...props} />
);

export const SettingsIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Settings size={size} {...props} />
);

export const MoreVerticalIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <MoreVertical size={size} {...props} />
);

export const PinIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Pin size={size} fill="currentColor" strokeWidth={1} {...props} />
);

export const StarIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Star size={size} fill="currentColor" strokeWidth={1} {...props} />
);

export const ArchiveBoxIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Archive size={size} {...props} />
);

export const TrashIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Trash2 size={size} {...props} />
);

export const ArchiveIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Archive size={size} {...props} />
);

export const LabelIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Tag size={size} {...props} />
);

export const CopyIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Copy size={size} {...props} />
);

export const ShareIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Upload size={size} {...props} />
);

export const CheckSquareIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <CheckSquare size={size} {...props} />
);

export const XIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <X size={size} {...props} />
);

export const SunIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Sun size={size} {...props} />
);

export const MoonIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Moon size={size} {...props} />
);

export const SparklesIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Sparkles size={size} {...props} />
);

export const RowsIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Rows3 size={size} {...props} />
);

export const ColumnsIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Columns2 size={size} {...props} />
);

export const ChevronLeftIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <ChevronLeft size={size} {...props} />
);

export const ChevronRightIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <ChevronRight size={size} {...props} />
);

export const PaperClipIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Paperclip size={size} {...props} />
);

export const MicrophoneIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Mic size={size} {...props} />
);

export const PaperAirplaneIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Send size={size} fill="currentColor" {...props} />
);

export const DownloadIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Download size={size} {...props} />
);

export const ChevronDownIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <ChevronDown size={size} {...props} />
);

export const ChevronUpIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <ChevronUp size={size} {...props} />
);

export const CheckIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Check size={size} strokeWidth={3} {...props} />
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <ArrowLeft size={size} {...props} />
);

export const PlayIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Play size={size} fill="currentColor" {...props} />
);

export const InfoIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Info size={size} {...props} />
);

export const ChevronsDownIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <ChevronsDown size={size} {...props} />
);

export const CameraIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Camera size={size} {...props} />
);

export const ImageIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <ImageIconLucide size={size} {...props} />
);

export const BotIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Bot size={size} {...props} />
);

export const LibraryIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Library size={size} {...props} />
);

export const PlugIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Plug size={size} {...props} />
);

export const GraduationCapIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <GraduationCap size={size} {...props} />
);

export const GlobeIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Globe size={size} {...props} />
);


// Message Action Icons
export const RefreshCwIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <RefreshCw size={size} {...props} />
);
export const PencilIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Pencil size={size} {...props} />
);
export const FilePenLineIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <FilePenLine size={size} {...props} />
);
export const ReplyIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <CornerUpLeft size={size} {...props} />
);


// Language & File Icons
export const FileIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <File size={size} {...props} />
);
export const PythonIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <FileCode2 size={size} {...props} />
);
export const JavaScriptIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <FileCode2 size={size} {...props} />
);
export const JsonIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <FileJson size={size} {...props} />
);
export const HtmlIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <FileCode2 size={size} {...props} />
);
export const TerminalIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Terminal size={size} {...props} />
);

// Chat Settings Menu Icons
export const BellIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Bell size={size} {...props} />
);
export const BellOffIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <BellOff size={size} {...props} />
);
export const LinkIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Link size={size} {...props} />
);
export const ShareLinkIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Share2 size={size} {...props} />
);
export const DuplicateIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <CopyPlus size={size} {...props} />
);

// Quick Settings Icons
export const ThermometerIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Thermometer size={size} {...props} />
);
export const Volume2Icon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Volume2 size={size} {...props} />
);
export const MonitorIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Monitor size={size} {...props} />
);

// Full Settings Icons
export const KeyRoundIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <KeyRound size={size} {...props} />
);
export const BrainCircuitIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <BrainCircuit size={size} {...props} />
);
export const LanguagesIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Languages size={size} {...props} />
);
export const AudioWaveformIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <AudioWaveform size={size} {...props} />
);
export const DatabaseIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <Database size={size} {...props} />
);
export const SlidersHorizontalIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <SlidersHorizontal size={size} {...props} />
);

// Conversation Details Icons
export const CalendarDaysIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <CalendarDays size={size} {...props} />
);
export const ClockIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Clock size={size} {...props} />
);
export const MessageSquareIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <MessageSquareLucide size={size} {...props} />
);
export const DollarSignIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <DollarSign size={size} {...props} />
);
export const FileTextIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <FileText size={size} {...props} />
);
export const ClipboardIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Clipboard size={size} {...props} />
);

// New QoL Icons
export const Undo2Icon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Undo2 size={size} {...props} />
);
export const FilterXIcon: React.FC<IconProps> = ({ size = 20, ...props }) => (
    <FilterX size={size} {...props} />
);
export const UploadCloudIcon: React.FC<IconProps> = ({ size = 48, ...props }) => (
    <UploadCloud size={size} {...props} />
);
export const CommandIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Command size={size} {...props} />
);
export const HashIcon: React.FC<IconProps> = ({ size = 16, ...props }) => (
    <Hash size={size} {...props} />
);
export const UsersIcon: React.FC<IconProps> = ({ size = 24, ...props }) => (
    <Users size={size} {...props} />
);