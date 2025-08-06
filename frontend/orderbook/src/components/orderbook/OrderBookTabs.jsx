import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import OrderBookContainer from './OrderBookContainer';
import TradeEntryForm from './OrderBookTradeEntryForm';
import OrderBookProfile from './OrderBookProfile';
import TransactionHistory from './TransactionHistory';

const OrderBookTabs = () => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs defaultValue="orderbook" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="orderbook">Order Book</TabsTrigger>
          <TabsTrigger value="trades">Trade History</TabsTrigger>
          <TabsTrigger value="entry">Entry Form</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="orderbook" className="mt-6">
          <OrderBookContainer />
        </TabsContent>

        <TabsContent value="trades" className="mt-6">
          <TransactionHistory />
        </TabsContent>

        <TabsContent value="entry" className="mt-6">
          <TradeEntryForm />
        </TabsContent>

        <TabsContent value="profile" className="mt-6">
          <OrderBookProfile />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderBookTabs;