
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketDataProps {
  selectedPair: string;
}

export const MarketData = ({ selectedPair }: MarketDataProps) => {
  const [timeframe, setTimeframe] = useState('1h');

  const timeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">All Markets</CardTitle>
          <div className="flex space-x-1">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "ghost"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className={timeframe === tf ? "bg-blue-600" : "text-gray-400 hover:text-white"}
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Bid Price</div>
            <div className="text-lg font-bold text-white">$50,985</div>
            <div className="text-xs text-gray-500">₿ 0.00000264</div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Ask Price</div>
            <div className="text-lg font-bold text-white">$50,985</div>
            <div className="text-xs text-gray-500">₿ 0.00000265</div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Last Price</div>
            <div className="text-lg font-bold text-white">₿ 0.00000266</div>
            <div className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.01%
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">24Hr Change</div>
            <div className="text-lg font-bold text-green-400">+₿ 0.015</div>
            <div className="text-xs text-green-400">+2.5%</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">24Hr Low</div>
            <div className="text-lg font-bold text-red-400">₿ 0.00000263</div>
            <div className="text-xs text-red-400 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.1%
            </div>
          </div>
          
          <div className="bg-gray-700 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">24Hr High</div>
            <div className="text-lg font-bold text-green-400">₿ 0.00000264</div>
            <div className="text-xs text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.2%
            </div>
          </div>
        </div>

        {/* Simulated Chart Area */}
        <div className="mt-6 h-64 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-gray-400">
            Chart for {selectedPair} - {timeframe} timeframe
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
