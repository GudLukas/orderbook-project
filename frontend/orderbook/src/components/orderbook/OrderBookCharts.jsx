import React, { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrderBookCharts = ({ orders = [], selectedPair = "" }) => {
  const [chartType, setChartType] = useState("depth"); // "depth" or "volume"

  // Filter orders by selected pair (coming from parent)
  const filteredOrders = selectedPair
    ? orders.filter((order) => order.symbol === selectedPair)
    : orders;

  // Create chart data based on type
  const createChartData = () => {
    // CORRECT SORTING:
    // Bids (buy orders): Sort by price DESCENDING (highest first = best bids first)
    const buyOrders = filteredOrders
      .filter((o) => o.side === "BUY")
      .sort((a, b) => Number(b.price) - Number(a.price)); // HIGHEST FIRST
    
    // Asks (sell orders): Sort by price ASCENDING (lowest first = best asks first)  
    const sellOrders = filteredOrders
      .filter((o) => o.side === "SELL")
      .sort((a, b) => Number(a.price) - Number(b.price)); // LOWEST FIRST

    if (chartType === "depth") {
      // Proper orderbook depth chart - showing price matching point
      const data = [];
      
      // Get bids and asks with proper sorting
      const bids = buyOrders.map(o => ({
        price: Number(o.price),
        quantity: Number(o.quantity)
      }));
      
      const asks = sellOrders.map(o => ({
        price: Number(o.price),
        quantity: Number(o.quantity)
      }));

      // Calculate cumulative bid depth (from highest price going down)
      let bidCumulative = 0;
      bids.forEach((bid) => {
        bidCumulative += bid.quantity;
        data.push({
          price: bid.price,
          buyDepth: bidCumulative,
          sellDepth: 0,
          side: "BUY"
        });
      });

      // Calculate cumulative ask depth (from lowest price going up)
      let askCumulative = 0;
      asks.forEach((ask) => {
        askCumulative += ask.quantity;
        data.push({
          price: ask.price,
          buyDepth: 0,
          sellDepth: askCumulative,
          side: "SELL"
        });
      });

      // Sort by price to show the meeting point clearly
      return data.sort((a, b) => a.price - b.price);
      
    } else {
      // Volume chart - individual order volumes (no overlap issue here)
      const data = [];

      buyOrders.forEach((order) => {
        data.push({
          price: Number(order.price),
          buyVolume: Number(order.quantity),
          sellVolume: 0,
        });
      });
      
      sellOrders.forEach((order) => {
        data.push({
          price: Number(order.price),
          buyVolume: 0,
          sellVolume: Number(order.quantity),
        });
      });

      return data.sort((a, b) => a.price - b.price);
    }
  };

  const chartData = createChartData();

  const renderChart = () => {
    if (chartType === "depth") {
      return (
        <AreaChart data={chartData}>
          <XAxis dataKey="price" tickFormatter={(value) => `$${value}`} />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              `${value}`,
              name === "buyDepth" ? "Cumulative Buy Depth" : "Cumulative Sell Depth",
            ]}
          />
          <Area 
            dataKey="buyDepth" 
            fill="#22c55e" 
            stroke="#16a34a"
            fillOpacity={0.6}
          />
          <Area 
            dataKey="sellDepth" 
            fill="#ef4444" 
            stroke="#dc2626"
            fillOpacity={0.6}
          />
        </AreaChart>
      );
    } else {
      return (
        <BarChart data={chartData}>
          <XAxis dataKey="price" tickFormatter={(value) => `$${value}`} />
          <YAxis />
          <Tooltip formatter={(value, name) => [`${value}`, name]} />
          <Bar dataKey="buyVolume" fill="#22c55e" name="Buy Volume" />
          <Bar dataKey="sellVolume" fill="#ef4444" name="Sell Volume" />
        </BarChart>
      );
    }
  };

  if (!orders.length) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📊 Order Book Chart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-gray-500">
            No orders available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>
            📊 Order Book Chart
            {selectedPair && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                - {selectedPair}
              </span>
            )}
          </CardTitle>

          {/* Chart Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setChartType("depth")}
              className={`px-3 py-1 text-sm rounded ${
                chartType === "depth"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Depth
            </button>
            <button
              onClick={() => setChartType("volume")}
              className={`px-3 py-1 text-sm rounded ${
                chartType === "volume"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>{chartType === "depth" ? "Buy Depth" : "Buy Volume"}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>{chartType === "depth" ? "Sell Depth" : "Sell Volume"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderBookCharts;
