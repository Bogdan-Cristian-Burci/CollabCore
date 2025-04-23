import React, { useRef, ReactNode, forwardRef } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

interface AnimatedWrapperProps {
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  animationType?: 'scale' | 'bounce' | 'slide' | 'fade' | 'pulse';
  duration?: number;
  disabled?: boolean;
  as?: React.ElementType;
}

export const AnimatedWrapper = forwardRef<HTMLElement, AnimatedWrapperProps>(
  ({ 
    children, 
    className, 
    onClick, 
    animationType = 'scale',
    duration = 0.3,
    disabled = false,
    as: Component = 'div',
    ...props 
  }, forwardedRef) => {
    const innerRef = useRef<HTMLElement>(null);
    const elementRef = (forwardedRef || innerRef) as React.RefObject<HTMLElement>;
    
    // Define animation functions with proper GSAP typing
    const getAnimationProps = () => {
      switch (animationType) {
        case 'bounce':
          return {
            from: { y: 0 },
            to: { 
              y: -4, // First animate up
              duration: duration / 2,
              ease: 'power1.out',
              onComplete: () => {
                // Then animate back down
                if (elementRef.current) {
                  gsap.to(elementRef.current, {
                    y: 0,
                    duration: duration / 2,
                    ease: 'power1.in'
                  });
                }
              }
            }
          };
        case 'slide':
          return {
            from: { x: -5, opacity: 0.7 },
            to: { x: 0, opacity: 1, duration, ease: 'power2.out' }
          };
        case 'fade':
          return {
            from: { opacity: 0.5 },
            to: { opacity: 1, duration, ease: 'power2.inOut' }
          };
        case 'pulse':
          return {
            from: { scale: 1 },
            to: { 
              scale: 1.05, // First scale up
              duration: duration / 2,
              ease: 'power2.out',
              onComplete: () => {
                // Then scale back down
                if (elementRef.current) {
                  gsap.to(elementRef.current, {
                    scale: 1,
                    duration: duration / 2,
                    ease: 'power2.in'
                  });
                }
              }
            }
          };
        case 'scale':
        default:
          return {
            from: { scale: 0.95, opacity: 0.8 },
            to: { scale: 1, opacity: 1, duration, ease: 'power2.out' }
          };
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      if (!disabled && elementRef.current) {
        const { from, to } = getAnimationProps();
        gsap.fromTo(elementRef.current, from, to);
      }
      
      if (onClick && !disabled) {
        onClick(e);
      }
    };

    const wrapperClasses = cn(
      'transition-all',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      className
    );

    return (
      <Component
        ref={elementRef}
        className={wrapperClasses}
        onClick={handleClick}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

AnimatedWrapper.displayName = 'AnimatedWrapper';

// Helper component that accepts any component as a child and wraps it with animation
export function WithAnimation<T extends React.ElementType>({
  component: Component,
  animationType,
  duration,
  componentProps,
  ...props
}: {
  component: T;
  animationType?: AnimatedWrapperProps['animationType'];
  duration?: number;
  componentProps: any; // Use any to avoid TypeScript complexities with generic props
}) {
  return (
    <AnimatedWrapper
      as="div"
      animationType={animationType}
      duration={duration}
      {...props}
    >
      <Component {...componentProps} />
    </AnimatedWrapper>
  );
}