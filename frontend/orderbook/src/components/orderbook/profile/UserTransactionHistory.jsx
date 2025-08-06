import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { getUserTransactions } from '../../../services/api';
import { formatQuantity } from '../../../utils/formatters';

const UserTransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadUserTransactions();
        
        // Auto-refresh every 15 seconds
        const interval = setInterval(loadUserTransactions, 15000);
        return () => clearInterval(interval);
    }, []);

    const loadUserTransactions = async () => {
        try {
            setError('');
            const transactionData = await getUserTransactions();
            setTransactions(transactionData);
        } catch (err) {
            console.error('Error loading user transactions:', err);
            setError('Failed to load your transaction history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        📈 Your Trade History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-2">Loading your transactions...</span>
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
                        📈 Your Trade History
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-red-500">
                        <p>{error}</p>
                        <button
                            onClick={loadUserTransactions}
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
                    📈 Your Trade History
                    <button
                        onClick={loadUserTransactions}
                        className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No trades yet</p>
                        <p className="text-sm">Your completed trades will appear here</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-3 font-medium text-gray-600">Time</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Symbol</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Side</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Price</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Quantity</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((transaction) => {
                                    // Use the user_side provided by the backend
                                    const side = transaction.user_side || 'UNKNOWN';
                                    const sideColor = side === 'BUY' ? 'text-green-600' : 'text-red-600';
                                    const total = parseFloat(transaction.quantity || 0) * parseFloat(transaction.price || 0);
                                    
                                    return (
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
                                            <td className={`p-3 text-sm font-medium ${sideColor}`}>
                                                {side}
                                            </td>
                                            <td className="p-3 text-sm font-medium">
                                                ${parseFloat(transaction.price || 0).toFixed(2)}
                                            </td>
                                            <td className="p-3 text-sm">
                                                {formatQuantity(transaction.quantity)}
                                            </td>
                                            <td className="p-3 text-sm font-medium">
                                                ${total.toFixed(2)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default UserTransactionHistory;
