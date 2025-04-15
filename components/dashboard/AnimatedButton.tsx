import { Check, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  icon?: LucideIcon;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ text, icon: Icon = Check, variant = "outline", size = "sm", className, ...props }, ref) => {
    return (
      <Button 
        ref={ref}
        variant={variant} 
        size={size}
        className={cn(
          "relative overflow-hidden transition-all duration-300 cursor-pointer border-primary",
          "before:absolute before:bottom-0 before:left-0 before:right-0 before:top-0 before:m-auto before:z-0",
          "before:h-0 before:w-0 before:bg-primary before:duration-300 before:ease-out",
          "hover:text-primary-foreground hover:border-primary",
          "hover:before:h-full hover:before:w-full",
          className
        )}
        {...props}
      >
        <span className="relative flex items-center gap-2 z-10">
          {Icon && <Icon className="size-4" />}
          <span className={cn(text ? "hidden lg:inline" : "hidden")}>{text}</span>
        </span>
      </Button>
    );
  }
);

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;