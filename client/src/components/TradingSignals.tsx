
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TradingSignalsProps {
  selectedPair: string;
}

export const TradingSignals = ({ selectedPair }: TradingSignalsProps) => {
  const [signals, setSignals] = useState<any[]>([]);
  const [symbols, setSymbols] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(selectedPair);
  const { toast } = useToast();

  const API_BASE = 'http://localhost:5000/api';

  useEffect(() => {
    fetchSymbols();
    fetchSignal(selectedSymbol);
  }, [selectedSymbol]);

  const fetchSymbols = async () => {
    try {
      const response = await fetch(`${API_BASE}/symbols`);
      const data = await response.json();
      setSymbols(data);
    } catch (error) {
      console.error('Failed to fetch symbols:', error);
      toast({
        title: "Error",
        description: "Failed to fetch available symbols",
        variant: "destructive",
      });
    }
  };

  const fetchSignal = async (symbol: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/signal/${symbol}`);
      if (response.ok) {
        const data = await response.json();
        setSignals([data]);
      } else {
        setSignals([]);
      }
    } catch (error) {
      console.error('Failed to fetch signal:', error);
      setSignals([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshSignals = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/signals`, { method: 'GET' });
      const data = await response.json();
      setSignals(data);
      toast({
        title: "Success",
        description: `Refreshed ${data.length} signals`,
      });
    } catch (error) {
      console.error('Failed to refresh signals:', error);
      toast({
        title: "Error",
        description: "Failed to refresh signals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Trading Signals</CardTitle>
            <div className="flex items-center space-x-4">
              <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {symbols.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                onClick={refreshSignals} 
                disabled={loading}
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading signals...</div>
          ) : signals.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No signals available</div>
          ) : (
            <div className="space-y-4">
              {signals.map((signal, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">{signal.symbol}</h3>
                    <div className={`flex items-center ${
                      signal.action === 'BUY' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {signal.action === 'BUY' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                      {signal.action}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Price</div>
                      <div className="text-white font-medium">${signal.price}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Confidence</div>
                      <div className="text-white font-medium">{signal.confidence}%</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Take Profit</div>
                      <div className="text-green-400">${signal.take_profit || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Stop Loss</div>
                      <div className="text-red-400">${signal.stop_loss || 'N/A'}</div>
                    </div>
                  </div>
                  {signal.reasoning && (
                    <div className="mt-3 text-sm text-gray-300">
                      <strong>Analysis:</strong> {signal.reasoning}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
