
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const Wallet = () => {
  const [balances] = useState({
    USDT: 12450.75,
    BTC: 0.25684,
    ETH: 3.7521,
    BNB: 15.8
  });

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(balances).map(([coin, balance]) => (
          <Card key={coin} className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-white">{balance}</div>
              <div className="text-sm text-gray-400">{coin}</div>
              <div className="text-xs text-gray-500">Available</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Wallet Operations</CardTitle>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-700">
              <TabsTrigger value="deposit" className="data-[state=active]:bg-green-600">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw" className="data-[state=active]:bg-red-600">Withdraw</TabsTrigger>
              <TabsTrigger value="transfer" className="data-[state=active]:bg-blue-600">Transfer</TabsTrigger>
            </TabsList>
            
            <TabsContent value="deposit" className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (USDT)</label>
                <Input 
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="100.00"
                />
              </div>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                Deposit USDT
              </Button>
            </TabsContent>
            
            <TabsContent value="withdraw" className="space-y-4 mt-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Amount (USDT)</label>
                <Input 
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="100.00"
                />
              </div>
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
                Withdraw USDT
              </Button>
            </TabsContent>
            
            <TabsContent value="transfer" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">From</label>
                  <select className="w-full bg-gray-700 border-gray-600 text-white rounded p-2">
                    <option>Spot Wallet</option>
                    <option>Futures Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">To</label>
                  <select className="w-full bg-gray-700 border-gray-600 text-white rounded p-2">
                    <option>Futures Wallet</option>
                    <option>Spot Wallet</option>
                  </select>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Transfer Funds
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Transaction History</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-5 gap-2 text-xs text-gray-400 pb-2 border-b border-gray-700">
              <div>Date</div>
              <div>Type</div>
              <div>Asset</div>
              <div>Amount</div>
              <div>Status</div>
            </div>
            
            {[
              { date: '2024-01-15', type: 'Deposit', asset: 'USDT', amount: '1000.00', status: 'Completed' },
              { date: '2024-01-14', type: 'Withdraw', asset: 'BTC', amount: '0.1', status: 'Completed' },
              { date: '2024-01-13', type: 'Transfer', asset: 'ETH', amount: '2.5', status: 'Completed' },
            ].map((tx, index) => (
              <div key={index} className="grid grid-cols-5 gap-2 text-xs py-1">
                <div className="text-gray-400">{tx.date}</div>
                <div className="text-white">{tx.type}</div>
                <div className="text-white">{tx.asset}</div>
                <div className="text-white">{tx.amount}</div>
                <div className="text-green-400">{tx.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
