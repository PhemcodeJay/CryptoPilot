
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const MarketHistory = () => {
  const history = [
    { date: '12:34:56', type: 'Buy', units: '0.001', total: '$50.96', color: 'text-green-400' },
    { date: '12:33:45', type: 'Sell', units: '0.005', total: '$253.18', color: 'text-red-400' },
    { date: '12:32:12', type: 'Buy', units: '0.002', total: '$101.92', color: 'text-green-400' },
    { date: '12:31:08', type: 'Sell', units: '0.003', total: '$152.88', color: 'text-red-400' },
    { date: '12:30:45', type: 'Buy', units: '0.001', total: '$50.96', color: 'text-green-400' },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Market History</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 pb-2 border-b border-gray-700">
            <div>Date</div>
            <div>Type</div>
            <div>Units</div>
            <div>Total</div>
          </div>
          
          {history.map((trade, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 text-xs py-1">
              <div className="text-gray-400">{trade.date}</div>
              <div className={trade.color}>{trade.type}</div>
              <div className="text-white">{trade.units}</div>
              <div className="text-white">{trade.total}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
