"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { Tabs as BaseTabs, TabsList as BaseTabsList, TabsTrigger as BaseTabsTrigger, TabsContent as BaseTabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"

interface AnimatedTabsListProps extends React.ComponentProps<typeof BaseTabsList> {
  activeTabValue?: string
}

export function AnimatedTabsList({
  children,
  className,
  activeTabValue,
  ...props
}: AnimatedTabsListProps) {
  const [activeTabElement, setActiveTabElement] = useState<HTMLButtonElement | null>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({
    width: 0,
    left: 0,
    height: 0,
    opacity: 0,
  })
  const listRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!listRef.current) return
    
    // Find active tab element
    const activeTab = listRef.current.querySelector('[data-state="active"]') as HTMLButtonElement
    if (activeTab) {
      setActiveTabElement(activeTab)
      
      // Update indicator position
      const { offsetLeft, offsetWidth } = activeTab
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
        height: 100,
        opacity: 1,
      })
    }
  }, [activeTabValue, children])
  
  // Update indicator position when tabs change
  const handleTabsChange = () => {
    if (!listRef.current) return
    
    setTimeout(() => {
      const activeTab = listRef.current?.querySelector('[data-state="active"]') as HTMLButtonElement
      if (activeTab) {
        const { offsetLeft, offsetWidth } = activeTab
        setIndicatorStyle({
          left: offsetLeft,
          width: offsetWidth,
          height: 100,
          opacity: 1,
        })
      }
    }, 0)
  }
  
  return (
    <BaseTabsList 
      ref={listRef} 
      className={cn("relative bg-[var(--background)] p-0", className)}
      onClick={handleTabsChange}
      {...props}
    >
      <div 
        className="absolute bg-[var(--primary)] rounded-sm shadow-md z-0 transition-all duration-300 ease-in-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          height: '80%',
          opacity: indicatorStyle.opacity,
          top: 4,
        }}
      />
      {children}
    </BaseTabsList>
  )
}

// Custom TabsTrigger that overrides dark mode styles
function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof BaseTabsTrigger>) {
  return (
    <BaseTabsTrigger
      className={cn(
        // Override dark mode text color with !important to increase specificity
        "dark:data-[state=active]:!text-[var(--primary-foreground)]", 
        className
      )}
      {...props}
    />
  )
}

const Tabs = BaseTabs;
const TabsContent = BaseTabsContent;

export { Tabs, TabsContent, TabsTrigger }