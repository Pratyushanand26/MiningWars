"use client";

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, User, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { gsap } from 'gsap';

interface ItemCardProps {
  id: string;
  name: string;
  owner: string;
  createdAt: string;
  description?: string;
  status?: 'active' | 'transferred' | 'pending';
}

export default function ItemCard({ 
  id, 
  name, 
  owner, 
  createdAt, 
  description = "No description provided",
  status = 'active' 
}: ItemCardProps) {
  
  useEffect(() => {
    gsap.fromTo('.item-card', 
      { scale: 0.9, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'transferred': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Card className="item-card glass-card border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 hover:scale-105 hover:glow-effect">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
              {description}
            </p>
          </div>
          <Badge className={`ml-2 ${getStatusColor(status)}`}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-300">
            <User className="w-4 h-4 mr-2 text-purple-400" />
            <span className="font-medium">Owner:</span>
            <span className="ml-2 font-mono text-xs bg-gray-800/50 px-2 py-1 rounded">
              {owner.slice(0, 6)}...{owner.slice(-4)}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-300">
            <Calendar className="w-4 h-4 mr-2 text-cyan-400" />
            <span className="font-medium">Created:</span>
            <span className="ml-2">{createdAt}</span>
          </div>
          
          <div className="pt-3 border-t border-gray-700/50">
            <Link href={`/items/${id}`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full border-purple-500/50 hover:border-purple-500 hover:bg-purple-500/10 transition-all duration-200"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}