
import { Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TradingHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const TradingHeader = ({ activeTab, setActiveTab }: TradingHeaderProps) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'signals', label: 'Trading Signals' },
    { id: 'gold-wallet', label: 'Gold Wallet' },
    { id: 'wallet', label: 'Wallet' },
  ];

  return (
    <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-blue-400">TRADIFY</h1>
          <nav className="flex space-x-6">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setActiveTab(item.id)}
                className={
                  activeTab === item.id
                    ? "text-white hover:text-blue-400 bg-gray-700"
                    : "text-gray-400 hover:text-white"
                }
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-400">James Franky</div>
            <div className="text-xs text-green-400">All Trades</div>
          </div>
          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
