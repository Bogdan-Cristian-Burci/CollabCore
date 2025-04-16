import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Check, X as XIcon } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ExpandedPermissionsProps {
  roleId: number;
  roleName: string;
  permissions: string[];
  isLoading: boolean;
  onClose: () => void;
}

export default function ExpandedPermissions({
  roleId,
  roleName,
  permissions,
  isLoading,
  onClose
}: ExpandedPermissionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  
  useGSAP(() => {
    // Animation for the container coming in
    gsap.fromTo(
      containerRef.current,
      { 
        opacity: 0,
        backdropFilter: "blur(0px)"
      },
      { 
        opacity: 1,
        backdropFilter: "blur(5px)",
        duration: 0.4,
        ease: "power2.out"
      }
    );
    
    // Animation for the content coming in
    gsap.fromTo(
      contentRef.current,
      { 
        opacity: 0,
        y: 20,
        scale: 0.97
      },
      { 
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: "back.out(1.4)"
      }
    );
    
    // Stagger animation for the permission items
    gsap.fromTo(
      ".permission-item",
      { 
        opacity: 0,
        y: 10
      },
      { 
        opacity: 1,
        y: 0,
        stagger: 0.03,
        duration: 0.4,
        delay: 0.2,
        ease: "power2.out"
      }
    );
  }, [permissions]); // Re-run when permissions change
  
  const handleClose = () => {
    setIsClosing(true);
    
    // Exit animations
    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
      }
    });
    
    tl.to(contentRef.current, {
      opacity: 0,
      y: 20,
      scale: 0.97,
      duration: 0.3,
      ease: "power2.in"
    });
    
    tl.to(containerRef.current, {
      opacity: 0,
      backdropFilter: "blur(0px)",
      duration: 0.3,
      ease: "power2.in"
    }, "-=0.2");
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        // Close when clicking the overlay
        if (e.target === e.currentTarget && !isClosing) {
          handleClose();
        }
      }}
    >
      <div 
        ref={contentRef}
        className="bg-card border rounded-lg shadow-lg w-full max-w-4xl overflow-hidden"
      >
        <div className="p-6 flex justify-between items-center border-b">
          <h3 className="text-2xl font-semibold">
            Permissions for {roleName}
          </h3>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose}
            className="ml-auto"
            disabled={isClosing}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-60">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {permissions.length > 0 ? (
                  permissions.map((permission, index) => (
                    <div 
                      key={index} 
                      className="permission-item p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="mb-2 px-3 py-1">
                          {permission}
                        </Badge>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-100"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                          >
                            <XIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Separator className="my-2" />
                      <p className="text-sm text-muted-foreground">
                        {/* Permission description would go here */}
                        Controls access to {permission.toLowerCase().replace(/\./g, ' ')}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2 text-center py-10">
                    No permissions assigned to this role.
                  </p>
                )}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <div className="p-6 border-t flex justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isClosing}
          >
            Cancel
          </Button>
          <Button disabled={isClosing || isLoading}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}