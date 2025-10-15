import React from 'react';

const FuturisticFaceScan: React.FC = () => {
    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                    <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-secondary)" stopOpacity="0.5"/>
                        <stop offset="50%" stopColor="var(--color-secondary)" stopOpacity="1"/>
                        <stop offset="100%" stopColor="var(--color-secondary)" stopOpacity="0.5"/>
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <style>{`
                    .face-line {
                        stroke: #94A3B8; /* neutral-400 */
                        stroke-width: 0.75;
                        fill: none;
                        opacity: 0.3;
                    }
                    .dark .face-line {
                        stroke: #475569; /* neutral-600 */
                    }
                    .scan-line {
                        animation: scan 4s linear infinite;
                    }
                    .pulse {
                        animation: pulse 2s ease-out infinite;
                        transform-origin: center;
                    }
                    @keyframes scan {
                        0% { transform: translateY(-10px); }
                        50% { transform: translateY(170px); }
                        100% { transform: translateY(-10px); }
                    }
                    @keyframes pulse {
                        0% { transform: scale(0.95); opacity: 0.7; }
                        70% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(0.95); opacity: 0.7; }
                    }
                `}</style>
                
                {/* Face Outline */}
                <path className="face-line" d="M 100,30 C 60,30 40,70 40,100 C 40,150 70,180 100,180 C 130,180 160,150 160,100 C 160,70 140,30 100,30 Z" />
                <path className="face-line" d="M 70,90 Q 75,80 85,90" />
                <path className="face-line" d="M 130,90 Q 125,80 115,90" />
                <path className="face-line" d="M 90,125 Q 100,135 110,125" />
                <path className="face-line" d="M 95,110 A 10 10 0 0 1 105 110" />

                {/* Analysis Elements */}
                <g filter="url(#glow)" opacity="0.8">
                    {/* Targeting Circles */}
                    <circle cx="80" cy="85" r="12" stroke="var(--color-primary)" strokeWidth="1" fill="none" className="pulse" style={{ animationDelay: '0.5s' }}/>
                    <circle cx="120" cy="140" r="15" stroke="var(--color-primary)" strokeWidth="1" fill="none" className="pulse" />
                    
                    {/* Data Points */}
                    <circle cx="70" cy="70" r="1.5" fill="var(--color-secondary)"/>
                    <circle cx="130" cy="70" r="1.5" fill="var(--color-secondary)"/>
                    <circle cx="100" cy="155" r="1.5" fill="var(--color-secondary)"/>
                    <line x1="70" y1="70" x2="130" y2="70" stroke="var(--color-secondary)" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="70" y1="70" x2="100" y2="155" stroke="var(--color-secondary)" strokeWidth="0.5" strokeDasharray="2 2" />
                    <line x1="130" y1="70" x2="100" y2="155" stroke="var(--color-secondary)" strokeWidth="0.5" strokeDasharray="2 2" />
                    
                    {/* Scanning Line */}
                    <rect className="scan-line" x="40" y="80" width="120" height="2" fill="url(#scanGradient)" />
                </g>
            </svg>
        </div>
    );
};

export default FuturisticFaceScan;