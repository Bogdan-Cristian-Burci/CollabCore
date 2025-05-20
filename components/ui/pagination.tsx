import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  perPage?: number;
  onPerPageChange?: (perPage: number) => void;
  perPageOptions?: number[];
  totalItems?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  perPage,
  onPerPageChange,
  perPageOptions = [10, 20, 50, 100],
  totalItems,
}: PaginationProps) {
  // Generate an array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    // Always show first page
    if (currentPage > 3) {
      pageNumbers.push(1);
    }
    
    // Show ellipsis if needed
    if (currentPage > 4) {
      pageNumbers.push("...");
    }
    
    // Calculate range of pages to show around current page
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Add pages around current page
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Show ellipsis if needed
    if (currentPage < totalPages - 3) {
      pageNumbers.push("...");
    }
    
    // Always show last page if there's more than one page
    if (totalPages > 1 && currentPage < totalPages - 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();
  
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        {totalItems !== undefined && (
          <div>
            Showing{" "}
            <span className="font-medium">{Math.min((currentPage - 1) * (perPage || 10) + 1, totalItems)}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * (perPage || 10), totalItems)}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </div>
        )}
        
        {perPage !== undefined && onPerPageChange && (
          <div className="flex items-center space-x-2">
            <span>Show</span>
            <Select
              value={perPage.toString()}
              onValueChange={(value) => onPerPageChange(parseInt(value))}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={perPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                {perPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span key={`ellipsis-${index}`} className="mx-1">
                ...
              </span>
            );
          }
          
          return (
            <Button
              key={`page-${page}`}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => onPageChange(page as number)}
            >
              {page}
              <span className="sr-only">Page {page}</span>
            </Button>
          );
        })}
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  );
}