import React, { useState } from 'react';
import { 
    ArrowLeftIcon, 
    KeyRoundIcon, 
    BrainCircuitIcon, 
    AudioWaveformIcon,
    DatabaseIcon,
    LabelIcon,
    SlidersHorizontalIcon,
    ChevronRightIcon,
    SparklesIcon,
    TrashIcon,
    UsersIcon,
    MessageSquareIcon,
    SunIcon,
    MoonIcon,
    MonitorIcon,
    ThermometerIcon,
    ChevronDownIcon,
} from '../common/Icons';
import { ThemeSettings, Label } from '../../types';
import { Theme, DarkMode } from '../../App';
import ColorPicker from '../common/ColorPicker';

interface SettingsViewProps {
    onBack: () => void;
    onNavigateToLabels: () => void;
    onNavigateToAdvanced: () => void;
    onNavigateToTrash: () => void;
    onNavigateToPersonas: () => void;
    themeSettings: ThemeSettings;
    setThemeSettings: (settings: ThemeSettings) => void;
    darkMode: DarkMode;
    setDarkMode: (mode: DarkMode) => void;
    theme: Theme;
    setTheme: (theme: Theme) => void;
    autoPlayTTS: boolean;
    setAutoPlayTTS: (enabled: boolean) => void;
    temperature: number;
    setTemperature: (temp: number) => void;
}

// --- Reusable Settings Components ---

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">{title}</h2>
        <div className="bg-gray-800/50 rounded-lg divide-y divide-gray-700/50">{children}</div>
    </div>
);

