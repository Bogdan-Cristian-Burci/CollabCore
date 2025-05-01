import { useRef, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { X, Check, X as XIcon } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

interface ExpandedRoleCardProps {
  roleName: string;
  permissions: string[];
  isLoading: boolean;
  onClose: () => void;
}

export default function ExpandedRoleCard({
  roleName,
  permissions,
  isLoading,
  onClose
}: ExpandedRoleCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    // Animation for backdrop
    gsap.fromTo(
      ".backdrop-overlay",
      {
        opacity: 0
      },
      {
        opacity: 1,
        duration: 0.3,
        ease: "power1.out"
      }
    );
    
    // Animation for expanding the card
    gsap.fromTo(
      cardRef.current,
      { 
        opacity: 0,
        scale: 0.98,
      },
      { 
        opacity: 1,
        scale: 1,
        duration: 0.4,
        ease: "power2.out"
      }
    );
    
    // Stagger animation for permission items
    gsap.fromTo(
      ".permission-item",
      { 
        opacity: 0,
        y: 10
      },
      { 
        opacity: 1,
        y: 0,
        stagger: 0.02,
        duration: 0.3,
        delay: 0.2,
        ease: "power2.out"
      }
    );
  }, []);
  
  // Handle the closing animation
  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose
    });
    
    // Fade out the card first
    tl.to(cardRef.current, {
      opacity: 0,
      scale: 0.98,
      duration: 0.3,
      ease: "power2.in"
    });
    
    // Then fade out the backdrop
    tl.to(".backdrop-overlay", {
      opacity: 0,
      duration: 0.2,
      ease: "power1.in"
    }, "-=0.1");
  };
  
  return (
    <>
      {/* Backdrop overlay */}
      <div className="backdrop-overlay absolute inset-0 bg-background/70 z-[5]" />
      
      <Card 
        ref={cardRef}
        className="absolute inset-0 bg-card border shadow-xl z-10 w-full h-full overflow-hidden"
      >
      <CardHeader className="flex flex-row items-center justify-between border-b p-6">
        <h3 className="text-2xl font-semibold tracking-tight">
          Permissions for {roleName}
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="ml-auto"
        >
          <X className="h-5 w-5" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-6 overflow-hidden" style={{ height: 'calc(100% - 140px)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-full pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
              {permissions.length > 0 ? (
                permissions.map((permission, index) => (
                  <div 
                    key={index} 
                    className="permission-item p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="px-3 py-1">
                        {permission}
                      </Badge>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-sm text-muted-foreground">
                      Controls access to {permission.toLowerCase().replace(/\./g, ' ')}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground col-span-full text-center py-10">
                  No permissions assigned to this role.
                </p>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      
      <CardFooter className="p-6 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
    </>
  );
}