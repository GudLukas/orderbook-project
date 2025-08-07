import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import OrderRow from './OrderRow';

const OrdersManagementCard = ({ 
    orders, 
    orderMessage, 
    editingOrder, 
    editForm, 
    onRefresh, 
    onRetry,
    onEditOrder, 
    onUpdateOrder, 
    onCancelOrder, 
    onCancelEdit, 
    onFormChange,
    getStatusColor,
    getSideColor 
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    📋 My Orders
                    <button
                        onClick={onRefresh}
                        className="ml-auto px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Refresh
                    </button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                {orderMessage.text && (
                    <div className={`mb-4 p-3 rounded-md border ${orderMessage.type === 'success'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                        }`}>
                        {orderMessage.text}
                    </div>
                )}

                {!Array.isArray(orders) ? (
                    <div className="text-center py-8 text-red-500">
                        <p>Error loading orders</p>
                        <button
                            onClick={onRetry}
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Retry
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>No orders found</p>
                        <p className="text-sm">Your placed orders will appear here</p>
                    </div>
                ) : (
                    <div className="max-h-96 overflow-y-auto overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="sticky top-0 bg-white z-10">
                                <tr className="border-b border-gray-200">
                                    <th className="text-left p-3 font-medium text-gray-600">ID</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Symbol</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Side</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Quantity / Fill</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Price</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Total Value</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Status</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Date</th>
                                    <th className="text-left p-3 font-medium text-gray-600">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderRow
                                        key={order.id}
                                        order={order}
                                        editingOrder={editingOrder}
                                        editForm={editForm}
                                        onEditOrder={onEditOrder}
                                        onUpdateOrder={onUpdateOrder}
                                        onCancelOrder={onCancelOrder}
                                        onCancelEdit={onCancelEdit}
                                        onFormChange={onFormChange}
                                        getStatusColor={getStatusColor}
                                        getSideColor={getSideColor}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default OrdersManagementCard;
