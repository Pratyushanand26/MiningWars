import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Wallet, Pickaxe } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pickaxe className="h-8 w-8 text-primary" />
            <NavLink to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Mining Wars
            </NavLink>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/register" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Register
            </NavLink>
            <NavLink 
              to="/leaderboard" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Leaderboard
            </NavLink>
            <NavLink 
              to="/blocks" 
              className={({ isActive }) => 
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              Blocks
            </NavLink>
          </div>
          
          <Button variant="outline" className="flex items-center space-x-2">
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;