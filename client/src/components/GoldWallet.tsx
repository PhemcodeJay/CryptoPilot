
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const GoldWallet = () => {
  const [goldBalance] = useState(2.5);
  const [goldPrice] = useState(2034.50);
  const [amount, setAmount] = useState('');

  const goldValue = goldBalance * goldPrice;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-yellow-400">{goldBalance} oz</div>
            <div className="text-sm text-gray-400">Gold Balance</div>
            <div className="text-xs text-gray-500">Physical Gold</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-green-400">${goldPrice}</div>
            <div className="text-sm text-gray-400">Gold Price</div>
            <div className="text-xs text-gray-500">Per Ounce</div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-blue-400">${goldValue.toLocaleString()}</div>
            <div className="text-sm text-gray-400">Total Value</div>
            <div className="text-xs text-gray-500">USD Equivalent</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Gold Trading</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-700">
              <TabsTrigger value="buy" className="data-[state=active]:bg-yellow-600">Buy Gold</TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-red-600">Sell Gold</TabsTrigger>
            </TabsList>
            
            <TabsContent value="buy" className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (oz)</label>
                <Input 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="0.1"
                />
              </div>
              <div className="text-sm text-gray-400">
                Estimated Cost: ${amount ? (parseFloat(amount) * goldPrice).toFixed(2) : '0.00'}
              </div>
              <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold">
                Buy Gold
              </Button>
            </TabsContent>
            
            <TabsContent value="sell" className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (oz)</label>
                <Input 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="0.1"
                  max={goldBalance}
                />
              </div>
              <div className="text-sm text-gray-400">
                Estimated Return: ${amount ? (parseFloat(amount) * goldPrice).toFixed(2) : '0.00'}
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Sell Gold
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Gold Transaction History</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 pb-2 border-b border-gray-700">
              <div>Date</div>
              <div>Type</div>
              <div>Amount</div>
              <div>Price</div>
              <div>Total</div>
            </div>
            
            {[
              { date: '2024-01-15', type: 'Buy', amount: '1.0', price: '$2,030', total: '$2,030', color: 'text-green-400' },
              { date: '2024-01-10', type: 'Buy', amount: '1.5', price: '$2,025', total: '$3,037.50', color: 'text-green-400' },
            ].map((trade, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 text-xs py-1">
                <div className="text-gray-400">{trade.date}</div>
                <div className={trade.color}>{trade.type}</div>
                <div className="text-white">{trade.amount} oz</div>
                <div className="text-white">{trade.price}</div>
                <div className="text-white">{trade.total}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
