import React from 'react';
import { formatQuantity } from '../../../utils/formatters';

const OrderRow = ({ 
    order, 
    editingOrder, 
    editForm, 
    onEditOrder, 
    onUpdateOrder, 
    onCancelOrder, 
    onCancelEdit, 
    onFormChange,
    getStatusColor,
    getSideColor 
}) => {
    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50">
            <td className="p-3 text-sm font-mono">{order.id}</td>
            <td className="p-3 text-sm font-medium">{order.symbol}</td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSideColor(order.side)}`}>
                    {order.side}
                </span>
            </td>
            <td className="p-3 text-sm">
                {editingOrder === order.id ? (
                    <input
                        type="number"
                        value={editForm.quantity}
                        onChange={(e) => onFormChange('quantity', e.target.value)}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        step="0.00000001"
                    />
                ) : (
                    formatQuantity(order.quantity)
                )}
            </td>
            <td className="p-3 text-sm">
                {editingOrder === order.id ? (
                    <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => onFormChange('price', e.target.value)}
                        className="w-24 px-2 py-1 border rounded text-sm"
                        step="0.01"
                    />
                ) : (
                    `$${parseFloat(order.price || 0).toFixed(2)}`
                )}
            </td>
            <td className="p-3 text-sm font-medium">
                ${(parseFloat(order.quantity || 0) * parseFloat(order.price || 0)).toFixed(2)}
            </td>
            <td className="p-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
            </td>
            <td className="p-3 text-sm text-gray-600">
                {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
            </td>
            <td className="p-3">
                {editingOrder === order.id ? (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onUpdateOrder(order.id)}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                        >
                            Save
                        </button>
                        <button
                            onClick={onCancelEdit}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                    </div>
                ) : order.status === 'PENDING' ? (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEditOrder(order)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onCancelOrder(order.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">No actions</span>
                )}
            </td>
        </tr>
    );
};

export default OrderRow;
