# Component Templates & Examples

This document provides standardized templates and examples for common component patterns in the Collab Core project.

## Table of Contents
- [Form Components](#form-components)
- [Modal/Dialog Components](#modaldialog-components)
- [List Components](#list-components)
- [Card Components](#card-components)
- [Data Tables](#data-tables)

## Form Components

### Basic Form Template

```tsx
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"

// Define validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
})

type FormData = z.infer<typeof formSchema>

interface MyFormProps {
  onSubmit?: (data: FormData) => void
  defaultValues?: Partial<FormData>
  isLoading?: boolean
}

export default function MyForm({ onSubmit, defaultValues, isLoading = false }: MyFormProps) {
  const [isSaving, setIsSaving] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      ...defaultValues,
    },
  })

  const handleSubmit = async (values: FormData) => {
    try {
      setIsSaving(true)
      
      // API call or processing logic
      await onSubmit?.(values)
      
      toast.success("Form submitted successfully!")
      form.reset()
    } catch (error) {
      toast.error("Failed to submit form")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your name" {...field} />
              </FormControl>
              <FormDescription>
                This will be displayed publicly.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
```

### DatePicker Form Field Template

```tsx
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Usage in form:
<FormField
  control={form.control}
  name="startDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Start Date</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              className={cn(
                "w-full pl-3 text-left font-normal",
                !field.value && "text-muted-foreground"
              )}
            >
              {field.value ? (
                format(field.value, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormDescription>
        Select the start date for your project.
      </FormDescription>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Modal/Dialog Components

### Drawer Template (Mobile-First)

```tsx
"use client"

import { useState } from "react"
import { PlusIcon, X } from "lucide-react"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import { AnimatedButton } from "@/components/dashboard/AnimatedButton"

interface MyDrawerProps {
  triggerText?: string
  title: string
  description: string
  children: React.ReactNode
  onSave?: () => void
  onCancel?: () => void
  isSaving?: boolean
}

export default function MyDrawer({
  triggerText = "Open",
  title,
  description,
  children,
  onSave,
  onCancel,
  isSaving = false
}: MyDrawerProps) {
  const [open, setOpen] = useState(false)

  const handleSave = () => {
    onSave?.()
    setOpen(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setOpen(false)
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <AnimatedButton
          icon={PlusIcon}
          text={triggerText}
          variant="outline"
          size="default"
        />
      </DrawerTrigger>
      
      <DrawerContent className="max-h-[90vh]">
        <div className="mx-auto w-full max-w-4xl">
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>{description}</DrawerDescription>
          </DrawerHeader>
          
          <div className="px-4 py-4 overflow-y-auto max-h-[calc(90vh-220px)]">
            {children}
          </div>

          <DrawerFooter className="px-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between gap-2">
              <DrawerClose asChild>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </DrawerClose>
              
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
```

## List Components

### Data List Template

```tsx
"use client"

import { useState } from "react"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ListItem {
  id: number
  name: string
  description?: string
  [key: string]: any
}

interface DataListProps<T extends ListItem> {
  items: T[]
  isLoading?: boolean
  searchPlaceholder?: string
  emptyMessage?: string
  renderItem: (item: T) => React.ReactNode
  onItemClick?: (item: T) => void
}

export default function DataList<T extends ListItem>({
  items,
  isLoading = false,
  searchPlaceholder = "Search items...",
  emptyMessage = "No items found.",
  renderItem,
  onItemClick
}: DataListProps<T>) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-2">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={onItemClick ? "cursor-pointer" : ""}
            >
              {renderItem(item)}
            </div>
          ))
        ) : (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">{emptyMessage}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
```

## Card Components

### Interactive Card Template

```tsx
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CardItem {
  id: number
  title: string
  description?: string
  status?: string
  [key: string]: any
}

interface InteractiveCardProps {
  item: CardItem
  onClick?: (item: CardItem) => void
  onAction?: (item: CardItem) => void
  actionText?: string
  showBadge?: boolean
  className?: string
}

export default function InteractiveCard({
  item,
  onClick,
  onAction,
  actionText = "View",
  showBadge = false,
  className
}: InteractiveCardProps) {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-1",
        className
      )}
      onClick={() => onClick?.(item)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{item.title}</CardTitle>
          {showBadge && item.status && (
            <Badge variant="secondary">
              {item.status}
            </Badge>
          )}
        </div>
        {item.description && (
          <CardDescription>{item.description}</CardDescription>
        )}
      </CardHeader>
      
      <CardContent>
        {/* Add your custom content here */}
      </CardContent>
      
      {onAction && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onAction(item)
            }}
          >
            {actionText}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
```

## Data Tables

### Basic Data Table Template

```tsx
"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search..."
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="space-y-4">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn(searchKey)?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      )}
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

## Usage Guidelines

### When to Use Each Template

1. **Form Components**: Use for all data input scenarios
2. **Drawer Template**: Use for mobile-first modals and complex forms
3. **Data List**: Use for searchable lists with custom item rendering
4. **Interactive Card**: Use for grid layouts with clickable items
5. **Data Table**: Use for tabular data with sorting and filtering

### Customization Guidelines

1. Always extend the base templates rather than creating from scratch
2. Maintain consistent prop naming conventions
3. Include proper TypeScript types for all props
4. Add loading states for async operations
5. Implement proper error handling and user feedback

### Testing Considerations

1. Test all interactive states (loading, error, success)
2. Verify accessibility with keyboard navigation
3. Test responsive behavior on different screen sizes
4. Validate form submissions and error handling