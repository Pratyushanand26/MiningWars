import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, ArrowUp, ArrowDown, Trophy } from "lucide-react";

interface Miner {
  rank: number;
  name: string;
  address: string;
  score: number;
}

interface LeaderboardTableProps {
  miners: Miner[];
}

type SortField = 'rank' | 'name' | 'score';
type SortDirection = 'asc' | 'desc';

const LeaderboardTable = ({ miners }: LeaderboardTableProps) => {
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedMiners = [...miners].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black"><Trophy className="h-3 w-3 mr-1" />1st</Badge>;
    if (rank === 2) return <Badge className="bg-gradient-to-r from-gray-300 to-gray-500 text-black"><Trophy className="h-3 w-3 mr-1" />2nd</Badge>;
    if (rank === 3) return <Badge className="bg-gradient-to-r from-amber-600 to-amber-800 text-white"><Trophy className="h-3 w-3 mr-1" />3rd</Badge>;
    return <Badge variant="outline">#{rank}</Badge>;
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('rank')}
                className="flex items-center space-x-2 p-0 hover:bg-transparent"
              >
                <span>Rank</span>
                {getSortIcon('rank')}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="flex items-center space-x-2 p-0 hover:bg-transparent"
              >
                <span>Miner</span>
                {getSortIcon('name')}
              </Button>
            </TableHead>
            <TableHead>Wallet Address</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                onClick={() => handleSort('score')}
                className="flex items-center space-x-2 p-0 hover:bg-transparent"
              >
                <span>Score</span>
                {getSortIcon('score')}
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedMiners.map((miner) => (
            <TableRow key={miner.address} className="border-border hover:bg-accent/5">
              <TableCell>{getRankBadge(miner.rank)}</TableCell>
              <TableCell className="font-medium">{miner.name}</TableCell>
              <TableCell className="font-mono text-sm text-muted-foreground">
                {`${miner.address.slice(0, 8)}...${miner.address.slice(-6)}`}
              </TableCell>
              <TableCell className="text-right font-mono text-lg font-bold text-primary">
                {miner.score.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default LeaderboardTable;