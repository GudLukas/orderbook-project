import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

const TradeOrderForm = ({ 
    formData, 
    isSubmitting, 
    message, 
    onInputChange, 
    onSubmit, 
    onFieldUpdate,
    validateForm 
}) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    📝 Place New Order
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    {/* Symbol Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Trading Pair
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <select
                            name="symbol"
                            value={formData.symbol}
                            onChange={onInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="BTCUSD">BTC/USD</option>
                            <option value="ETHUSD">ETH/USD</option>
                            <option value="ADAUSD">ADA/USD</option>
                            <option value="SOLUSD">SOL/USD</option>
                        </select>
                    </div>

                    {/* Buy/Sell Side */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Order Side
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => onFieldUpdate('side', 'BUY')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${formData.side === 'BUY'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                BUY
                            </button>
                            <button
                                type="button"
                                onClick={() => onFieldUpdate('side', 'SELL')}
                                className={`px-4 py-2 rounded-md font-medium transition-colors ${formData.side === 'SELL'
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                SELL
                            </button>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={onInputChange}
                            placeholder="0.00000000"
                            step="0.00000001"
                            min="0.00000001"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Price (USD)
                            <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={onInputChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !validateForm()}
                        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${formData.side === 'BUY'
                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            `Place ${formData.side} Order`
                        )}
                    </button>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`p-3 rounded-md border ${message.type === 'success'
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                            }`}>
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    {message.type === 'success' ? (
                                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm">
                                        <strong>{message.type === 'success' ? 'Success:' : 'Error:'}</strong> {message.text}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};

export default TradeOrderForm;
