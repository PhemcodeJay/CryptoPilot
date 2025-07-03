
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const WalletOverview = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-400">$793,784,472.9</div>
          <div className="text-sm text-gray-400">Market Cap</div>
          <div className="text-xs text-gray-500">Total Market Capital</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-blue-400">$1,342,951.1</div>
          <div className="text-sm text-gray-400">Volume</div>
          <div className="text-xs text-gray-500">24h Total Volume</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-yellow-400">324 million</div>
          <div className="text-sm text-gray-400">Circ Supply</div>
          <div className="text-xs text-gray-500">Circulating Supply</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-purple-400">40 Billion</div>
          <div className="text-sm text-gray-400">Total Supply</div>
          <div className="text-xs text-gray-500">Total Supply</div>
        </CardContent>
      </Card>
    </div>
  );
};
