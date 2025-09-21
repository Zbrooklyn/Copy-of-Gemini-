import React, { useState } from 'react';
import { ArrowLeftIcon } from '../common/Icons';

interface AdvancedSettingsViewProps {
    onBack: () => void;
}

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; }> = ({ checked, onChange, disabled }) => (
    <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${checked ? 'bg-blue-600' : 'bg-gray-600'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
        <span
            aria-hidden="true"
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
    </button>
);

const ToggleSettingItem: React.FC<{ title: string; subtitle: string; isEnabled: boolean; onToggle: (enabled: boolean) => void; }> = ({ title, subtitle, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between p-4 bg-gray-800/50 hover:bg-gray-800/80 transition-colors rounded-lg">
        <div className="flex-grow pr-4">
            <h3 className="font-semibold text-gray-100">{title}</h3>
            <p className="text-sm text-gray-400">{subtitle}</p>
        </div>
        <div className="flex-shrink-0">
            <ToggleSwitch checked={isEnabled} onChange={onToggle} />
        </div>
    </div>
);


const AdvancedSettingsView: React.FC<AdvancedSettingsViewProps> = ({ onBack }) => {
    // In a real app, this state would be managed globally (e.g., via Context or Zustand)
    const [serviceWorkerEnabled, setServiceWorkerEnabled] = useState(true);
    const [tokenizerEnabled, setTokenizerEnabled] = useState(true);
    const [pdfImagesEnabled, setPdfImagesEnabled] = useState(true);
    const [sttEnabled, setSttEnabled] = useState(true);

    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900 z-10">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-white">Advanced Settings</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                 <div className="max-w-3xl mx-auto">
                    <div className="space-y-3">
                        <ToggleSettingItem
                            title="Service Worker & Caching"
                            subtitle="Allows the app to be cached for faster loads and potential offline use."
                            isEnabled={serviceWorkerEnabled}
                            onToggle={setServiceWorkerEnabled}
                        />
                         <ToggleSettingItem
                            title="Accurate Tokenizer & Costing"
                            subtitle="Downloads necessary files for precise token counting and cost estimation."
                            isEnabled={tokenizerEnabled}
                            onToggle={setTokenizerEnabled}
                        />
                         <ToggleSettingItem
                            title="PDF Export with Images"
                            subtitle="Allows exporting chats to PDF, including web images."
                            isEnabled={pdfImagesEnabled}
                            onToggle={setPdfImagesEnabled}
                        />
                         <ToggleSettingItem
                            title="Speech-to-Text (Microphone)"
                            subtitle="Allows transcribing your voice into the text input using the browser's built-in speech recognition."
                            isEnabled={sttEnabled}
                            onToggle={setSttEnabled}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdvancedSettingsView;
