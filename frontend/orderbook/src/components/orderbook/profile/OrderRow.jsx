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
    const filledQuantity = parseFloat(order.filled_quantity || 0);
    const totalQuantity = parseFloat(order.quantity || 0);
    const remainingQuantity = totalQuantity - filledQuantity;
    const fillPercentage = totalQuantity > 0 ? (filledQuantity / totalQuantity) * 100 : 0;

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
                    <div className="space-y-1">
                        <input
                            type="number"
                            value={editForm.quantity}
                            onChange={(e) => onFormChange('quantity', e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                            step="0.00000001"
                            min={filledQuantity} // Can't go below filled amount
                        />
                        {filledQuantity > 0 && (
                            <div className="text-xs text-gray-500">
                                Min: {formatQuantity(filledQuantity)}
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="font-medium">{formatQuantity(order.quantity)}</div>
                        {filledQuantity > 0 && (
                            <div className="text-xs text-gray-500">
                                Filled: {formatQuantity(filledQuantity)} ({fillPercentage.toFixed(1)}%)
                            </div>
                        )}
                        {remainingQuantity > 0 && order.status === 'PARTIAL' && (
                            <div className="text-xs text-blue-600">
                                Remaining: {formatQuantity(remainingQuantity)}
                            </div>
                        )}
                    </div>
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
                <div>${(parseFloat(order.quantity || 0) * parseFloat(order.price || 0)).toFixed(2)}</div>
                {filledQuantity > 0 && (
                    <div className="text-xs text-gray-500">
                        Filled Value: ${(filledQuantity * parseFloat(order.price || 0)).toFixed(2)}
                    </div>
                )}
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
                ) : (order.status === 'PENDING' || order.status === 'PARTIAL') ? (
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEditOrder(order)}
                            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                            title={order.status === 'PARTIAL' ? 'Edit remaining quantity' : 'Edit order'}
                        >
                            Edit
                        </button>
                        <button
                            onClick={() => onCancelOrder(order.id)}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                            title={order.status === 'PARTIAL' ? 'Cancel remaining quantity' : 'Cancel order'}
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
