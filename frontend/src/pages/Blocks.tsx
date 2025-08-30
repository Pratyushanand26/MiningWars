import { useState } from "react";
import Navbar from "@/components/Navbar";
import BlockCard from "@/components/BlockCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Hash, User, Calendar, Zap } from "lucide-react";

// Mock data for demonstration
const mockBlocks = [
  { blockId: "BLK_001", miner: "CryptoMiner_Pro", difficulty: 156, timestamp: "2024-01-15 14:32:18" },
  { blockId: "BLK_002", miner: "BlockDigger", difficulty: 142, timestamp: "2024-01-15 14:28:45" },
  { blockId: "BLK_003", miner: "HashHunter", difficulty: 139, timestamp: "2024-01-15 14:25:12" },
  { blockId: "BLK_004", miner: "MiningMachine", difficulty: 134, timestamp: "2024-01-15 14:21:33" },
  { blockId: "BLK_005", miner: "DigitalProspector", difficulty: 128, timestamp: "2024-01-15 14:18:07" },
  { blockId: "BLK_006", miner: "ChainWorker", difficulty: 125, timestamp: "2024-01-15 14:14:52" },
  { blockId: "BLK_007", miner: "CryptoCrusher", difficulty: 122, timestamp: "2024-01-15 14:11:29" },
  { blockId: "BLK_008", miner: "BlockBuster", difficulty: 119, timestamp: "2024-01-15 14:08:14" },
];

const Blocks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBlock, setSelectedBlock] = useState<typeof mockBlocks[0] | null>(null);

  const filteredBlocks = mockBlocks.filter(block =>
    block.blockId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    block.miner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBlockClick = (block: typeof mockBlocks[0]) => {
    setSelectedBlock(block);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Mined Blocks
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore all blocks submitted by miners
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by block ID or miner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-center mb-6">
          <p className="text-muted-foreground">
            Showing {filteredBlocks.length} of {mockBlocks.length} blocks
          </p>
        </div>

        {/* Horizontal Blockchain */}
        <div className="w-full overflow-x-auto pb-8">
          <div className="flex items-center space-x-0 min-w-max px-4">
            {/* Genesis Block */}
            <div className="flex-shrink-0 relative">
              <div className="w-16 h-24 bg-gradient-to-b from-primary to-primary/70 rounded-lg flex items-center justify-center border-2 border-primary">
                <span className="text-primary-foreground font-bold text-xs">Genesis</span>
              </div>
            </div>
            
            {filteredBlocks.map((block, index) => (
              <div key={block.blockId} className="flex items-center flex-shrink-0">
                {/* Connection Chain */}
                <div className="flex items-center">
                  <div className="w-8 h-1 bg-gradient-to-r from-primary to-accent"></div>
                  <div className="w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse"></div>
                  <div className="w-8 h-1 bg-gradient-to-r from-accent to-primary"></div>
                </div>
                
                {/* Block */}
                <BlockCard
                  blockId={block.blockId}
                  miner={block.miner}
                  difficulty={block.difficulty}
                  timestamp={block.timestamp}
                  onClick={() => handleBlockClick(block)}
                  isConnected={true}
                  blockNumber={index + 1}
                />
              </div>
            ))}
            
            {/* Next Block Placeholder */}
            <div className="flex items-center flex-shrink-0">
              <div className="flex items-center">
                <div className="w-8 h-1 bg-gradient-to-r from-primary/50 to-accent/50"></div>
                <div className="w-3 h-3 bg-muted rounded-full border-2 border-border"></div>
                <div className="w-8 h-1 bg-gradient-to-r from-accent/50 to-primary/50"></div>
              </div>
              <div className="w-72 h-40 border-2 border-dashed border-muted rounded-lg flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Next Block</p>
                  <p className="text-xs opacity-70">Waiting for miners...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Hint */}
        <div className="text-center text-muted-foreground mb-8">
          <p className="text-sm flex items-center justify-center space-x-2">
            <span>Scroll horizontally to explore the blockchain</span>
            <span className="text-primary">→</span>
          </p>
        </div>

        {filteredBlocks.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No blocks found matching your search.</p>
            <Button 
              variant="outline" 
              onClick={() => setSearchTerm("")}
              className="mt-4"
            >
              Clear Search
            </Button>
          </div>
        )}

        {/* Bottom Section */}
        <div className="mt-16 border-t border-border/50 pt-12">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Blockchain Stats */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Total Blocks</h3>
              <p className="text-2xl font-bold text-primary">{mockBlocks.length}</p>
              <p className="text-sm text-muted-foreground">Blocks mined so far</p>
            </div>
            
            {/* Active Miners */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Active Miners</h3>
              <p className="text-2xl font-bold text-accent">{new Set(mockBlocks.map(b => b.miner)).size}</p>
              <p className="text-sm text-muted-foreground">Unique miners competing</p>
            </div>
            
            {/* Average Difficulty */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/70 to-accent/70 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Avg Difficulty</h3>
              <p className="text-2xl font-bold text-accent">
                {Math.round(mockBlocks.reduce((sum, block) => sum + block.difficulty, 0) / mockBlocks.length)}
              </p>
              <p className="text-sm text-muted-foreground">Mining complexity</p>
            </div>
          </div>
          
          {/* Mining Process Info */}
          <div className="mt-12 text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              How Mining Wars Works
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Miners compete to solve cryptographic puzzles and submit valid blocks to the blockchain. 
              Each block contains a unique hash, difficulty level, and timestamp. The miner who submits 
              a valid block first earns points and climbs the leaderboard. Join the competition and 
              prove your mining prowess!
            </p>
          </div>
        </div>

        {/* Block Details Modal */}
        <Dialog open={!!selectedBlock} onOpenChange={() => setSelectedBlock(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Hash className="h-5 w-5 text-primary" />
                <span>Block Details</span>
              </DialogTitle>
              <DialogDescription>
                Detailed information about the selected block
              </DialogDescription>
            </DialogHeader>
            
            {selectedBlock && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Block ID</p>
                    <p className="font-mono text-sm">{selectedBlock.blockId}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Difficulty</p>
                    <Badge variant="secondary" className="font-mono">
                      <Zap className="h-3 w-3 mr-1" />
                      {selectedBlock.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Miner</p>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-mono text-sm">{selectedBlock.miner}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Timestamp</p>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm">{selectedBlock.timestamp}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setSelectedBlock(null)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Blocks;