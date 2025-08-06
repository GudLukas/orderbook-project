import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { getTransactions } from '../../services/api';
import { formatQuantity } from '../../utils/formatters';

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadTransactions();
        
        // Auto-refresh every 10 seconds
        const interval = setInterval(loadTransactions, 10000);
        return () => clearInterval(interval);
    }, []);

    const loadTransactions = async () => {
        try {
            setError('');
            const transactionData = await getTransactions();
            setTransactions(transactionData);
        } catch (err) {
            console.error('Error loading transactions:', err);
            setError('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🔄 Recent Trades
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading transactions...</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        🔄 Recent Trades
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={loadTransactions}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    🔄 Recent Trades
                    <button
                        onClick={loadTransactions}
                        className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No recent trades</p>
                        <p className="text-sm">Completed trades will appear here</p>
                    </div>
                ) : (
                    <>
                        <div className="max-h-96 overflow-y-auto overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="sticky top-0 bg-white z-10">
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left p-3 font-medium text-gray-600">Time</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Symbol</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Price</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Quantity</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Total</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Buyer</th>
                                        <th className="text-left p-3 font-medium text-gray-600">Seller</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-3 text-sm text-gray-600">
                                                {transaction.executed_at ? 
                                                    new Date(transaction.executed_at).toLocaleString() : 
                                                    'N/A'
                                                }
                                            </td>
                                            <td className="p-3 text-sm font-medium">
                                                {transaction.symbol}
                                            </td>
                                            <td className="p-3 text-sm font-medium text-green-600">
                                                ${parseFloat(transaction.price || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 text-sm">
                                                {formatQuantity(transaction.quantity)}
                                            </td>
                                            <td className="p-3 text-sm font-medium">
                                                ${(parseFloat(transaction.quantity || 0) * parseFloat(transaction.price || 0)).toFixed(2)}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                User #{transaction.buyer_id}
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                User #{transaction.seller_id}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {/* Summary Statistics - Always visible */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {transactions.length}
                                </div>
                                <div className="text-sm text-gray-500">Total Trades</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    ${transactions.reduce((sum, t) => {
                                        return sum + (parseFloat(t.quantity || 0) * parseFloat(t.price || 0));
                                    }, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                                <div className="text-sm text-gray-500">Total Volume</div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default TransactionHistory;
