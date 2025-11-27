import { motion } from 'framer-motion';
import type { FC } from 'react';

interface CarouselSlide {
  image: string;
  title: string;
  subtitle: string;
  cta?: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
}

const HeroCarousel: FC<HeroCarouselProps> = ({ slides }) => (
  <section className="border-b-[3px] border-dark bg-main py-8 sm:py-10">
    <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3 lg:px-0">
      {slides.map((slide, index) => (
        <motion.div
          key={slide.title}
          className="relative flex min-h-[300px] flex-col justify-between overflow-hidden border-[3px] border-dark bg-dark shadow-hard sm:min-h-[360px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/95 via-dark/60 to-dark/10 backdrop-blur-[2px]" />
          <div className="relative z-10 flex h-full flex-col justify-between bg-dark/50 p-5 text-surface backdrop-blur-[2px] sm:p-6">
            <div className="space-y-2 sm:space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.45em] text-primary/70 sm:text-xs">Postro Drop</p>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight leading-[0.95] sm:text-3xl">
                {slide.title}
              </h2>
              <p className="text-xs font-medium uppercase tracking-[0.15em] text-surface/80 sm:text-sm">
                {slide.subtitle}
              </p>
            </div>
            {slide.cta && (
              <motion.button
                type="button"
                className="mt-6 inline-flex items-center justify-between gap-3 border-[3px] border-primary bg-primary px-4 py-2.5 text-[0.7rem] font-black uppercase tracking-[0.3em] text-dark max-[480px]:w-full max-[480px]:justify-center max-[480px]:gap-2 max-[480px]:text-center sm:px-5 sm:py-3 sm:text-xs"
                whileHover={{ x: -4, y: -4, boxShadow: '8px 8px 0px 0px #0D0D0D' }}
                whileTap={{ x: 0, y: 0, boxShadow: '0px 0px 0px 0px #0D0D0D' }}
              >
                {slide.cta}
                <span className="text-lg">↗</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

export default HeroCarousel;
