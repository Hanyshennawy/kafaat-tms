import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Clock, X } from "lucide-react";
import { useLocation } from "wouter";
import { useRecentPages } from "@/hooks/useRecentPages";
import { formatDistanceToNow } from "date-fns";

export function RecentPagesDropdown() {
  const [, setLocation] = useLocation();
  const { recentPages, clearRecentPages } = useRecentPages();

  if (recentPages.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Clock className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Recent Pages</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault();
              clearRecentPages();
            }}
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {recentPages.map((page) => (
          <DropdownMenuItem 
            key={page.path + page.timestamp}
            onClick={() => setLocation(page.path)}
            className="cursor-pointer flex flex-col items-start"
          >
            <span className="font-medium">{page.label}</span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(page.timestamp, { addSuffix: true })}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
