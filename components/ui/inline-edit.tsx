import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Edit3 } from "lucide-react";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  multiline?: boolean;
  required?: boolean;
  className?: string;
  displayClassName?: string;
  isLoading?: boolean;
  error?: string | null;
  maxLength?: number;
}

export default function InlineEdit({
  value,
  onSave,
  placeholder = "Click to edit...",
  multiline = false,
  required = false,
  className,
  displayClassName,
  isLoading = false,
  error = null,
  maxLength
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [displayWidth, setDisplayWidth] = useState(0);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const displayRef = useRef<HTMLDivElement>(null);

  // Update currentValue when value prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Measure display width for consistent sizing
  useEffect(() => {
    if (displayRef.current) {
      setDisplayWidth(displayRef.current.getBoundingClientRect().width);
    }
  }, [value, displayClassName]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    if (isLoading || isSaving) return;
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    // Validate required field
    if (required && !currentValue.trim()) {
      return; // Don't save empty required fields
    }

    // Don't save if value hasn't changed
    if (currentValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(currentValue.trim());
      setIsEditing(false);
    } catch (error) {
      // Error handling is managed by parent component
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value); // Reset to original value
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    // Auto-save on blur
    handleSave();
  };

  // Show skeleton during loading/saving
  if (isLoading || isSaving) {
    return (
      <div className={cn("space-y-1", className)}>
        <div 
          className={cn(
            "animate-pulse bg-muted rounded h-6",
            multiline && "h-12",
            displayClassName
          )}
          style={{ width: displayWidth > 0 ? `${displayWidth}px` : 'auto' }}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  if (isEditing) {
    const InputComponent = multiline ? Textarea : Input;
    
    return (
      <div className={cn("space-y-1", className)}>
        <InputComponent
          ref={inputRef as any}
          value={currentValue}
          onChange={(e) => setCurrentValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={multiline ? 3 : undefined}
          className={cn(
            "border-primary focus:border-primary",
            !multiline && "min-w-0",
            displayClassName
          )}
          style={!multiline && displayWidth > 0 ? { width: `${Math.max(displayWidth, 150)}px` } : undefined}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {maxLength && (
          <p className="text-xs text-muted-foreground text-right">
            {currentValue.length}/{maxLength}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <div
        ref={displayRef}
        onClick={handleEdit}
        className={cn(
          "group cursor-pointer rounded px-1 py-1 -mx-1 -my-1",
          "hover:bg-muted/50 transition-colors duration-200",
          "flex items-center gap-2",
          displayClassName
        )}
      >
        <span className={cn(
          "flex-1 min-w-0",
          !value && "text-muted-foreground italic"
        )}>
          {value || placeholder}
        </span>
        <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0" />
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}