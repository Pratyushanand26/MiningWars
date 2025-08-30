import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, UserPlus } from "lucide-react";
import Navbar from "@/components/Navbar";

const Register = () => {
  const [minerName, setMinerName] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!minerName.trim()) return;

    setIsLoading(true);
    // Simulate registration delay
    setTimeout(() => {
      setIsRegistered(true);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Join the Mining Wars
            </h1>
            <p className="text-muted-foreground">
              Register as a miner and start competing for blocks
            </p>
          </div>

          {!isRegistered ? (
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  <span>Register as Miner</span>
                </CardTitle>
                <CardDescription>
                  Choose your miner name to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="minerName">Miner Name</Label>
                    <Input
                      id="minerName"
                      type="text"
                      placeholder="Enter your miner name"
                      value={minerName}
                      onChange={(e) => setMinerName(e.target.value)}
                      required
                      className="transition-all focus:ring-primary/20"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    disabled={!minerName.trim() || isLoading}
                  >
                    {isLoading ? "Registering..." : "Register Miner"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Alert className="border-green-500/20 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-green-400">
                <strong>Registration Successful!</strong><br />
                Welcome, <span className="font-mono">{minerName}</span>! You're now ready to start mining blocks.
                Your wallet will need to be connected to begin participating in Mining Wars.
              </AlertDescription>
            </Alert>
          )}

          {isRegistered && (
            <div className="mt-6 space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/leaderboard'}
              >
                View Leaderboard
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = '/blocks'}
              >
                View Blocks
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;