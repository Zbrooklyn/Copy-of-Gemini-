import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';

interface PopoverMenuProps {
    isOpen: boolean;
    onClose: () => void;
    position: { x: number; y: number };
    children: React.ReactNode;
}

const PopoverMenu: React.FC<PopoverMenuProps> = ({ isOpen, onClose, position, children }) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [adjustedPosition, setAdjustedPosition] = useState(position);

    useLayoutEffect(() => {
        if (isOpen && popoverRef.current) {
            const menu = popoverRef.current;
            const { innerWidth, innerHeight } = window;
            const { width: menuWidth, height: menuHeight } = menu.getBoundingClientRect();
            
            const buffer = 8; // 8px buffer from the edge

            let newX = position.x;
            let newY = position.y;

            // Adjust horizontal position if it overflows the right edge
            if (position.x + menuWidth > innerWidth - buffer) {
                newX = innerWidth - menuWidth - buffer;
            }
            // Adjust vertical position if it overflows the bottom edge
            if (position.y + menuHeight > innerHeight - buffer) {
                newY = innerHeight - menuHeight - buffer;
            }
            
            // Ensure it doesn't go off the top or left edges either
            if (newX < buffer) newX = buffer;
            if (newY < buffer) newY = buffer;
            
            setAdjustedPosition({ x: newX, y: newY });
        }
    }, [isOpen, position]);

    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (event: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const style = {
        top: `${adjustedPosition.y}px`,
        left: `${adjustedPosition.x}px`,
    };

    return (
        <div
            ref={popoverRef}
            style={style}
            className="fixed z-50 w-48 bg-gray-800 rounded-md shadow-lg border border-gray-700 py-1"
        >
            {children}
        </div>
    );
};

export const PopoverMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; className?: string }> = ({ icon, label, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center px-4 py-2 text-sm text-left text-gray-200 hover:bg-gray-700 ${className}`}
    >
        <span className="mr-3">{icon}</span>
        {label}
    </button>
);

export default PopoverMenu;