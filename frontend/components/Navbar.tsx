"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, X } from 'lucide-react';
import { gsap } from 'gsap';

export default function Navbar() {
  const [isConnected, setIsConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Animate navbar on mount
    gsap.fromTo('.navbar', 
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: 'power3.out' }
    );
  }, []);

  const handleWalletConnect = () => {
    // TODO: Implement wallet connection logic
    setIsConnected(!isConnected);
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg"></div>
            <span className="text-xl font-bold gradient-text">DecentralChain</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="/" className="text-white hover:text-purple-400 transition-colors duration-200">
                Home
              </Link>
              <Link href="/register" className="text-white hover:text-purple-400 transition-colors duration-200">
                Register
              </Link>
              <Link href="/items" className="text-white hover:text-purple-400 transition-colors duration-200">
                Items
              </Link>
            </div>
          </div>

          {/* Wallet Connect Button */}
          <div className="hidden md:block">
            <Button 
              onClick={handleWalletConnect}
              className={`${isConnected 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
              } glow-effect`}
            >
              <Wallet className="w-4 h-4 mr-2" />
              {isConnected ? 'Connected' : 'Connect Wallet'}
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-purple-400 transition-colors duration-200"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link 
                href="/" 
                className="block px-3 py-2 text-white hover:text-purple-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/register" 
                className="block px-3 py-2 text-white hover:text-purple-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </Link>
              <Link 
                href="/items" 
                className="block px-3 py-2 text-white hover:text-purple-400 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Items
              </Link>
              <Button 
                onClick={handleWalletConnect}
                className={`w-full mt-4 ${isConnected 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700'
                }`}
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnected ? 'Connected' : 'Connect Wallet'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}