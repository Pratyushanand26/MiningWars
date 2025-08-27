"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ItemCard from '@/components/ItemCard';
import { Search, Filter, Plus } from 'lucide-react';
import Link from 'next/link';
import { gsap } from 'gsap';

// Mock data - TODO: Replace with blockchain data
const mockItems = [
  {
    id: '1',
    name: 'Digital Art Piece #001',
    owner: '0x1234...5678',
    createdAt: '2024-01-15',
    description: 'A unique digital artwork created by renowned artist',
    status: 'active' as const
  },
  {
    id: '2',
    name: 'Smart Contract License',
    owner: '0xabcd...efgh',
    createdAt: '2024-01-14',
    description: 'License for commercial smart contract usage',
    status: 'transferred' as const
  },
  {
    id: '3',
    name: 'NFT Collection Item',
    owner: '0x9876...5432',
    createdAt: '2024-01-13',
    description: 'Part of exclusive NFT collection series',
    status: 'pending' as const
  },
  {
    id: '4',
    name: 'Domain Name Rights',
    owner: '0xfedc...ba98',
    createdAt: '2024-01-12',
    description: 'Ownership rights for premium domain name',
    status: 'active' as const
  }
];

export default function ItemsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState(mockItems);
  const [filteredItems, setFilteredItems] = useState(mockItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading items from blockchain
    const loadItems = async () => {
      setIsLoading(true);
      // TODO: Fetch items from blockchain
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    loadItems();

    // Animate page elements
    gsap.fromTo('.items-header', 
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
    
    gsap.fromTo('.items-grid', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => {
    // Filter items based on search term
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.owner.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="items-header mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold gradient-text mb-2">Registered Items</h1>
              <p className="text-gray-300">
                Browse all registered assets on the blockchain
              </p>
            </div>
            
            <Link href="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 glow-effect">
                <Plus className="w-4 h-4 mr-2" />
                Register New Item
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name, description, or owner address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 focus:border-purple-500 text-white"
              />
            </div>
            
            <Button variant="outline" className="border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="items-grid">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="glass-card border-purple-500/20 p-6 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded mb-4"></div>
                  <div className="h-3 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'No items have been registered yet'}
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Register First Item
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ItemCard key={item.id} {...item} />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {!isLoading && filteredItems.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-700/50 text-center text-gray-400">
            <p>
              Showing {filteredItems.length} of {items.length} registered items
            </p>
          </div>
        )}
      </div>
    </div>
  );
}