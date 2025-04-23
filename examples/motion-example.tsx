import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Motion, withMotion } from '@/components/ui/motion';

// Example usage of the Motion component

export function MotionExamples() {
  return (
    <div className="space-y-8 p-4">
      <h1 className="text-2xl font-bold">Motion Component Examples</h1>
      
      {/* Basic usage */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Basic Variants</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Motion variant="scale">
            <Card>
              <CardHeader>
                <CardTitle>Scale</CardTitle>
              </CardHeader>
              <CardContent>Click me to see scale effect</CardContent>
            </Card>
          </Motion>
          
          <Motion variant="bounce">
            <Card>
              <CardHeader>
                <CardTitle>Bounce</CardTitle>
              </CardHeader>
              <CardContent>Click me to see bounce effect</CardContent>
            </Card>
          </Motion>
          
          <Motion variant="slide">
            <Card>
              <CardHeader>
                <CardTitle>Slide</CardTitle>
              </CardHeader>
              <CardContent>Click me to see slide effect</CardContent>
            </Card>
          </Motion>
          
          <Motion variant="fade">
            <Card>
              <CardHeader>
                <CardTitle>Fade</CardTitle>
              </CardHeader>
              <CardContent>Click me to see fade effect</CardContent>
            </Card>
          </Motion>
          
          <Motion variant="pulse">
            <Card>
              <CardHeader>
                <CardTitle>Pulse</CardTitle>
              </CardHeader>
              <CardContent>Click me to see pulse effect</CardContent>
            </Card>
          </Motion>
          
          <Motion variant="shake">
            <Card>
              <CardHeader>
                <CardTitle>Shake</CardTitle>
              </CardHeader>
              <CardContent>Click me to see shake effect</CardContent>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* Trigger options */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Trigger Options</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Motion variant="pulse" triggerOnHover={true} triggerOnClick={false}>
            <Card>
              <CardHeader>
                <CardTitle>Hover Trigger</CardTitle>
              </CardHeader>
              <CardContent>Hover over me to see pulse effect</CardContent>
            </Card>
          </Motion>
          
          <Motion variant="pulse" triggerOnHover={true} triggerOnClick={true}>
            <Card>
              <CardHeader>
                <CardTitle>Hover & Click Trigger</CardTitle>
              </CardHeader>
              <CardContent>Both hover and click will trigger animation</CardContent>
            </Card>
          </Motion>
        </div>
      </section>
      
      {/* Using asChild */}
      <section>
        <h2 className="text-xl font-semibold mb-4">As Child (Direct Component Animation)</h2>
        <div className="flex flex-wrap gap-4">
          <Motion variant="scale" asChild>
            <Button>Animated Button</Button>
          </Motion>
          
          <Motion variant="bounce" asChild>
            <Button variant="outline">Bouncy Button</Button>
          </Motion>
          
          <Motion variant="shake" asChild>
            <Button variant="destructive">Shakey Button</Button>
          </Motion>
        </div>
      </section>
      
      {/* Using withMotion HOC */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Higher-Order Component</h2>
        <div className="flex flex-wrap gap-4">
          <AnimatedButton>Animated Button</AnimatedButton>
          <AnimatedBounceButton variant="outline">Bouncy Button</AnimatedBounceButton>
        </div>
      </section>
    </div>
  );
}

// Examples of Higher-Order Component usage
const AnimatedButton = withMotion(Button, { variant: 'scale' });
const AnimatedBounceButton = withMotion(Button, { variant: 'bounce' });

export default MotionExamples;