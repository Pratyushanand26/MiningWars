import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Pickaxe, Trophy, Hash, Users, Wallet, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Pickaxe className="h-20 w-20 text-primary mx-auto mb-6" />
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Mining Wars
            </h1>
            <p className="text-2xl text-muted-foreground mb-8">
              Compete to mine blocks and climb the leaderboard
            </p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join the ultimate blockchain mining competition. Register as a miner, 
              submit blocks, and compete with others to reach the top of the leaderboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link to="/register" className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Get Started</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg">
              <Link to="/leaderboard" className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>View Leaderboard</span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          How Mining Wars Works
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Register as Miner</CardTitle>
              <CardDescription>
                Sign up with your wallet and choose your miner name to join the competition
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="text-center">
              <Hash className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle>Mine Blocks</CardTitle>
              <CardDescription>
                Submit valid blocks with proof of work to earn points and climb the rankings
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/50 hover:border-primary/20 transition-colors">
            <CardHeader className="text-center">
              <Trophy className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Compete & Win</CardTitle>
              <CardDescription>
                Track your progress on the leaderboard and compete for the top spot
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/register">
                <Users className="h-6 w-6" />
                <span>Register</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/leaderboard">
                <Trophy className="h-6 w-6" />
                <span>Leaderboard</span>
              </Link>
            </Button>
            
            <Button asChild variant="outline" className="h-20 flex-col space-y-2">
              <Link to="/blocks">
                <Hash className="h-6 w-6" />
                <span>View Blocks</span>
              </Link>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Wallet className="h-6 w-6" />
              <span>Connect Wallet</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
