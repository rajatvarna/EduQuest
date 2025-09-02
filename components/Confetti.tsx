import React from 'react';

const CONFETTI_COUNT = 50;

const Confetti: React.FC = () => {
    const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
        };

        const colorClasses = [
            'bg-teal-400', 
            'bg-cyan-400', 
            'bg-yellow-400', 
            'bg-orange-400',
            'bg-pink-400',
        ];
        
        const size = Math.random() > 0.5 ? 'w-2 h-2' : 'w-3 h-3';
        const shape = Math.random() > 0.5 ? 'rounded-full' : '';
        const color = colorClasses[Math.floor(Math.random() * colorClasses.length)];

        return (
            <div
                key={i}
                className={`absolute top-0 animate-confetti-fall ${size} ${shape} ${color}`}
                style={style}
            />
        );
    });

    return (
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {confetti}
        </div>
    );
};

export default Confetti;
