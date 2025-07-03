
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const OrderBook = () => {
  const orders = [
    { price: '$50,696.34', size: '1.7855', total: '$90,518.32', sum: '26.57', type: 'sell' },
    { price: '$50,636.18', size: '9.8454', total: '$498,533.48', sum: '26.41', type: 'sell' },
    { price: '$50,946.16', size: '9.4126', total: '$479,535.85', sum: '29.45', type: 'sell' },
    { price: '$51,407.09', size: '3.5587', total: '$182,942.41', sum: '70.60', type: 'buy' },
    { price: '$50,625.68', size: '9.6259', total: '$487,317.73', sum: '73.82', type: 'buy' },
    { price: '$50,629.45', size: '7.8871', total: '$399,319.51', sum: '57.96', type: 'buy' },
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Order Book</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-1">
          <div className="grid grid-cols-4 gap-2 text-xs text-gray-400 pb-2 border-b border-gray-700">
            <div>Price</div>
            <div>Size (SC)</div>
            <div>Total</div>
            <div>Sum</div>
          </div>
          
          {orders.map((order, index) => (
            <div 
              key={index}
              className={`grid grid-cols-4 gap-2 text-xs py-1 ${
                order.type === 'buy' ? 'text-green-400' : 'text-red-400'
              }`}
            >
              <div>{order.price}</div>
              <div className="text-white">{order.size}</div>
              <div className="text-white">{order.total}</div>
              <div className="text-white">{order.sum}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
