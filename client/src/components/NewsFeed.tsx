
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export const NewsFeed = () => {
  const news = [
    {
      author: 'James',
      handle: 'Jimmy@example',
      content: 'We are adding one more read function example.com/trading.asp',
      time: '3h',
      avatar: 'J'
    },
    {
      author: 'Jimmy',
      handle: 'Jimmy@example',
      content: 'We have scheduled update for BTC on 04/04/2018 example.com dev-latest',
      time: '5h',
      avatar: 'J'
    },
    {
      author: 'Frankly',
      handle: 'Frankly@example',
      content: 'Vote for your favorite coin to be added example.com/vote-coin',
      time: '7h',
      avatar: 'F'
    }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">Upcoming News</CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {news.map((item, index) => (
          <div key={index} className="flex space-x-3 p-3 bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {item.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-white font-medium">{item.author}</span>
                <span className="text-gray-400 text-sm">Posted by {item.handle}</span>
                <span className="text-gray-500 text-sm">{item.time}</span>
              </div>
              <p className="text-gray-300 text-sm">{item.content}</p>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        
        <div className="flex space-x-2 pt-2">
          <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Read All
          </Button>
          <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600">
            Dismiss All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
