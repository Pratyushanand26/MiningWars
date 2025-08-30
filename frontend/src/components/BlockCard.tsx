import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Hash, User, Zap } from "lucide-react";

interface BlockCardProps {
  blockId: string;
  miner: string;
  difficulty: number;
  timestamp: string;
  onClick?: () => void;
  isConnected?: boolean;
  blockNumber?: number;
}

const BlockCard = ({ blockId, miner, difficulty, timestamp, onClick, isConnected = false, blockNumber }: BlockCardProps) => {
  return (
    <Card 
      className={`relative transition-all duration-300 cursor-pointer border-2 w-72 h-40 ${
        isConnected 
          ? 'border-primary/30 bg-gradient-to-br from-card to-card/50 hover:border-primary/50 hover:shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:scale-[1.05]' 
          : 'border-border/50 hover:border-primary/20 hover:bg-accent/5'
      }`}
      onClick={onClick}
    >
      {/* Block Number Badge */}
      {blockNumber && (
        <div className="absolute -top-3 -left-3 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg border-2 border-background z-20">
          {blockNumber}
        </div>
      )}
      
      {/* Glow effect for connected blocks */}
      {isConnected && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-lg pointer-events-none"></div>
      )}
      
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2">
            <Hash className="h-4 w-4 text-primary" />
            <span className="font-mono text-sm">{blockId}</span>
          </CardTitle>
          <Badge variant="secondary" className="font-mono text-xs bg-primary/10 text-primary border-primary/20">
            <Zap className="h-3 w-3 mr-1" />
            {difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0 relative z-10 space-y-2">
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <User className="h-3 w-3 text-accent" />
          <span className="font-mono truncate">{miner}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3 text-accent" />
          <span className="truncate">{new Date(timestamp).toLocaleDateString()}</span>
        </div>
        
        {/* Hash Preview */}
        {isConnected && (
          <div className="pt-2 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-1">Hash</p>
            <p className="font-mono text-xs text-primary/70 truncate">
              0x{Math.random().toString(16).substring(2, 18)}...
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockCard;