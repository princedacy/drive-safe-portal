import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  className?: string;
}

export function MetricCard({ title, value, change, className }: MetricCardProps) {
  const isPositive = change > 0;
  
  return (
    <Card className={`${className} bg-card border border-border/50 hover:shadow-md transition-shadow`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center text-muted-foreground">
            <span className="text-sm font-medium">{title}</span>
          </div>
          <button className="text-muted-foreground hover:text-foreground">
            <span className="text-lg">⋯</span>
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <ArrowUp className="h-4 w-4 text-green-600" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
              {Math.abs(change)}%
            </span>
          </div>
          
          <div className="text-3xl font-bold text-foreground">
            {value}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}