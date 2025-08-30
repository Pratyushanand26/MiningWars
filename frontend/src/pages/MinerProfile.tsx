import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MinerCard from "@/components/MinerCard";
import BlockCard from "@/components/BlockCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Hash, Trophy, Calendar, TrendingUp } from "lucide-react";

// Mock data for demonstration
const mockMinerData = {
  "0x1234567890abcdef1234567890abcdef12345678": {
    name: "CryptoMiner_Pro",
    address: "0x1234567890abcdef1234567890abcdef12345678",
    score: 15420,
    rank: 1,
    joinDate: "2023-12-01",
    totalBlocks: 47,
    avgDifficulty: 142.3,
    blocks: [
      { blockId: "BLK_001", miner: "CryptoMiner_Pro", difficulty: 156, timestamp: "2024-01-15 14:32:18" },
      { blockId: "BLK_015", miner: "CryptoMiner_Pro", difficulty: 148, timestamp: "2024-01-14 16:22:45" },
      { blockId: "BLK_028", miner: "CryptoMiner_Pro", difficulty: 144, timestamp: "2024-01-13 12:18:33" },
      { blockId: "BLK_039", miner: "CryptoMiner_Pro", difficulty: 139, timestamp: "2024-01-12 09:45:21" },
      { blockId: "BLK_051", miner: "CryptoMiner_Pro", difficulty: 135, timestamp: "2024-01-11 15:33:12" },
    ]
  }
};

const MinerProfile = () => {
  const { address } = useParams<{ address: string }>();
  
  // In a real app, you'd fetch miner data by address
  const minerData = address ? mockMinerData[address as keyof typeof mockMinerData] : null;

  if (!minerData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Miner Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The miner address you're looking for doesn't exist or hasn't been registered yet.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Miner Profile
          </h1>
          <p className="text-muted-foreground">
            Detailed stats and activity for {minerData.name}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Miner Info */}
          <div className="space-y-6">
            <MinerCard
              name={minerData.name}
              address={minerData.address}
              score={minerData.score}
              blocksCount={minerData.totalBlocks}
              rank={minerData.rank}
            />

            {/* Additional Stats */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Difficulty</span>
                  <Badge variant="secondary" className="font-mono">
                    {minerData.avgDifficulty}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-mono">{minerData.joinDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Blocks</span>
                  <span className="text-lg font-bold text-primary">{minerData.totalBlocks}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Recent Blocks */}
          <div className="lg:col-span-2">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Hash className="h-5 w-5 text-primary" />
                  <span>Recent Blocks</span>
                </CardTitle>
                <CardDescription>
                  Latest blocks mined by {minerData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {minerData.blocks.map((block) => (
                    <BlockCard
                      key={block.blockId}
                      blockId={block.blockId}
                      miner={block.miner}
                      difficulty={block.difficulty}
                      timestamp={block.timestamp}
                    />
                  ))}
                </div>
                
                {minerData.blocks.length === 0 && (
                  <div className="text-center py-8">
                    <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No blocks mined yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinerProfile;