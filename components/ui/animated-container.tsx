import React, { forwardRef, ReactNode, useRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

export type AnimationVariant = 
  | 'scale'    // Subtle scale animation
  | 'bounce'   // Small bounce effect
  | 'slide'    // Slide in from side
  | 'fade'     // Fade in/out
  | 'pulse'    // Pulse animation
  | 'spin'     // Spin animation
  | 'shake';   // Shake animation

export interface AnimatedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: AnimationVariant;
  duration?: number;
  disabled?: boolean;
  triggerOnHover?: boolean;
  triggerOnClick?: boolean;
  as?: React.ElementType;
}

export const AnimatedContainer = forwardRef<HTMLDivElement, AnimatedContainerProps>(
  ({ 
    children, 
    className, 
    variant = 'scale', 
    duration = 0.3,
    disabled = false,
    triggerOnHover = false,
    triggerOnClick = true,
    as: Component = 'div',
    ...props 
  }, forwardedRef) => {
    const innerRef = useRef<HTMLDivElement>(null);
    const elementRef = (forwardedRef || innerRef) as React.RefObject<HTMLDivElement>;
    
    const animations = {
      scale: {
        from: { scale: 0.95, opacity: 0.8 },
        to: { scale: 1, opacity: 1, duration, ease: 'power2.out' }
      },
      bounce: {
        from: { y: 0 },
        to: { y: ['-4px', '0px'], duration, ease: 'power1.inOut' }
      },
      slide: {
        from: { x: -5, opacity: 0.7 },
        to: { x: 0, opacity: 1, duration, ease: 'power2.out' }
      },
      fade: {
        from: { opacity: 0.5 },
        to: { opacity: 1, duration, ease: 'power2.inOut' }
      },
      pulse: {
        from: { scale: 1 },
        to: { scale: [1.05, 1], duration, ease: 'power2.inOut' }
      },
      spin: {
        from: { rotation: 0 },
        to: { rotation: 360, duration, ease: 'power1.inOut' }
      },
      shake: {
        from: { x: 0 },
        to: { x: [0, -3, 3, -3, 3, 0], duration, ease: 'power1.inOut' }
      }
    };

    const runAnimation = () => {
      if (!disabled && elementRef.current) {
        const { from, to } = animations[variant];
        gsap.fromTo(elementRef.current, from, to);
      }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (triggerOnClick) {
        runAnimation();
      }
      
      if (props.onClick && !disabled) {
        props.onClick(e);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (triggerOnHover) {
        runAnimation();
      }
      
      if (props.onMouseEnter && !disabled) {
        props.onMouseEnter(e);
      }
    };

    return (
      <Component
        ref={elementRef}
        className={cn(
          'transition-all',
          triggerOnClick && !disabled && 'cursor-pointer',
          disabled && 'opacity-60',
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AnimatedContainer.displayName = 'AnimatedContainer';