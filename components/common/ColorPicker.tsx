import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ClipboardIcon, CheckIcon, ChevronDownIcon } from './Icons';

// --- Color Conversion Utilities ---

const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    hex = hex.replace('#', '');
    if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
    } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16);
        g = parseInt(hex.substring(2, 4), 16);
        b = parseInt(hex.substring(4, 6), 16);
    }
    return { r, g, b };
};

const rgbToHsv = ({ r, g, b }: { r: number, g: number, b: number }) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, v = max;
    const d = max - min;
    s = max === 0 ? 0 : d / max;
    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h * 360, s: s * 100, v: v * 100 };
};

const hsvToRgb = ({ h, s, v }: { h: number, s: number, v: number }) => {
    s /= 100; v /= 100;
    const i = Math.floor(h / 60);
    const f = h / 60 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    let r = 0, g = 0, b = 0;
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const rgbToHex = ({ r, g, b }: { r: number, g: number, b: number }) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

// --- Draggable Hook ---
const useDraggable = (
    onDrag: (pos: { x: number; y: number }) => void,
    containerRef: React.RefObject<HTMLElement>
) => {
    const isDraggingRef = useRef(false);

    const updatePosition = useCallback((e: MouseEvent | TouchEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        
        const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const y = Math.max(0, Math.min(clientY - rect.top, rect.height));

        onDrag({ x, y });
    }, [containerRef, onDrag]);

    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingRef.current) return;
        if (e.cancelable) e.preventDefault();
        updatePosition(e);
    }, [updatePosition]);

    const handleDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('touchend', handleDragEnd);
    }, [handleDragMove]);

    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        isDraggingRef.current = true;
        updatePosition(e.nativeEvent);
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchmove', handleDragMove, { passive: false });
        window.addEventListener('touchend', handleDragEnd);
    }, [updatePosition, handleDragMove, handleDragEnd]);
    
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [handleDragMove, handleDragEnd]);


    return { onMouseDown: handleDragStart, onTouchStart: handleDragStart };
};


// --- ColorPicker Component ---

const PRESET_COLORS = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E',
    '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1',
    '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#9CA3AF'
];

interface ColorPickerProps {
    label: string;
    color: string;
    onChange: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, color, onChange }) => {
    const [hsv, setHsv] = useState(() => rgbToHsv(hexToRgb(color)));
    const [hexValue, setHexValue] = useState(color);
    const [copied, setCopied] = useState(false);
    const [isCustomPickerOpen, setIsCustomPickerOpen] = useState(false);

    const svPlaneRef = useRef<HTMLDivElement>(null);
    const hueSliderRef = useRef<HTMLDivElement>(null);

    // Update internal HSV when external color prop changes
    useEffect(() => {
        if (color.toUpperCase() !== hexValue.toUpperCase()) {
            try {
                const newRgb = hexToRgb(color);
                const newHsv = rgbToHsv(newRgb);
                setHsv(newHsv);
                setHexValue(color.toUpperCase());
            } catch (e) {
                console.error("Invalid color prop:", color);
            }
        }
    }, [color, hexValue]);

    // Update parent and hex input when internal HSV state changes from user interaction
    useEffect(() => {
        const newRgb = hsvToRgb(hsv);
        const newHex = rgbToHex(newRgb);
        
        if (newHex.toUpperCase() !== hexValue.toUpperCase()) {
            setHexValue(newHex);
            onChange(newHex);
        }
    }, [hsv, onChange]);

    const handleSvDrag = useCallback((pos: { x: number; y: number }) => {
        if (!svPlaneRef.current) return;
        const rect = svPlaneRef.current.getBoundingClientRect();
        const s = (pos.x / rect.width) * 100;
        const v = 100 - (pos.y / rect.height) * 100;
        setHsv(prev => ({ ...prev, s: Math.max(0, Math.min(s, 100)), v: Math.max(0, Math.min(v, 100)) }));
    }, []);

    const handleHueDrag = useCallback((pos: { y: number }) => {
        if (!hueSliderRef.current) return;
        const rect = hueSliderRef.current.getBoundingClientRect();
        const h = (pos.y / rect.height) * 360;
        setHsv(prev => ({ ...prev, h: Math.max(0, Math.min(h, 360)) }));
    }, []);
    
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value.toUpperCase();
        setHexValue(newHex);
        if (/^#[0-9A-F]{6}$/i.test(newHex) || /^#[0-9A-F]{3}$/i.test(newHex)) {
            const newRgb = hexToRgb(newHex);
            const newHsv = rgbToHsv(newRgb);
            setHsv(newHsv);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(hexValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const svDragHandlers = useDraggable(handleSvDrag, svPlaneRef);
    const hueDragHandlers = useDraggable(handleHueDrag, hueSliderRef);
    
    const hueColor = `hsl(${hsv.h}, 100%, 50%)`;

    return (
        <div>
            <p className="text-sm font-medium text-gray-300 mb-2">{label}</p>
            <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-400 mb-2">Preset Colors</p>
                        <div className="grid grid-cols-9 gap-2">
                            {PRESET_COLORS.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => onChange(preset)}
                                    className="relative w-full aspect-square rounded-full transition-transform duration-150 ease-in-out hover:scale-110"
                                    style={{ backgroundColor: preset }}
                                    aria-label={`Select color ${preset}`}
                                >
                                    {color.toUpperCase() === preset.toUpperCase() && (
                                        <div className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-gray-800 ring-white flex items-center justify-center">
                                            <CheckIcon size={12} className="text-white" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-gray-700/50"></div>

                    <div>
                        <button 
                            type="button"
                            onClick={() => setIsCustomPickerOpen(!isCustomPickerOpen)}
                            className="w-full flex justify-between items-center py-2 text-sm font-medium text-gray-300"
                        >
                            <span>Custom Color</span>
                            <ChevronDownIcon size={16} className={`transition-transform duration-200 ${isCustomPickerOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isCustomPickerOpen && (
                            <div className="mt-3 space-y-3 animate-scale-in origin-top">
                                <div className="flex gap-3">
                                    <div
                                        ref={svPlaneRef}
                                        {...svDragHandlers}
                                        className="relative w-full h-40 rounded-md cursor-crosshair overflow-hidden border border-gray-600"
                                        style={{ backgroundColor: hueColor }}
                                    >
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, white, transparent)' }} />
                                        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, black, transparent)' }} />
                                        <div
                                            className="absolute w-4 h-4 rounded-full border-2 border-white shadow-lg pointer-events-none"
                                            style={{
                                                left: `calc(${hsv.s}% - 8px)`,
                                                top: `calc(${100 - hsv.v}% - 8px)`,
                                                backgroundColor: hexValue,
                                            }}
                                        />
                                    </div>
                                    <div
                                        ref={hueSliderRef}
                                        {...hueDragHandlers}
                                        className="relative w-6 h-40 rounded-md cursor-pointer border border-gray-600"
                                        style={{ background: 'linear-gradient(to bottom, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}
                                    >
                                        <div
                                            className="absolute w-full h-1.5 bg-transparent border-y-2 border-white shadow-lg pointer-events-none"
                                            style={{ top: `calc(${(hsv.h / 360) * 100}% - 3px)` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md border border-gray-600" style={{ backgroundColor: hexValue }} />
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            value={hexValue}
                                            onChange={handleHexChange}
                                            className="w-full p-2 pr-10 border border-gray-600 rounded-md bg-gray-900 text-white font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                        />
                                        <button onClick={handleCopy} className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 hover:text-white">
                                            {copied ? <CheckIcon size={16} className="text-green-400" /> : <ClipboardIcon size={16} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ColorPicker;