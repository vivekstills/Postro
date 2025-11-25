import { motion, useSpring } from 'framer-motion';
import type { FC } from 'react';
import { useEffect, useState } from 'react';

const spring = { stiffness: 400, damping: 30, mass: 0.2 };
const ringSpring = { stiffness: 220, damping: 25, mass: 0.3 };

const CustomCursor: FC = () => {
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const dotX = useSpring(0, spring);
  const dotY = useSpring(0, spring);
  const ringX = useSpring(0, ringSpring);
  const ringY = useSpring(0, ringSpring);

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    const update = () => setIsDesktop(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (!isDesktop) return;

    const handleMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      dotX.set(clientX - 4);
      dotY.set(clientY - 4);
      ringX.set(clientX - 24);
      ringY.set(clientY - 24);
      setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleInteractiveHover = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const interactive = event.target.closest('a, button, [role="button"], [data-cursor="hover"]');
      setIsHoveringInteractive(Boolean(interactive));
    };

    const handleDown = () => setIsPressed(true);
    const handleUp = () => setIsPressed(false);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseenter', handleMouseEnter);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseover', handleInteractiveHover);
    document.addEventListener('mousedown', handleDown);
    document.addEventListener('mouseup', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseover', handleInteractiveHover);
      document.removeEventListener('mousedown', handleDown);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDesktop, dotX, dotY, ringX, ringY]);

  if (!isDesktop) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      <motion.div
        className="pointer-events-none fixed z-[9999] h-3 w-3 rounded-full bg-dark"
        style={{ x: dotX, y: dotY }}
        animate={{ scale: isPressed ? 0.6 : 1, opacity: isVisible ? 1 : 0 }}
        transition={{ duration: 0.15 }}
      />
      <motion.div
        className="pointer-events-none fixed z-[9999] h-12 w-12 rounded-full border-2 border-primary"
        style={{ x: ringX, y: ringY }}
        animate={{
          scale: isHoveringInteractive ? 1.3 : 0.6,
          opacity: isVisible ? (isHoveringInteractive ? 0.9 : 0.4) : 0,
        }}
        transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      />
    </div>
  );
};

export default CustomCursor;
