"use client"

import * as React from "react"
import { CheckIcon, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface MultiSelectProps<T> {
  // Data
  items: T[]
  selectedItems: T[]
  onSelectionChange: (items: T[]) => void
  
  // Custom renderers
  renderSelectedItem: (item: T, onRemove: () => void) => React.ReactNode
  renderListItem: (item: T, isSelected: boolean, onToggle: () => void) => React.ReactNode
  
  // Data accessors
  getItemKey: (item: T) => string | number
  getItemLabel: (item: T) => string
  
  // Configuration
  placeholder: string
  disabled?: boolean
  maxCount?: number
  className?: string
  showSelectAll?: boolean
}

export function MultiSelect<T>({
  items,
  selectedItems,
  onSelectionChange,
  renderSelectedItem,
  renderListItem,
  getItemKey,
  getItemLabel,
  placeholder,
  disabled = false,
  maxCount = 3,
  className,
  showSelectAll = true,
}: MultiSelectProps<T>) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")

  const toggleItem = (item: T) => {
    const isSelected = selectedItems.some(selected => getItemKey(selected) === getItemKey(item))
    if (isSelected) {
      const newSelected = selectedItems.filter(selected => getItemKey(selected) !== getItemKey(item))
      onSelectionChange(newSelected)
    } else {
      onSelectionChange([...selectedItems, item])
    }
    // Keep popover open after selection
    setIsPopoverOpen(true)
  }

  const removeItem = (item: T) => {
    const newSelected = selectedItems.filter(selected => getItemKey(selected) !== getItemKey(item))
    onSelectionChange(newSelected)
  }

  const handleClear = () => {
    onSelectionChange([])
  }

  const handleTogglePopover = () => {
    setIsPopoverOpen(prev => !prev)
  }

  const clearExtraItems = () => {
    const newSelected = selectedItems.slice(0, maxCount)
    onSelectionChange(newSelected)
  }

  const toggleAll = () => {
    if (selectedItems.length === items.length) {
      handleClear()
    } else {
      onSelectionChange([...items])
    }
    setIsPopoverOpen(true)
  }

  // Filter items based on search
  const filteredItems = React.useMemo(() => {
    if (!searchValue.trim()) return items
    return items.filter(item => 
      getItemLabel(item).toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [items, searchValue, getItemLabel])

  const isItemSelected = (item: T) => {
    return selectedItems.some(selected => getItemKey(selected) === getItemKey(item))
  }

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          onClick={handleTogglePopover}
          className={cn(
            "flex w-full p-2 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
            className
          )}
          variant="outline"
          role="combobox"
          aria-expanded={isPopoverOpen}
          disabled={disabled}
        >
          {selectedItems.length > 0 ? (
            <div className="flex justify-between items-center w-full">
              <div className="flex flex-wrap items-center gap-1">
                {selectedItems.slice(0, maxCount).map((item) => (
                  <div key={getItemKey(item)}>
                    {renderSelectedItem(item, () => removeItem(item))}
                  </div>
                ))}
                {selectedItems.length > maxCount && (
                  <Badge
                    variant="secondary"
                    className="bg-muted text-muted-foreground hover:bg-muted"
                  >
                    +{selectedItems.length - maxCount} more
                    <X
                      className="ml-2 h-4 w-4 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        clearExtraItems()
                      }}
                    />
                  </Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <X
                  className="h-4 mx-2 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors"
                  onClick={(event) => {
                    event.stopPropagation()
                    handleClear()
                  }}
                />
                <Separator orientation="vertical" className="flex min-h-6 h-full" />
                <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <span className="text-sm text-muted-foreground">{placeholder}</span>
              <ChevronDown className="h-4 cursor-pointer text-muted-foreground" />
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 min-w-[200px]"
        align="start"
        onEscapeKeyDown={() => setIsPopoverOpen(false)}
      >
        <Command>
          <CommandInput 
            placeholder="Search..." 
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {showSelectAll && (
                <CommandItem 
                  onSelect={toggleAll}
                  className="cursor-pointer"
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedItems.length === items.length
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <CheckIcon className="h-4 w-4" />
                  </div>
                  <span>(Select All)</span>
                </CommandItem>
              )}
              {filteredItems.map((item) => {
                const selected = isItemSelected(item)
                return (
                  <CommandItem
                    key={getItemKey(item)}
                    onSelect={() => toggleItem(item)}
                    className="cursor-pointer"
                  >
                    {renderListItem(item, selected, () => toggleItem(item))}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
