import { useState } from 'react';
import { TradingHeader } from '@/components/TradingHeader';
import { TradingPanel } from '@/components/TradingPanel';
import { MarketData } from '@/components/MarketData';
import { OrderBook } from '@/components/OrderBook';
import { MarketHistory } from '@/components/MarketHistory';
import { NewsFeed } from '@/components/NewsFeed';
import { WalletOverview } from '@/components/WalletOverview';
import { TradingSignals } from '@/components/TradingSignals';
import { GoldWallet } from '@/components/GoldWallet';
import { Wallet } from '@/components/Wallet';

const Index = () => {
  const [selectedPair, setSelectedPair] = useState('BTCUSDT');
  const [orderType, setOrderType] = useState('Market');
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'signals':
        return <TradingSignals selectedPair={selectedPair} />;
      case 'gold-wallet':
        return <GoldWallet />;
      case 'wallet':
        return <Wallet />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Trading Panel */}
            <div className="lg:col-span-1">
              <TradingPanel 
                selectedPair={selectedPair}
                setSelectedPair={setSelectedPair}
                orderType={orderType}
                setOrderType={setOrderType}
              />
            </div>

            {/* Center Column - Charts and Market Data */}
            <div className="lg:col-span-2 space-y-6">
              <WalletOverview />
              <MarketData selectedPair={selectedPair} />
            </div>

            {/* Right Column - Order Book and News */}
            <div className="lg:col-span-1 space-y-6">
              <OrderBook />
              <NewsFeed />
              <MarketHistory />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
     

      {/* Header Navigation */}
      <TradingHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default Index;
