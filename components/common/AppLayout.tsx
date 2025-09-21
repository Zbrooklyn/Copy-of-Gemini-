import React from 'react';
import { MessageSquareIcon, UsersIcon } from './Icons'; // Assuming UsersIcon is for Personas

interface AppLayoutProps {
    activeView: 'chats' | 'personas';
    setActiveView: (view: 'chats' | 'personas') => void;
    children: React.ReactNode;
}

const NavItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col md:flex-row items-center justify-center md:justify-start w-full md:w-auto px-2 md:px-4 py-2 rounded-lg transition-colors duration-200
                   ${isActive ? 'text-white bg-accent' : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
    >
        {icon}
        <span className="mt-1 md:mt-0 md:ml-3 text-xs md:text-sm font-semibold">{label}</span>
    </button>
);

const AppLayout: React.FC<AppLayoutProps> = ({ activeView, setActiveView, children }) => {
    return (
        <div className="w-full h-full flex flex-col md:flex-row">
            {/* Sidebar for Desktop */}
            <nav className="hidden md:flex flex-col w-20 p-3 bg-gray-900/80 border-r border-gray-800/50">
                <div className="space-y-3">
                    <NavItem
                        icon={<MessageSquareIcon size={24} />}
                        label="Chats"
                        isActive={activeView === 'chats'}
                        onClick={() => setActiveView('chats')}
                    />
                    <NavItem
                        icon={<UsersIcon size={24} />}
                        label="Personas"
                        isActive={activeView === 'personas'}
                        onClick={() => setActiveView('personas')}
                    />
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-grow h-full w-full overflow-hidden">
                {children}
            </div>

            {/* Bottom Nav for Mobile */}
            <nav className="md:hidden flex justify-around items-center p-1 bg-gray-900/80 border-t border-gray-800/50 backdrop-blur-sm">
                 <NavItem
                    icon={<MessageSquareIcon size={24} />}
                    label="Chats"
                    isActive={activeView === 'chats'}
                    onClick={() => setActiveView('chats')}
                />
                <NavItem
                    icon={<UsersIcon size={24} />}
                    label="Personas"
                    isActive={activeView === 'personas'}
                    onClick={() => setActiveView('personas')}
                />
            </nav>
        </div>
    );
};

export default AppLayout;
