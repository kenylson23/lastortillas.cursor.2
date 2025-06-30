import { motion } from "framer-motion";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade';
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
  threshold?: number;
  stagger?: boolean;
  staggerDelay?: number;
  staggerIndex?: number;
}

export default function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 50,
  className = '',
  threshold = 0.1,
  stagger = false,
  staggerDelay = 0.1,
  staggerIndex = 0,
}: ScrollRevealProps) {
  const { ref, isVisible } = useScrollReveal({ threshold });

  const getInitialState = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance };
      case 'down':
        return { opacity: 0, y: -distance };
      case 'left':
        return { opacity: 0, x: distance };
      case 'right':
        return { opacity: 0, x: -distance };
      case 'fade':
        return { opacity: 0 };
      default:
        return { opacity: 0, y: distance };
    }
  };

  const getAnimateState = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { opacity: 1, y: 0 };
      case 'left':
      case 'right':
        return { opacity: 1, x: 0 };
      case 'fade':
        return { opacity: 1 };
      default:
        return { opacity: 1, y: 0 };
    }
  };

  const finalDelay = stagger ? delay + (staggerIndex * staggerDelay) : delay;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialState()}
      animate={isVisible ? getAnimateState() : getInitialState()}
      transition={{
        duration,
        delay: finalDelay,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}