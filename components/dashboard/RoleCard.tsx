import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FileLock, FileLock2, ReceiptText, Users, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import AnimatedButton from "./AnimatedButton";

interface UserData {
  id: number;
  name: string;
}

interface RoleCardProps {
  name: string;
  description: string;
  isSystemRole: boolean;
  usersCount: number;
  users: UserData[];
  permissions: string[];
}

export default function RoleCard({ name, description, isSystemRole, usersCount, users, permissions }: RoleCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const icon = isSystemRole ? <FileLock /> : <FileLock2 />;
  
  const toggleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div className="perspective">
      <div 
        className={cn(
          "relative transition-all duration-700 preserve-3d", 
          isFlipped ? "rotate-y-180" : ""
        )}
        style={{ 
          transformStyle: "preserve-3d", 
          transition: "transform 0.8s", 
          transform: isFlipped ? "rotateY(180deg)" : ""
        }}
      >
        {/* Front side of the card */}
        <Card className="backface-hidden w-full">
          <CardHeader className="flex flex-row items-center justify-between">
            {icon}
            <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
              {name}
            </h3>
            <Badge>{isSystemRole ? 'system' : 'custom'}</Badge>
          </CardHeader>
          <CardContent>
            <p>{description}</p>
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 cursor-pointer">
                  <Users className="size-4" /> <span>{users.length}</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                <ScrollArea className="h-72">
                  {users.length > 0 && users.map((user) => (
                    <div key={user.id} className="py-2">
                      {user.name}
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </ScrollArea>
              </HoverCardContent>
            </HoverCard>
            <AnimatedButton 
              icon={ReceiptText} 
              onClick={toggleFlip} 
              variant="outline" 
              text="Permissions"
            />
          </CardFooter>
        </Card>

        {/* Back side of the card (Permissions) */}
        <Card 
          className="absolute inset-0 backface-hidden w-full rotate-y-180 overflow-hidden"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)",
            maxHeight: "calc(100vh - 4rem)",
            overflowY: "auto"
          }}
        >
          <CardHeader className="flex flex-row items-center justify-between">
            <h3 className="mt-8 scroll-m-20 text-2xl font-semibold tracking-tight">
              Permissions for {name}
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleFlip} 
              className="ml-auto"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-full max-h-[calc(100vh-15rem)]">
              {permissions.length > 0 ? (
                permissions.map((permission, index) => (
                  <div key={index} className="py-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="mr-2">
                        {permission}
                      </Badge>
                    </div>
                    <Separator className="mt-2" />
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No permissions assigned to this role.</p>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex justify-end">
            <AnimatedButton onClick={toggleFlip} text="Close" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}