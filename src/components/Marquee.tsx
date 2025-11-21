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
          background: var(--black);
          color: var(--primary); /* Acid Green */
          overflow: hidden;
          white-space: nowrap;
          padding: 12px 0;
          border-bottom: var(--border-thick) solid var(--black);
        }

        .marquee-content {
          display: inline-block;
          animation: scroll 15s linear infinite;
          font-family: var(--font-heading);
          font-weight: 900;
          font-size: 1.2rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .marquee-item {
          padding: 0 var(--space-xl);
        }

        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
        </div>
    );
};

export default Marquee;
