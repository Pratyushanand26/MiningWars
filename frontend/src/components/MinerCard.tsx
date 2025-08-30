import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Trophy, Hash } from "lucide-react";

interface MinerCardProps {
  name: string;
  address: string;
  score: number;
  blocksCount: number;
  rank?: number;
}

const MinerCard = ({ name, address, score, blocksCount, rank }: MinerCardProps) => {
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  return (
    <Card className="border-border/50 hover:border-primary/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center space-x-2">
            <User className="h-5 w-5 text-primary" />
            <span>{name}</span>
          </CardTitle>
          {rank && (
            <Badge variant={rank <= 3 ? "default" : "secondary"} className="flex items-center space-x-1">
              <Trophy className="h-3 w-3" />
              <span>#{rank}</span>
            </Badge>
          )}
        </div>
        <CardDescription className="font-mono text-xs">
          {shortAddress}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="text-sm text-muted-foreground">Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent flex items-center justify-center space-x-1">
              <Hash className="h-5 w-5" />
              <span>{blocksCount}</span>
            </div>
            <div className="text-sm text-muted-foreground">Blocks</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MinerCard;