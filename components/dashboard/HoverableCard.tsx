import React from 'react';
import { Card } from '@/components/ui/card';
import { AnimatedWrapper } from '@/components/dashboard/AnimatedWrapper';
import { cn } from '@/lib/utils';

interface HoverableCardProps extends React.ComponentPropsWithoutRef<typeof Card> {
  hoverEffect?: 'lift' | 'glow' | 'border' | 'shadow' | 'zoom';
  animationType?: 'scale' | 'bounce' | 'slide' | 'fade' | 'pulse';
  onClick?: (e: React.MouseEvent) => void;
}

export function HoverableCard({
  children,
  className,
  hoverEffect = 'lift',
  animationType = 'scale',
  onClick,
  ...props
}: HoverableCardProps) {
  // Define hover effect classes
  const hoverClasses = {
    lift: 'hover:-translate-y-1 transition-transform duration-200',
    glow: 'hover:bg-opacity-105 hover:shadow-lg hover:shadow-primary/20 transition-all duration-200',
    border: 'hover:border-primary transition-colors duration-200',
    shadow: 'hover:shadow-lg transition-shadow duration-200',
    zoom: 'hover:scale-[1.02] transition-transform duration-200',
  };

  return (
    <AnimatedWrapper 
      className={cn('', className)}
      onClick={onClick}
      animationType={animationType}
    >
      <Card 
        className={cn(
          'transition-all',
          hoverClasses[hoverEffect],
          className
        )}
        {...props}
      >
        {children}
      </Card>
    </AnimatedWrapper>
  );
}