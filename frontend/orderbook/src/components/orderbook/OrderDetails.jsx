
import { formatQuantity } from '../../utils/formatters';

const OrderDetails = ({ order, isVisible, onClose }) => {
  if (!isVisible || !order) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'filled':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSideColor = (side) => {
    return side?.toLowerCase() === 'buy'
      ? 'text-green-600 bg-green-100'
      : 'text-red-600 bg-red-100';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Order Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Order ID */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Order ID:</span>
            <span className="font-mono text-sm font-medium">#{order.id}</span>
          </div>

          {/* Symbol */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Symbol:</span>
            <span className="font-semibold text-blue-600">{order.symbol}</span>
          </div>

          {/* Side */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Side:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getSideColor(order.side)}`}>
              {order.side?.toUpperCase()}
            </span>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Price:</span>
            <span className="font-semibold text-lg">
              ${parseFloat(order.price).toFixed(2)}
            </span>
          </div>

          {/* Quantity */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Quantity:</span>
            <span className="font-semibold">
              {formatQuantity(order.quantity)} shares
            </span>
          </div>

          {/* Total Value */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Total Value:</span>
            <span className="font-semibold text-lg">
              ${(parseFloat(order.price) * parseFloat(order.quantity)).toLocaleString()}
            </span>
          </div>

          {/* Status */}
          {order.status && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status.toUpperCase()}
              </span>
            </div>
          )}

          {/* Timestamps */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Created:</span>
              <span className="text-xs text-gray-600">
                {formatDate(order.created_at)}
              </span>
            </div>

            {order.updated_at && (
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">Updated:</span>
                <span className="text-xs text-gray-600">
                  {formatDate(order.updated_at)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-200"
          >
            Close
          </button>

          {/* Action buttons based on status */}
          {order.status === 'PENDING' && (
            <button
              onClick={() => {
                // TODO: Implement cancel order functionality
                console.log('Cancel order:', order.id);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
