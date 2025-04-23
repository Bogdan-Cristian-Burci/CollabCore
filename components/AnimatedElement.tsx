import React, { cloneElement, forwardRef, useRef, isValidElement } from 'react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils';
import { AnimationVariant } from '@/components/ui/animated-container';

interface AnimatedElementProps {
  children: React.ReactNode;
  className?: string;
  variant?: AnimationVariant;
  duration?: number;
  disabled?: boolean;
  triggerOnHover?: boolean;
  triggerOnClick?: boolean;
  preserveProps?: boolean; // Whether to merge props with child or replace them
  asChild?: boolean; // Whether to render only the child
}

const animations = {
  scale: {
    from: { scale: 0.95, opacity: 0.8 },
    to: { scale: 1, opacity: 1, ease: 'power2.out' }
  },
  bounce: {
    from: { y: 0 },
    to: { y: ['-4px', '0px'], ease: 'power1.inOut' }
  },
  slide: {
    from: { x: -5, opacity: 0.7 },
    to: { x: 0, opacity: 1, ease: 'power2.out' }
  },
  fade: {
    from: { opacity: 0.5 },
    to: { opacity: 1, ease: 'power2.inOut' }
  },
  pulse: {
    from: { scale: 1 },
    to: { scale: [1.05, 1], ease: 'power2.inOut' }
  },
  spin: {
    from: { rotation: 0 },
    to: { rotation: 360, ease: 'power1.inOut' }
  },
  shake: {
    from: { x: 0 },
    to: { x: [0, -3, 3, -3, 3, 0], ease: 'power1.inOut' }
  }
};

export const AnimatedElement = forwardRef<HTMLElement, AnimatedElementProps>(
  ({
    children,
    className,
    variant = 'scale',
    duration = 0.3,
    disabled = false,
    triggerOnHover = false,
    triggerOnClick = true,
    preserveProps = true,
    asChild = false,
  }, forwardedRef) => {
    const innerRef = useRef<HTMLElement>(null);
    const ref = (forwardedRef || innerRef) as React.RefObject<HTMLElement>;

    const runAnimation = () => {
      if (!disabled && ref.current) {
        const { from, to } = animations[variant];
        gsap.fromTo(ref.current, from, { ...to, duration });
      }
    };

    const handleClick = (e: React.MouseEvent) => {
      if (triggerOnClick) {
        runAnimation();
      }
    };

    const handleMouseEnter = (e: React.MouseEvent) => {
      if (triggerOnHover) {
        runAnimation();
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
          triggerOnClick && !disabled && 'cursor-pointer',
          className
        ),
      });
    }

    // Otherwise, wrap the children in a div with the animation handlers
    return (
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        className={cn(
          'transition-all',
          triggerOnClick && !disabled && 'cursor-pointer',
          disabled && 'opacity-60',
          className
        )}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
      >
        {children}
      </div>
    );
  }
);

AnimatedElement.displayName = 'AnimatedElement';

// Higher-order component for wrapping any component with animation
export function withAnimation<T extends React.ComponentType<any>>(
  Component: T,
  animationProps?: Omit<AnimatedElementProps, 'children' | 'asChild'>
) {
  // Define the wrapped component with better type handling
  function WithAnimation(props: any) {
    return (
      <AnimatedElement {...animationProps} asChild>
        <Component {...props} />
      </AnimatedElement>
    );
  }
  
  WithAnimation.displayName = `WithAnimation(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAnimation;
}