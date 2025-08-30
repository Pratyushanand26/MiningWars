import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/LeaderboardTable";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Hash } from "lucide-react";

// Mock data for demonstration
const mockMiners = [
  { rank: 1, name: "CryptoMiner_Pro", address: "0x1234567890abcdef1234567890abcdef12345678", score: 15420 },
  { rank: 2, name: "BlockDigger", address: "0xabcdef1234567890abcdef1234567890abcdef12", score: 12890 },
  { rank: 3, name: "HashHunter", address: "0x9876543210fedcba9876543210fedcba98765432", score: 11750 },
  { rank: 4, name: "MiningMachine", address: "0xfedcba0987654321fedcba0987654321fedcba09", score: 9680 },
  { rank: 5, name: "DigitalProspector", address: "0x5555666677778888999900001111222233334444", score: 8920 },
  { rank: 6, name: "ChainWorker", address: "0x1111222233334444555566667777888899990000", score: 7750 },
  { rank: 7, name: "CryptoCrusher", address: "0x0000111122223333444455556666777788889999", score: 6890 },
  { rank: 8, name: "BlockBuster", address: "0xaaaaaabbbbbbccccccddddddeeeeeeffffffffff", score: 5640 },
];

const Leaderboard = () => {
  const totalMiners = mockMiners.length;
  const totalScore = mockMiners.reduce((sum, miner) => sum + miner.score, 0);
  const averageScore = Math.round(totalScore / totalMiners);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Top miners competing in the Mining Wars
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Miners</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalMiners}</div>
              <p className="text-xs text-muted-foreground">
                Active competitors
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Hash className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{totalScore.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Combined mining power
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Per miner average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <LeaderboardTable miners={mockMiners} />
      </div>
    </div>
  );
};

export default Leaderboard;