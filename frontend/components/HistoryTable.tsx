"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';

interface HistoryEntry {
  id: string;
  fromOwner: string;
  toOwner: string;
  timestamp: string;
  txHash: string;
  status: 'completed' | 'pending' | 'failed';
}

interface HistoryTableProps {
  history: HistoryEntry[];
}

export default function HistoryTable({ history }: HistoryTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className="glass-card border-purple-500/20">
      <CardHeader>
        <CardTitle className="text-xl text-white flex items-center">
          <Clock className="w-5 h-5 mr-2 text-purple-400" />
          Ownership History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No transfer history yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((entry, index) => (
              <div 
                key={entry.id}
                className="border border-gray-700/50 rounded-lg p-4 hover:border-purple-500/30 transition-colors duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">#{index + 1}</span>
                    <Badge className={getStatusColor(entry.status)}>
                      {entry.status}
                    </Badge>
                  </div>
                  <span className="text-xs text-gray-400">{entry.timestamp}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">From</p>
                      <code className="text-sm bg-gray-800/50 px-2 py-1 rounded text-cyan-400">
                        {formatAddress(entry.fromOwner)}
                      </code>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-purple-400" />
                    
                    <div className="text-center">
                      <p className="text-xs text-gray-400 mb-1">To</p>
                      <code className="text-sm bg-gray-800/50 px-2 py-1 rounded text-green-400">
                        {formatAddress(entry.toOwner)}
                      </code>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Tx Hash</p>
                    <code className="text-xs bg-gray-800/50 px-2 py-1 rounded text-purple-400">
                      {formatAddress(entry.txHash)}
                    </code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}