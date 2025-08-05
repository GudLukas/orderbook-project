import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import OrderBookContainer from './OrderBookContainer';
import TradeEntryForm from './OrderBookTradeEntryForm';
import OrderBookProfile from './OrderBookProfile';

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
          <div className="max-w-6xl mx-auto p-5 bg-white rounded-xl shadow-lg">
            <div className="flex flex-col items-center justify-center h-96 text-gray-600">
              <h3 className="text-xl font-semibold mb-2">Trade History</h3>
              <p>Trade history and recent transactions will be displayed here.</p>
            </div>
          </div>
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