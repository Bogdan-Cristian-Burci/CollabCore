import React, { forwardRef, useRef, cloneElement, isValidElement } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';

export type MotionVariant =
  | 'scale'  // Subtle scale animation
  | 'bounce' // Small bounce effect
  | 'slide'  // Slide in from side
  | 'fade'   // Fade in/out
  | 'pulse'  // Pulse animation
  | 'spin'   // Spin animation
  | 'shake'  // Shake animation
  | 'none';  // No animation (bypass)

export interface MotionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: MotionVariant;
  duration?: number;
  disabled?: boolean;
  triggerOnHover?: boolean;
  triggerOnClick?: boolean;
  as?: React.ElementType;
  asChild?: boolean;
  delay?: number;
}

// Define sequential animations that work with GSAP's typing
const runAnimation = (el: HTMLElement, variant: MotionVariant, duration: number, delay: number = 0) => {
  if (!el || variant === 'none') return;
  
  // Apply the appropriate animation based on variant
  switch (variant) {
    case 'scale':
      gsap.fromTo(el, 
        { scale: 0.95, opacity: 0.8 }, 
        { scale: 1, opacity: 1, duration, ease: 'power2.out', delay }
      );
      break;
      
    case 'bounce':
      // First animate up
      gsap.fromTo(el, 
        { y: 0 }, 
        { 
          y: -4, 
          duration: duration / 2, 
          ease: 'power1.out',
          delay, 
          onComplete: () => {
            // Then animate back down
            gsap.to(el, { y: 0, duration: duration / 2, ease: 'power1.in' });
          }
        }
      );
      break;
      
    case 'slide':
      gsap.fromTo(el, 
        { x: -5, opacity: 0.7 }, 
        { x: 0, opacity: 1, duration, ease: 'power2.out', delay }
      );
      break;
      
    case 'fade':
      gsap.fromTo(el, 
        { opacity: 0.5 }, 
        { opacity: 1, duration, ease: 'power2.inOut', delay }
      );
      break;
      
    case 'pulse':
      // First scale up
      gsap.fromTo(el, 
        { scale: 1 }, 
        { 
          scale: 1.05, 
          duration: duration / 2, 
          ease: 'power2.out',
          delay, 
          onComplete: () => {
            // Then scale back down
            gsap.to(el, { scale: 1, duration: duration / 2, ease: 'power2.in' });
          }
        }
      );
      break;
      
    case 'spin':
      gsap.fromTo(el, 
        { rotation: 0 }, 
        { rotation: 360, duration, ease: 'power1.inOut', delay }
      );
      break;
      
    case 'shake':
      // Sequential shake animation
      gsap.timeline({ delay })
        .to(el, { x: -3, duration: duration / 5, ease: 'power1.inOut' })
        .to(el, { x: 3, duration: duration / 5, ease: 'power1.inOut' })
        .to(el, { x: -3, duration: duration / 5, ease: 'power1.inOut' })
        .to(el, { x: 3, duration: duration / 5, ease: 'power1.inOut' })
        .to(el, { x: 0, duration: duration / 5, ease: 'power1.inOut' });
      break;
  }
};

export const Motion = forwardRef<HTMLElement, MotionWrapperProps>(
  ({
    children,
    className,
    variant = 'scale',
    duration = 0.3,
    disabled = false,
    triggerOnHover = false,
    triggerOnClick = true,
    as: Component = 'div',
    asChild = false,
    delay = 0,
    ...props
  }, forwardedRef) => {
    const innerRef = useRef<HTMLElement>(null);
    const ref = (forwardedRef || innerRef) as React.RefObject<HTMLElement>;

    const handleAnimation = () => {
      if (!disabled && ref.current && variant !== 'none') {
        runAnimation(ref.current, variant, duration, delay);
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      if (triggerOnClick && variant !== 'none') {
        handleAnimation();
      }
      
      if (props.onClick) {
        props.onClick(e);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
      if (triggerOnHover && variant !== 'none') {
        handleAnimation();
      }
      
      if (props.onMouseEnter) {
        props.onMouseEnter(e);
      }
    };

    // If asChild is true and we have a valid element, just clone and add the animation handlers
    if (asChild && isValidElement(children)) {
      return cloneElement(children, {
        ref,
        onClick: (e: React.MouseEvent) => {
          handleClick(e);
          if (children.props.onClick) {
            children.props.onClick(e);
          }
        },
        onMouseEnter: (e: React.MouseEvent) => {
          handleMouseEnter(e);
          if (children.props.onMouseEnter) {
            children.props.onMouseEnter(e);
          }
        },
        className: cn(
          children.props.className,
          triggerOnClick && !disabled && variant !== 'none' && 'cursor-pointer',
          className
        ),
        ...props
      });
    }

    return (
      <Component
        ref={ref as any}
        className={cn(
          'transition-all',
          triggerOnClick && !disabled && variant !== 'none' && 'cursor-pointer',
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

Motion.displayName = 'Motion';

// Higher-order component version with improved TypeScript types
export function withMotion<T extends React.ComponentType<any>>(
  Component: T,
  motionProps?: Omit<MotionWrapperProps, 'children' | 'asChild'>
) {
  // Generic props type that preserves the original component's props
  const WithMotion = (props: React.ComponentProps<T>) => {
    // TypeScript workaround to properly merge props
    const componentProps = props as any;
    
    return (
      <Motion {...motionProps} asChild>
        <Component {...componentProps} />
      </Motion>
    );
  };
  
  WithMotion.displayName = `WithMotion(${Component.displayName || Component.name || 'Component'})`;
  
  return WithMotion;
}