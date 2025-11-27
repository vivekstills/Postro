import clsx from 'clsx';
import type { FC } from 'react';

interface MarqueeProps {
  items?: string[];
  className?: string;
}

const defaultItems = ['STREETWEAR', 'POSTERS', 'LIMITED EDITION'];

const Marquee: FC<MarqueeProps> = ({ items = defaultItems, className }) => {
  const phrase = items.map((item) => item.toUpperCase()).join(' • ');

  return (
    <div className={clsx('overflow-hidden border-y-[3px] border-dark bg-dark py-3 text-primary sm:py-4', className)}>
      <div className="flex animate-marquee whitespace-nowrap text-[0.65rem] font-bold uppercase tracking-[0.35em] sm:text-xs sm:tracking-[0.4em] md:text-sm">
        {Array.from({ length: 4 }).map((_, index) => (
          <span key={index} className="px-8">
            {phrase} •
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
