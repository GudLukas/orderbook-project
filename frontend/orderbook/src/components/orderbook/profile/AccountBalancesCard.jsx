import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { formatQuantity } from '../../../utils/formatters';

const AccountBalancesCard = ({ balances, balanceMessage, onRefresh }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    💰 Account Balances
                    <button
                        onClick={onRefresh}
                        className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {balanceMessage.text && (
                    <div className={`mb-4 p-3 rounded-md border ${balanceMessage.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {balanceMessage.text}
                    </div>
                )}

                {Object.keys(balances).length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No balances found</p>
                        <p className="text-sm">Your account balances will appear here</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {Object.entries(balances).map(([asset, balance]) => (
                            <div key={asset} className="bg-gray-50 p-4 rounded-lg">
                                <div className="text-sm text-gray-600 mb-1">{asset}</div>
                                <div className="font-bold text-lg">
                                    {asset === 'USD' 
                                        ? `$${balance.available.toLocaleString()}` 
                                        : formatQuantity(balance.available)
                                    }
                                </div>
                                {balance.reserved > 0 && (
                                    <div className="text-xs text-yellow-600 mt-1">
                                        Reserved: {asset === 'USD' 
                                            ? `$${balance.reserved.toLocaleString()}` 
                                            : formatQuantity(balance.reserved)
                                        }
                                    </div>
                                )}
                                <div className="text-xs text-gray-500 mt-1">
                                    Total: {asset === 'USD' 
                                        ? `$${balance.total.toLocaleString()}` 
                                        : formatQuantity(balance.total)
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AccountBalancesCard;
