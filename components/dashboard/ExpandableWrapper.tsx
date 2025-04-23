import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CheckBoxAsButton from "@/components/CheckBoxAsButton";


// Generic type for the list items
type WrapperProps<T extends Record<string, any>> = {
    list: T[];
    searchBy: keyof T;
    filterBy: keyof T;
    SimpleComponent: React.ComponentType<{ item: T }>;
    DetailedComponent: React.ComponentType<{ item: T }>;
    ListDetailedComponent: React.ComponentType<{ item: T }>;
};

export function ExpandableWrapper<T extends Record<string, any>>({
                                                           list,
                                                           searchBy,
                                                           filterBy,
                                                           SimpleComponent,
                                                           DetailedComponent,
                                                           ListDetailedComponent,
                                                       }: WrapperProps<T>) {
    // States
    const [expanded, setExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [selectedItem, setSelectedItem] = useState<T | null>(null);
    const [indicatorStyle, setIndicatorStyle] = useState({
        width: 0,
        left: 0,
        height: 0,
        opacity: 0,
    });
    const [activeButtonElement, setActiveButtonElement] = useState<HTMLButtonElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Refs for animations
    const wrapperRef = useRef<HTMLDivElement>(null);
    const smallerListRef = useRef<HTMLDivElement>(null);
    const showListRef = useRef<HTMLDivElement>(null);

    // Get unique filter values
    const filterValues = [...new Set(list.map(item => String(item[filterBy])))];

    const getItemId = (item: T) => String(item.id ?? item[searchBy]);
    
    // Check if horizontal scrolling is possible
    const checkScrollability = () => {
        if (smallerListRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = smallerListRef.current;
            const canLeft = scrollLeft > 0;
            const canRight = scrollLeft < scrollWidth - clientWidth - 5; // 5px buffer
            
            setCanScrollLeft(canLeft);
            setCanScrollRight(canRight);
            
            // Force immediate update of button visibility
            const leftBtn = smallerListRef.current.previousElementSibling;
            const rightBtn = smallerListRef.current.nextElementSibling;
            
            if (leftBtn && leftBtn.tagName === 'BUTTON') {
                leftBtn.classList.toggle('opacity-0', !canLeft);
                leftBtn.classList.toggle('pointer-events-none', !canLeft);
            }
            
            if (rightBtn && rightBtn.tagName === 'BUTTON') {
                rightBtn.classList.toggle('opacity-0', !canRight);
                rightBtn.classList.toggle('pointer-events-none', !canRight);
            }
        }
    };

    // Filter and search the list
    const filteredList = list.filter(item => {
        const matchesSearch = searchTerm.length === 0 ||
            String(item[searchBy]).toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = activeFilters.length === 0 ||
            activeFilters.includes(String(item[filterBy]));

        return matchesSearch && matchesFilter;
    });

    // Handle toggle item expansion
    const toggleItemExpansion = (itemId: string) => {
        if (expandedItems.includes(itemId)) {
            setExpandedItems(expandedItems.filter(id => id !== itemId));
        } else {
            setExpandedItems([itemId]);
        }
    };

    // Handle view details
    const handleViewDetails = (item: T) => {
        setSelectedItem(item);
        setExpanded(true);
        
        // Reset indicator when switching to expanded view
        setTimeout(() => {
            if (smallerListRef.current) {
                const buttons = smallerListRef.current.querySelectorAll('button');
                const itemId = getItemId(item);
                buttons.forEach((button) => {
                    // Match by data-item-id attribute instead of text content
                    if (button.getAttribute('data-item-id') === itemId) {
                        updateIndicator(button as HTMLButtonElement);
                    }
                });
            }
        }, 100);
    };

    // Handle close details view
    const handleCloseDetails = () => {
        setExpanded(false);
        setIndicatorStyle({
            width: 0,
            left: 0,
            height: 0,
            opacity: 0,
        });
    };

    // Handle filter change
    const handleFilterChange = (value: string) => {
        if (activeFilters.includes(value)) {
            setActiveFilters(activeFilters.filter(f => f !== value));
        } else {
            setActiveFilters([...activeFilters, value]);
        }
    };

    // Handle animations on expanded state change
    useEffect(() => {
        if (expanded) {
            // Animate to expanded state
            gsap.to(smallerListRef.current, {
                height: 'auto',
                opacity: 1,
                duration: 0.5,
                onComplete: () => {
                    // Force check scrollability after animation completes
                    checkScrollability();
                }
            });

            gsap.to(showListRef.current, {
                height: 'calc(100% - 80px)',
                duration: 0.5,
            });
            
            // Check if we can scroll during animation as well
            setTimeout(checkScrollability, 100);
            setTimeout(checkScrollability, 300);
            setTimeout(checkScrollability, 500);
        } else {
            // Animate to collapsed state
            gsap.to(smallerListRef.current, {
                height: 0,
                opacity: 0,
                duration: 0.5,
            });

            gsap.to(showListRef.current, {
                height: 'calc(100% - 60px)',
                duration: 0.5,
            });
            
            // Reset indicator when collapsing
            setIndicatorStyle({
                width: 0,
                left: 0,
                height: 0,
                opacity: 0,
            });
        }
    }, [expanded]);
    
    // Check scrollability when the filtered list changes or on window resize
    useEffect(() => {
        if (expanded) {
            setTimeout(checkScrollability, 300);
        }
        
        // Add resize event listener
        const handleResize = () => {
            if (expanded) {
                checkScrollability();
            }
        };
        
        window.addEventListener('resize', handleResize);
        
        // Clean up
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [filteredList, expanded]);
    
    // Handle initial selection separately to avoid infinite loops
    useEffect(() => {
        if (expanded && !selectedItem && filteredList.length > 0) {
            // If no item is selected yet and we're expanded, use the first one
            const firstItem = filteredList[0];
            setSelectedItem(firstItem);
            
            // Wait for buttons to render before positioning indicator
            setTimeout(() => {
                if (smallerListRef.current) {
                    const firstItemId = getItemId(firstItem);
                    const firstButton = smallerListRef.current.querySelector(`button[data-item-id="${firstItemId}"]`) as HTMLButtonElement;
                    if (firstButton) {
                        // Directly set values instead of using updateIndicator to avoid infinite loops
                        const { offsetLeft, offsetWidth } = firstButton;
                        setIndicatorStyle({
                            left: offsetLeft,
                            width: offsetWidth,
                            height: 100,
                            opacity: 1,
                        });
                        setActiveButtonElement(firstButton);
                    }
                }
            }, 50);
        }
    }, [expanded, filteredList]);

    // Update indicator when active button changes
    const updateIndicator = (button: HTMLButtonElement) => {
        if (!button) return;
        
        // Don't update if button is the same to prevent unnecessary rerenders
        if (button === activeButtonElement) return;
        
        setActiveButtonElement(button);
        const { offsetLeft, offsetWidth } = button;
        setIndicatorStyle({
            left: offsetLeft,
            width: offsetWidth,
            height: 100,
            opacity: 1,
        });
        
        // Scroll button into view
        if (smallerListRef.current) {
            // Calculate scroll position to center the button
            const scrollContainer = smallerListRef.current;
            const containerWidth = scrollContainer.clientWidth;
            const buttonCenter = offsetLeft + (offsetWidth / 2);
            const scrollCenter = scrollContainer.scrollLeft + (containerWidth / 2);
            const scrollAdjustment = buttonCenter - scrollCenter;
            
            // Apply smooth scrolling
            scrollContainer.scrollBy({
                left: scrollAdjustment,
                behavior: 'smooth'
            });
        }
    };

    // Handle button click animation
    const handleButtonClick = (item: T, e: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedItem(item);
        updateIndicator(e.currentTarget);
    };

    return (
        <div ref={wrapperRef} className="flex flex-col h-full w-full bg-background">
            {/* Top row with search and filters */}
            <div className="flex items-center gap-2 p-4 h-16 border-b">
                <div className="relative">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        className="pl-8 w-48 md:w-64"
                        placeholder={`Search by ${String(searchBy)}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* SmallerList component */}
                <div
                    className={`flex-1 relative ${expanded ? 'flex items-center overflow-hidden' : 'h-0 opacity-0'}`}
                >
                    {/* Left shadow for horizontal scroll indication */}
                    <div 
                        className={`absolute left-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none transition-opacity duration-300 ${expanded && canScrollLeft ? 'opacity-50' : 'opacity-0'}`}
                    ></div>
                    <button
                        className={`z-20 flex items-center justify-center h-full p-1 rounded-full bg-background transition-opacity duration-300 shadow-sm border ${expanded && canScrollLeft ? 'opacity-80 hover:opacity-100 hover:shadow-md hover:border-primary' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => {
                            if (smallerListRef.current) {
                                smallerListRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                                setTimeout(checkScrollability, 300);
                            }
                        }}
                        aria-hidden={!canScrollLeft}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </button>

                    <div
                        ref={smallerListRef}
                        className={`flex-1 overflow-x-auto whitespace-nowrap transition-all relative scrollbar-hide ${expanded ? 'opacity-100' : 'h-0 opacity-0'}`}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', minWidth: 0 }}
                        onScroll={checkScrollability}
                    >
                        {/* Background indicator that animates - only show if we have a valid position */}
                        {expanded && indicatorStyle.width > 0 && (
                            <div 
                                className="absolute bg-black rounded-sm shadow-md z-0 transition-all duration-300 ease-in-out"
                                style={{
                                    left: `${indicatorStyle.left}px`,
                                    width: `${indicatorStyle.width}px`,
                                    height: '100%',
                                    opacity: indicatorStyle.opacity,
                                    top: 0,
                                }}
                            />
                        )}
                        
                        {expanded && filteredList.map((item, index) => (
                            <Button
                                key={index}
                                variant={selectedItem === item ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "mr-2 cursor-pointer relative z-10",
                                    selectedItem === item ? "text-white" : "hover:text-white"
                                )}
                                onClick={(e) => handleButtonClick(item, e)}
                                data-item-id={getItemId(item)}
                            >
                                {String(item[searchBy])}
                            </Button>
                        ))}
                    </div>

                    <button
                        className={`z-20 flex items-center justify-center h-full p-1 rounded-full bg-background transition-opacity duration-300 shadow-sm border ${expanded && canScrollRight ? 'opacity-80 hover:opacity-100 hover:shadow-md hover:border-primary' : 'opacity-0 pointer-events-none'}`}
                        onClick={() => {
                            if (smallerListRef.current) {
                                smallerListRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                                setTimeout(checkScrollability, 300);
                            }
                        }}
                        aria-hidden={!canScrollRight}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>
                    
                    {/* Right shadow for horizontal scroll indication */}
                    <div 
                        className={`absolute right-0 top-0 bottom-0 w-6 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none transition-opacity duration-300 ${expanded && canScrollRight ? 'opacity-50' : 'opacity-0'}`}
                    ></div>
                </div>

                {/* FilterBy component */}
                <div className="flex items-center gap-2">
                    {filterValues.map((value) => {
                        return (
                        <CheckBoxAsButton checked={activeFilters.includes(value)} checkedChange={() => handleFilterChange(value)} text={ value==="false" ? "Custom":"System"} value={value}/>
                    )})}
                </div>
            </div>

            {/* ShowList component */}
            <div
                ref={showListRef}
                className="flex-1 p-4 overflow-y-auto transition-all"
            >
                {expanded ? (
                    <div className="relative h-full">
                        <Button
                            variant="outline"
                            size="sm"
                            className="absolute top-0 right-0"
                            onClick={handleCloseDetails}
                        >
                            Close
                        </Button>
                        {selectedItem && <ListDetailedComponent item={selectedItem} />}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredList.map((item, index) => {
                            const itemId = getItemId(item);
                            return (
                                <ToggleWrapper
                                    key={itemId}
                                    isExpanded={expandedItems.includes(itemId)}
                                    onToggle={() => toggleItemExpansion(itemId)}
                                    onViewDetails={() => handleViewDetails(item)}
                                    showLessText="Show less"
                                    showMoreText="Show more"
                                    showDetailsText="See permissions"
                                >
                                    {expandedItems.includes(itemId) ? (
                                        <DetailedComponent item={item} />
                                    ) : (
                                        <SimpleComponent item={item} />
                                    )}
                                </ToggleWrapper>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

type ToggleWrapperProps = {
    children: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    onViewDetails: () => void;
    showLessText?: string;
    showMoreText?: string;
    showDetailsText?: string;
};

function ToggleWrapper({ children, isExpanded, onToggle, onViewDetails, showLessText = "Show less", showMoreText="Show more",showDetailsText="See details" }: ToggleWrapperProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wrapperRef.current) {

            // Apply the new grid span values immediately
            wrapperRef.current.style.gridColumn = isExpanded ? "span 2" : "span 1";
            wrapperRef.current.style.gridRow = isExpanded ? "span 2" : "span 1";

            // Animate from the previous state to the new layout
            gsap.fromTo(
                wrapperRef.current.children,
                {
                    scale: isExpanded ? 0.95 : 1,
                    opacity: 0.8
                },
                {
                    scale: 1,
                    opacity: 1,
                    duration: 0.4,
                    ease: "power2.out"
                }
            );
        }
    }, [isExpanded]);

    return (
        <div
            ref={wrapperRef}
            className="relative bg-card rounded-lg shadow-sm p-4 border transition-all"
        >
            {children}

            <div className="mt-4 flex justify-end gap-2">
                <Button size="sm" variant="outline" onClick={onToggle} className="cursor-pointer">
                    {isExpanded ? showLessText : showMoreText}
                </Button>

                {isExpanded && (
                    <Button size="sm" onClick={onViewDetails} className="cursor-pointer" variant="outline">
                        {showDetailsText}
                    </Button>
                )}
            </div>
        </div>
    );
}