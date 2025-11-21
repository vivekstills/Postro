import React from 'react';
import '../index.css';

interface MarqueeProps {
    text: string;
    direction?: 'left' | 'right';
    speed?: number;
    className?: string;
}

const Marquee: React.FC<MarqueeProps> = ({
    text,
    direction = 'left',
    speed = 20,
    className = ''
}) => {
    return (
        <div className={`marquee-container ${className}`}>
            <div className="marquee-content" style={{ animationDuration: `${speed}s`, animationDirection: direction === 'right' ? 'reverse' : 'normal' }}>
                {Array(10).fill(text).map((item, index) => (
                    <span key={index} className="marquee-item">{item}</span>
                ))}
            </div>
            <style>{`
                .marquee-container {
                    overflow: hidden;
                    white-space: nowrap;
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .marquee-content {
                    display: flex;
                    animation: scroll linear infinite;
                }

                .marquee-item {
                    padding: 0 var(--space-xl);
                    font-family: var(--font-display);
                    font-size: clamp(2rem, 6vw, 4rem);
                    text-transform: uppercase;
                    color: transparent;
                    -webkit-text-stroke: 2px var(--black);
                    opacity: 0.8;
                }

                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
};

export default Marquee;
