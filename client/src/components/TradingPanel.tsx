import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

interface TradingPanelProps {
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  orderType: string;  
  setOrderType: (type: string) => void;
}

export const TradingPanel = ({ selectedPair, setSelectedPair, orderType, setOrderType }: TradingPanelProps) => {
  const [size, setSize] = useState('100');
  const [leverage, setLeverage] = useState('1x');
  const [takeProfit, setTakeProfit] = useState('5');
  const [stopLoss, setStopLoss] = useState('2');
  const [autoTrading, setAutoTrading] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const API_BASE = 'http://localhost:5000/api';

  const executeTrade = async (action: 'buy' | 'sell') => {
    setLoading(true);
    try {
      const tradeData = {
        symbol: selectedPair,
        action: action.toUpperCase(),
        size: parseFloat(size),
        leverage: parseInt(leverage.replace('x', '')),
        take_profit: parseFloat(takeProfit),
        stop_loss: parseFloat(stopLoss),
        entry: 50985, // Mock entry price - would be current market price
        timestamp: new Date().toISOString(),
        mode: autoTrading ? 'auto' : 'manual'
      };

      const response = await fetch(`${API_BASE}/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Trade Executed",
          description: `${action.toUpperCase()} order for ${selectedPair} has been placed`,
        });
      } else {
        throw new Error('Trade failed');
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: "Trade Failed",
        description: "Failed to execute trade. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Trading Panel</CardTitle>
        <div>
          <label className="text-sm text-gray-400 mb-2 block">Select Trading Pair</label>
          <Select value={selectedPair} onValueChange={setSelectedPair}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
              <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
              <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Tabs defaultValue="buy" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-700">
            <TabsTrigger value="buy" className="data-[state=active]:bg-green-600">Buy</TabsTrigger>
            <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">Sell</TabsTrigger>
          </TabsList>
          
          <TabsContent value="buy" className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Order Type</label>
              <Select value={orderType} onValueChange={setOrderType}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="Market">Market</SelectItem>
                  <SelectItem value="Limit">Limit</SelectItem>
                  <SelectItem value="Stop">Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Size (USDT)</label>
              <div className="flex space-x-2 mb-2">
                {['25%', '50%', '75%', 'Max'].map((percent) => (
                  <Button 
                    key={percent}
                    variant="outline" 
                    size="sm" 
                    className="flex-1 bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                    onClick={() => setSize(percent === 'Max' ? '1000' : '100')}
                  >
                    {percent}
                  </Button>
                ))}
              </div>
              <Input 
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                placeholder="100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-2 block">Leverage</label>
              <Select value={leverage} onValueChange={setLeverage}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="1x">1x</SelectItem>
                  <SelectItem value="2x">2x</SelectItem>
                  <SelectItem value="5x">5x</SelectItem>
                  <SelectItem value="10x">10x</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Take Profit (%)</label>
                <Input 
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Stop Loss (%)</label>
                <Input 
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <Button 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={() => executeTrade('buy')}
              disabled={loading}
            >
              {loading ? 'Executing...' : 'Buy BTC'}
            </Button>
          </TabsContent>
          
          <TabsContent value="sell" className="space-y-4 mt-4">
            <Button 
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => executeTrade('sell')}
              disabled={loading}
            >
              {loading ? 'Executing...' : 'Sell BTC'}
            </Button>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Auto Trading</span>
            <Switch 
              checked={autoTrading}
              onCheckedChange={setAutoTrading}
            />
          </div>
          <p className="text-xs text-gray-500">
            Automated trading based on market signals
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
