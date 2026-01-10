import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Search, User, LogOut, PlusCircle, Home, Compass } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-primary blur-md opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white transform -rotate-6 group-hover:rotate-0 transition-transform duration-300">
              A
            </div>
          </div>
          <span className="font-display font-bold text-xl tracking-tighter">
            AXEL<span className="text-primary">SUB</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}
          >
            <Home className="w-4 h-4" /> Home
          </Link>
          <Link 
            href="/browse" 
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive("/browse") ? "text-primary" : "text-muted-foreground"}`}
          >
            <Compass className="w-4 h-4" /> Browse
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link href="/browse">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <Search className="w-5 h-5" />
            </Button>
          </Link>

          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/share">
                <Button size="sm" className="hidden sm:flex gap-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20">
                  <PlusCircle className="w-4 h-4" /> Share Anime
                </Button>
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/10 hover:ring-primary/50 transition-all p-0 overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {user.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card border-white/10">
                  <div className="px-2 py-1.5 text-sm font-semibold text-white">
                    {user.username}
                  </div>
                  <DropdownMenuItem className="cursor-pointer text-muted-foreground focus:text-white" onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link href="/auth">
              <Button className="font-semibold bg-white text-black hover:bg-white/90">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
