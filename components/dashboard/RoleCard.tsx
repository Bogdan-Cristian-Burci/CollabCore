import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { FileLock, FileLock2, Eye, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {AnimatedButton} from "./AnimatedButton";

interface UserData {
  id: number;
  name: string;
}

interface RoleCardProps {
  name: string;
  isSystemRole: boolean;
  users: UserData[];
  onViewPermissions: () => void;
}

export default function RoleCard({
  name,
  isSystemRole, 
  users,
  onViewPermissions
}: RoleCardProps) {
  const icon = isSystemRole ? <FileLock /> : <FileLock2 />;

  return (
    <Card className="w-full h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between">
          {
              users.length > 0 ?
                  (<HoverCard>
                      <HoverCardTrigger asChild>
                          <div className="flex items-center gap-2 cursor-pointer">
                              <Users className="size-4" /> <span>{users.length}</span>
                          </div>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                          <ScrollArea className="max-h-9">
                              {users.length > 0 && users.map((user) => (
                                  <div key={user.id} className="py-2">
                                      {user.name}
                                      <Separator className="mt-2" />
                                  </div>
                              ))}
                          </ScrollArea>
                      </HoverCardContent>
                  </HoverCard>)
                  : (
                      <div className="flex items-center gap-2">
                          <Users className="size-4" /> <span>0</span>
                      </div>
                  )
          }
        <Badge>{isSystemRole ? 'system' : 'custom'}</Badge>
      </CardHeader>
      <CardContent>
          <h3 className="scroll-m-20 text-xl font-semibold tracking-tight text-center">
              {name}
          </h3>
      </CardContent>
      <CardFooter className="flex items-center justify-center">
        <AnimatedButton 
          icon={Eye}
          onClick={onViewPermissions}
          variant="outline" 
          text="View more"
        />
      </CardFooter>
    </Card>
  );
}