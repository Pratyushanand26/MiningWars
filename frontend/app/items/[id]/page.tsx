"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FormInput } from '@/components/FormInput';
import HistoryTable from '@/components/HistoryTable';
import { ArrowLeft, Send, User, Calendar, Hash, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { gsap } from 'gsap';

// Mock data - TODO: Replace with blockchain data
const mockItemData = {
  id: '1',
  name: 'Digital Art Piece #001',
  description: 'A unique digital artwork created by renowned artist featuring abstract geometric patterns with vibrant colors.',
  owner: '0x1234567890abcdef1234567890abcdef12345678',
  creator: '0xabcdef1234567890abcdef1234567890abcdef12',
  createdAt: '2024-01-15T10:30:00Z',
  status: 'active',
  metadata: {
    category: 'digital-art',
    creator: 'artist-name',
    edition: 1,
    totalSupply: 1
  },
  txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba'
};

const mockHistory = [
  {
    id: '1',
    fromOwner: '0xabcdef1234567890abcdef1234567890abcdef12',
    toOwner: '0x1234567890abcdef1234567890abcdef12345678',
    timestamp: '2024-01-15T10:30:00Z',
    txHash: '0x1111111111111111111111111111111111111111111111111111111111111111',
    status: 'completed' as const
  }
];

export default function ItemDetailPage() {
  const params = useParams();
  const [item, setItem] = useState(mockItemData);
  const [history, setHistory] = useState(mockHistory);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [transferError, setTransferError] = useState('');

  useEffect(() => {
    // Simulate loading item from blockchain
    const loadItem = async () => {
      setIsLoading(true);
      // TODO: Fetch item details from blockchain using params.id
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false);
    };

    loadItem();

    // Animate page elements
    gsap.fromTo('.item-detail', 
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, [params.id]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferAddress.trim()) {
      setTransferError('Recipient address is required');
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(transferAddress)) {
      setTransferError('Invalid Ethereum address format');
      return;
    }

    setIsTransferring(true);
    setTransferError('');

    try {
      // TODO: Implement blockchain transfer logic
      console.log(`Transferring item ${params.id} to ${transferAddress}`);
      
      // Simulate transfer
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update item owner
      setItem(prev => ({ ...prev, owner: transferAddress }));
      
      // Add to history
      const newHistoryEntry = {
        id: Date.now().toString(),
        fromOwner: item.owner,
        toOwner: transferAddress,
        timestamp: new Date().toISOString(),
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
        status: 'completed' as const
      };
      setHistory(prev => [newHistoryEntry, ...prev]);
      
      setTransferAddress('');
      alert('Transfer completed successfully!');
      
    } catch (error) {
      console.error('Transfer failed:', error);
      setTransferError('Transfer failed. Please try again.');
    } finally {
      setIsTransferring(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/4"></div>
            <div className="glass-card border-purple-500/20 p-6">
              <div className="h-6 bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded mb-4 w-2/3"></div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="h-20 bg-gray-700 rounded"></div>
                <div className="h-20 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/items" className="inline-flex items-center text-purple-400 hover:text-purple-300 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Items
        </Link>

        <div className="item-detail space-y-8">
          {/* Item Details */}
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl text-white mb-2">{item.name}</CardTitle>
                  <p className="text-gray-300">{item.description}</p>
                </div>
                <Badge 
                  className={`${
                    item.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                      : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                  }`}
                >
                  {item.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Current Owner</p>
                      <code className="text-sm bg-gray-800/50 px-2 py-1 rounded text-green-400 font-mono">
                        {formatAddress(item.owner)}
                      </code>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-gray-400">Creator</p>
                      <code className="text-sm bg-gray-800/50 px-2 py-1 rounded text-cyan-400 font-mono">
                        {formatAddress(item.creator)}
                      </code>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Created</p>
                      <p className="text-sm text-white">{formatDate(item.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Hash className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="text-sm text-gray-400">Transaction Hash</p>
                      <code className="text-sm bg-gray-800/50 px-2 py-1 rounded text-purple-400 font-mono">
                        {formatAddress(item.txHash)}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metadata */}
              {item.metadata && (
                <div className="border-t border-gray-700/50 pt-4">
                  <h4 className="text-lg font-semibold text-white mb-3">Metadata</h4>
                  <div className="bg-gray-800/30 p-4 rounded-lg">
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(item.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card className="glass-card border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center">
                <Send className="w-5 h-5 mr-2 text-purple-400" />
                Transfer Ownership
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <FormInput
                  id="transfer-address"
                  label="Recipient Address"
                  placeholder="0x..."
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  error={transferError}
                  helperText="Enter the Ethereum address of the new owner"
                  required
                />
                
                <Button
                  type="submit"
                  disabled={isTransferring}
                  className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 glow-effect"
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Transfer...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Transfer Ownership
                    </>
                  )}
                </Button>

                <div className="text-sm text-gray-400 bg-gray-800/30 p-3 rounded-lg border border-gray-700/50">
                  <p>⚠️ This action is irreversible and will require gas fees.</p>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* History */}
          <HistoryTable history={history} />
        </div>
      </div>
    </div>
  );
}