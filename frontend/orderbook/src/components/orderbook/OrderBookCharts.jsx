import React, { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrderBookCharts = ({ groupedBids, groupedAsks, spread }) => {
  // Prepare data for depth chart (cumulative volume)
  const depthChartData = useMemo(() => {
    // Handle case where groupedBids/groupedAsks might be empty or undefined
    if (
      !groupedBids ||
      !groupedAsks ||
      (Object.keys(groupedBids).length === 0 &&
        Object.keys(groupedAsks).length === 0)
    ) {
      return [];
    }

    const bidsData = Object.entries(groupedBids || {})
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a)) // Sort bids descending
      .reduce((acc, [price, orders], index) => {
        // Ensure orders is an array
        const ordersArray = Array.isArray(orders) ? orders : [];
        const volume = ordersArray.reduce(
          (sum, order) => sum + parseFloat(order.quantity || 0),
          0
        );
        const cumulativeVolume =
          index === 0
            ? volume
            : volume + (acc[index - 1]?.cumulativeBidVolume || 0);
        acc.push({
          price: parseFloat(price),
          bidVolume: volume,
          cumulativeBidVolume: cumulativeVolume,
        });
        return acc;
      }, []);

    const asksData = Object.entries(groupedAsks || {})
      .sort(([a], [b]) => parseFloat(a) - parseFloat(b)) // Sort asks ascending
      .reduce((acc, [price, orders], index) => {
        // Ensure orders is an array
        const ordersArray = Array.isArray(orders) ? orders : [];
        const volume = ordersArray.reduce(
          (sum, order) => sum + parseFloat(order.quantity || 0),
          0
        );
        const cumulativeVolume =
          index === 0
            ? volume
            : volume + (acc[index - 1]?.cumulativeAskVolume || 0);
        acc.push({
          price: parseFloat(price),
          askVolume: volume,
          cumulativeAskVolume: cumulativeVolume,
        });
        return acc;
      }, []);

    // Combine and sort by price
    const combined = [...bidsData, ...asksData].sort(
      (a, b) => a.price - b.price
    );

    return combined.map((item) => ({
      price: item.price,
      bidDepth: item.cumulativeBidVolume || 0,
      askDepth: item.cumulativeAskVolume || 0,
      volume: item.bidVolume || item.askVolume || 0,
    }));
  }, [groupedBids, groupedAsks]);

  // Prepare data for volume distribution chart
  const volumeDistributionData = useMemo(() => {
    if (!groupedBids || !groupedAsks) {
      return [];
    }

    const bidsData = Object.entries(groupedBids || {}).map(
      ([price, orders]) => {
        const ordersArray = Array.isArray(orders) ? orders : [];
        return {
          price: parseFloat(price),
          bidVolume: ordersArray.reduce(
            (sum, order) => sum + parseFloat(order.quantity || 0),
            0
          ),
          askVolume: 0,
          type: "bid",
        };
      }
    );

    const asksData = Object.entries(groupedAsks || {}).map(
      ([price, orders]) => {
        const ordersArray = Array.isArray(orders) ? orders : [];
        return {
          price: parseFloat(price),
          bidVolume: 0,
          askVolume: ordersArray.reduce(
            (sum, order) => sum + parseFloat(order.quantity || 0),
            0
          ),
          type: "ask",
        };
      }
    );

    return [...bidsData, ...asksData].sort((a, b) => a.price - b.price);
  }, [groupedBids, groupedAsks]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{`Price: $${label?.toFixed(2)}`}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value?.toFixed(2)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Debug logging to see the data structure
  console.log("GroupedBids:", groupedBids);
  console.log("GroupedAsks:", groupedAsks);
  console.log("DepthChartData:", depthChartData);

  if (!depthChartData.length) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>📊 Order Book Charts</CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-gray-500">
            {!groupedBids && !groupedAsks
              ? "Loading chart data..."
              : "No order data to display"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Order Book Charts
          {spread && (
            <span className="text-sm font-normal text-gray-600">
              • Spread: ${spread.toFixed(2)}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Visual representation of bid/ask orders and market depth
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="depth" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="depth">Market Depth</TabsTrigger>
            <TabsTrigger value="volume">Volume Distribution</TabsTrigger>
          </TabsList>

          <TabsContent value="depth" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={depthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="price"
                    domain={["dataMin", "dataMax"]}
                    type="number"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(1)}`}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="stepAfter"
                    dataKey="bidDepth"
                    stackId="1"
                    stroke="#4CAF50"
                    fill="#4CAF50"
                    fillOpacity={0.3}
                    name="Bid Depth"
                  />
                  <Area
                    type="stepBefore"
                    dataKey="askDepth"
                    stackId="2"
                    stroke="#f44336"
                    fill="#f44336"
                    fillOpacity={0.3}
                    name="Ask Depth"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Bid Orders (Buy)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Ask Orders (Sell)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="volume" className="mt-6">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="price"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value.toFixed(1)}`}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.toFixed(0)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="bidVolume"
                    fill="#4CAF50"
                    name="Bid Volume"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="askVolume"
                    fill="#f44336"
                    name="Ask Volume"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <div className="flex gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Bid Volume</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Ask Volume</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default OrderBookCharts;
