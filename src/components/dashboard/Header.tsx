
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Menu, LogOut } from "lucide-react";

interface HeaderProps {
  userLevel: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
  userEmail?: string;
  userName?: string;
}

const getInitials = (name?: string) => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

export const Header = ({ userLevel, onLogout, onToggleSidebar, userEmail, userName }: HeaderProps) => {
  // Log leve para depuração sem poluir
  console.debug("Header mounted:", { userLevel, userEmail, userName });

  return (
    <header className="bg-background border-b border-border sticky top-0 z-20">
      <div className="flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 lg:px-6 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-base font-semibold leading-tight truncate max-w-[180px] sm:max-w-[280px]">
              Sistema Prime Transportes
            </h1>
            <div className="hidden sm:block text-[11px] text-muted-foreground leading-tight">
              {userLevel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="hidden sm:flex flex-col items-end min-w-0">
            <span className="text-sm font-medium text-foreground/90 truncate max-w-[180px]">
              {userName || "Usuário"}
            </span>
            {userEmail && (
              <span className="text-xs text-muted-foreground truncate max-w-[220px]">
                {userEmail}
              </span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-9 w-9 rounded-full p-0" aria-label="Abrir menu do usuário">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="text-xs">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-0.5">
                  <div className="text-sm font-medium leading-none truncate">
                    {userName || "Usuário"}
                  </div>
                  {userEmail && (
                    <div className="text-xs text-muted-foreground leading-none truncate">
                      {userEmail}
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