const SettingsItem: React.FC<{ icon: React.ReactNode; title: string; subtitle?: string; children: React.ReactNode }> = ({ icon, title, subtitle, children }) => (
    <div className="flex items-center justify-between p-4">
        <div className="flex items-start">
            <div className="w-8 text-gray-400 pt-0.5">{icon}</div>
            <div className="ml-2 flex-grow">
                <h3 className="font-medium text-gray-200">{title}</h3>
                {subtitle && <p className="text-xs text-gray-400 mt-0.5 max-w-xs">{subtitle}</p>}
            </div>
        </div>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

const NavigationalItem: React.FC<{ icon: React.ReactNode; title: string; subtitle: string; onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-4 text-left hover:bg-gray-800/80 transition-colors first:rounded-t-lg last:rounded-b-lg">
        <div className="w-8 text-gray-400">{icon}</div>
        <div className="flex-grow ml-2">
            <h3 className="font-medium text-gray-200">{title}</h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <ChevronRightIcon size={20} className="text-gray-500" />
    </button>
);

const SegmentedControl: React.FC<{
    options: { label: string | React.ReactNode; value: any }[];
    value: any;
    onChange: (value: any) => void;
    disabled?: boolean;
}> = ({ options, value, onChange, disabled }) => (
    <div className={`flex items-center rounded-lg bg-gray-700/50 p-1 space-x-1 ${disabled ? 'opacity-50' : ''}`}>
        {options.map(option => (
            <button
                key={option.value}
                type="button"
                onClick={() => !disabled && onChange(option.value)}
                disabled={disabled}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-1.5 ${value === option.value ? 'bg-accent text-white' : 'text-gray-200 hover:bg-gray-600'}`}
            >
                {option.label}
            </button>
        ))}
    </div>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; }> = ({ checked, onChange }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent ${checked ? 'bg-accent' : 'bg-gray-600'}`}
    >
        <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
);

const Select: React.FC<{ options: string[], value: string, onChange: (value: string) => void }> = ({ options, value, onChange }) => (
    <div className="relative">
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="bg-gray-700 border-gray-600 text-white text-sm rounded-md focus:ring-accent focus:border-accent block w-full pl-3 pr-8 py-1.5 appearance-none"
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
        </div>
    </div>
);

// --- Main Settings View ---

const SettingsView: React.FC<SettingsViewProps> = (props) => {
    const { onBack, onNavigateToLabels, onNavigateToAdvanced, onNavigateToTrash, onNavigateToPersonas,
            themeSettings, setThemeSettings, darkMode, setDarkMode, theme, setTheme,
            autoPlayTTS, setAutoPlayTTS, temperature, setTemperature } = props;

    // Dummy state for TTS voices
    const [ttsProvider, setTtsProvider] = useState('Browser');
    const [openaiVoice, setOpenaiVoice] = useState('Alloy');
    const [isColorSettingsExpanded, setIsColorSettingsExpanded] = useState(false);


    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900 z-10">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-white">Settings</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    
                    <SettingsSection title="Appearance">
                        <SettingsItem icon={<MonitorIcon />} title="Mode">
                            <SegmentedControl
                                options={[
                                    { label: <><SunIcon size={14} /> Light</>, value: 'light' },
                                    { label: <><MoonIcon size={14} /> Dark</>, value: 'dark' },
                                    { label: <><MonitorIcon size={14} /> System</>, value: 'system' }
                                ]}
                                value={darkMode}
                                onChange={setDarkMode}
                            />
                        </SettingsItem>
                        <SettingsItem icon={<SparklesIcon />} title="Theme">
                            <SegmentedControl
                                options={[{ label: 'Dark', value: 'dark' }, { label: 'OLED', value: 'oled' }]}
                                value={theme}
                                onChange={(v: Theme) => setTheme(v)}
                                disabled={darkMode === 'light'}
                            />
                        </SettingsItem>
                        <div>
                             <SettingsItem icon={<SparklesIcon />} title="Custom Colors" subtitle="Customize accent and message bubble colors.">
                                <button onClick={() => setIsColorSettingsExpanded(!isColorSettingsExpanded)} className="p-2 -mr-2 rounded-full hover:bg-gray-700">
                                     <ChevronDownIcon size={20} className={`text-gray-500 transition-transform duration-200 ${isColorSettingsExpanded ? 'rotate-180' : ''}`} />
                                </button>
                            </SettingsItem>
                            {isColorSettingsExpanded && (
                                <div className="p-4 border-t border-gray-700/50 space-y-6">
                                     <ColorPicker
                                         label="Accent Color"
                                         color={themeSettings.accentColor}
                                         onChange={color => setThemeSettings({ ...themeSettings, accentColor: color })}
                                     />
                                      <ColorPicker
                                         label="User Bubble Color"
                                         color={themeSettings.userBubbleColor}
                                         onChange={color => setThemeSettings({ ...themeSettings, userBubbleColor: color })}
                                     />
                                      <ColorPicker
                                         label="Model Bubble Color"
                                         color={themeSettings.modelBubbleColor}
                                         onChange={color => setThemeSettings({ ...themeSettings, modelBubbleColor: color })}
                                     />
                                 </div>
                            )}
                        </div>
                    </SettingsSection>

                    <SettingsSection title="Chat Behavior">
                        <SettingsItem icon={<AudioWaveformIcon />} title="Auto-play Text-to-Speech">
                            <ToggleSwitch checked={autoPlayTTS} onChange={setAutoPlayTTS} />
                        </SettingsItem>
                        <SettingsItem icon={<span className="text-base">🔊</span>} title="TTS Provider">
                            <div className="w-32">
                                <Select options={['Browser', 'OpenAI', 'Google']} value={ttsProvider} onChange={setTtsProvider} />
                            </div>
                        </SettingsItem>
                         <SettingsItem icon={<span className="text-base">🗣️</span>} title="OpenAI Voice">
                            <div className="w-32">
                                <Select options={['Alloy', 'Echo', 'Fable', 'Onyx', 'Nova', 'Shimmer']} value={openaiVoice} onChange={setOpenaiVoice} />
                            </div>
                        </SettingsItem>
                        <SettingsItem icon={<ThermometerIcon />} title="Default Temperature">
                            <div className="flex items-center">
                                <input
                                    type="range"
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    value={temperature}
                                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                    className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="ml-3 text-sm font-mono w-8 text-right text-gray-300">{temperature.toFixed(1)}</span>
                            </div>
                        </SettingsItem>
                    </SettingsSection>
                    
                    <SettingsSection title="Organization">
                        <NavigationalItem
                            icon={<UsersIcon size={20} />}
                            title="Manage Personas"
                            subtitle="Chat with AI experts and create group conversations"
                            onClick={onNavigateToPersonas}
                        />
                         <NavigationalItem
                            icon={<LabelIcon size={20} />}
                            title="Manage Labels"
                            subtitle="Create, edit, and assign custom API keys to labels"
                            onClick={onNavigateToLabels}
                        />
                    </SettingsSection>

                    <SettingsSection title="Data & Privacy">
                         <NavigationalItem
                            icon={<TrashIcon size={20} />}
                            title="Manage Trash"
                            subtitle="Set retention policies and empty the trash"
                            onClick={onNavigateToTrash}
                        />
                         <SettingsItem
                            icon={<DatabaseIcon />}
                            title="Import & Export"
                            subtitle="Import from JSON or export threads to PDF/JSON."
                        >
                            <div className="flex gap-2">
                                <button onClick={() => alert('Import not implemented.')} className="px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600/80 text-gray-200 rounded-md">Import</button>
                                <button onClick={() => alert('Export not implemented.')} className="px-3 py-1.5 text-xs font-semibold bg-gray-700 hover:bg-gray-600/80 text-gray-200 rounded-md">Export</button>
                            </div>
                        </SettingsItem>
                        <SettingsItem
                            icon={<KeyRoundIcon />}
                            title="Default API Key"
                            subtitle="Set your API Key via environment variables."
                        >
                             <p className="text-sm text-green-400">Saved</p>
                        </SettingsItem>
                    </SettingsSection>

                     <SettingsSection title="Advanced">
                         <NavigationalItem
                            icon={<SlidersHorizontalIcon />}
                            title="Advanced Settings"
                            subtitle="Manage caching, tokenizers, and other features"
                            onClick={onNavigateToAdvanced}
                        />
                    </SettingsSection>
                </div>
            </main>
        </div>
    );
};

export default SettingsView;