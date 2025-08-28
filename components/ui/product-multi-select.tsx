"use client"

import * as React from "react"
import { CheckIcon, X, Package } from "lucide-react"
import { cn } from "@/lib/utils"
import { MultiSelect } from "./multi-select"
import { Badge } from "./badge"

// Example Product type
interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
}

// Card renderer for selected products
export function ProductCard({ 
  product, 
  onRemove,
  size = "default"
}: { 
  product: Product
  onRemove: () => void
  size?: "small" | "default"
}) {
  const isSmall = size === "small"
  
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 bg-card border rounded-lg shadow-sm z-10 transition-all duration-200 hover:scale-105",
        isSmall ? "p-2 text-xs" : "p-3 text-sm"
      )}
      onClick={(event) => {
        event.stopPropagation()
        event.preventDefault()
      }}
    >
      <Package className={cn("text-muted-foreground", isSmall ? "h-3 w-3" : "h-4 w-4")} />
      <div className="flex flex-col min-w-0">
        <span className="font-medium truncate" title={product.name}>
          {product.name}
        </span>
        <span className="text-muted-foreground">
          ${product.price} • {product.category}
        </span>
      </div>
      
      <X
        className={cn(
          "cursor-pointer bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors z-20 flex-shrink-0",
          isSmall ? "h-3 w-3 -mr-1 -mt-1" : "h-4 w-4"
        )}
        onClick={(event) => {
          event.stopPropagation()
          event.preventDefault()
          onRemove()
        }}
      />
    </div>
  )
}

// List item renderer for dropdown
export function ProductListItem({ 
  product, 
  isSelected, 
  onToggle,
  showPrice = false
}: { 
  product: Product
  isSelected: boolean
  onToggle: () => void
  showPrice?: boolean
}) {
  return (
    <>
      <div
        className={cn(
          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "opacity-50 [&_svg]:invisible"
        )}
      >
        <CheckIcon className="h-4 w-4" />
      </div>
      
      <div className="flex items-center gap-3 flex-1">
        <Package className="h-5 w-5 text-muted-foreground" />
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{product.name}</span>
            {showPrice && (
              <span className="text-sm font-bold text-green-600">
                ${product.price}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.category}
            </Badge>
            <Badge 
              variant={product.inStock ? "default" : "destructive"}
              className="text-xs"
            >
              {product.inStock ? "In Stock" : "Out of Stock"}
            </Badge>
          </div>
        </div>
      </div>
    </>
  )
}

// Pre-configured MultiSelect for products
interface ProductMultiSelectProps {
  products: Product[]
  selectedProducts: Product[]
  onSelectionChange: (products: Product[]) => void
  placeholder?: string
  disabled?: boolean
  maxCount?: number
  className?: string
  showSelectAll?: boolean
  showPrice?: boolean
  cardSize?: "small" | "default"
}

export function ProductMultiSelect({
  products,
  selectedProducts,
  onSelectionChange,
  placeholder = "Select products...",
  disabled = false,
  maxCount = 3,
  className,
  showSelectAll = true,
  showPrice = false,
  cardSize = "small",
}: ProductMultiSelectProps) {
  return (
    <MultiSelect
      items={products}
      selectedItems={selectedProducts}
      onSelectionChange={onSelectionChange}
      getItemKey={(product) => product.id}
      getItemLabel={(product) => `${product.name} ${product.category}`}
      renderSelectedItem={(product, onRemove) => (
        <ProductCard product={product} onRemove={onRemove} size={cardSize} />
      )}
      renderListItem={(product, isSelected, onToggle) => (
        <ProductListItem 
          product={product} 
          isSelected={isSelected} 
          onToggle={onToggle}
          showPrice={showPrice}
        />
      )}
      placeholder={placeholder}
      disabled={disabled}
      maxCount={maxCount}
      className={className}
      showSelectAll={showSelectAll}
    />
  )
}

// Example usage component (for documentation)
export function ProductMultiSelectExample() {
  const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([])
  
  const sampleProducts: Product[] = [
    { id: 1, name: "MacBook Pro", price: 2399, category: "Laptop", inStock: true },
    { id: 2, name: "iPhone 15", price: 999, category: "Phone", inStock: true },
    { id: 3, name: "AirPods Pro", price: 249, category: "Audio", inStock: false },
    { id: 4, name: "iPad Air", price: 599, category: "Tablet", inStock: true },
    { id: 5, name: "Apple Watch", price: 399, category: "Wearable", inStock: true },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Select Products</h3>
      <ProductMultiSelect
        products={sampleProducts}
        selectedProducts={selectedProducts}
        onSelectionChange={setSelectedProducts}
        placeholder="Choose your products..."
        maxCount={4}
        showPrice={true}
        cardSize="default"
      />
      
      {selectedProducts.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">
            Selected {selectedProducts.length} products • 
            Total: ${selectedProducts.reduce((sum, p) => sum + p.price, 0)}
          </p>
        </div>
      )}
    </div>
  )
}