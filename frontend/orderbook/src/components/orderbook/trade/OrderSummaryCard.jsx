import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import QuickQuantitySelector from './QuickQuantitySelector';
import QuickPriceSelector from './QuickPriceSelector';
import FormValidationStatus from './FormValidationStatus';
import { formatQuantity } from '../../../utils/formatters';

const OrderSummaryCard = ({ 
    formData, 
    isSubmitting,
    balances,
    loadingBalances,
    calculateTotal, 
    validateForm,
    validateBalanceRequirements,
    getAvailableBalance,
    getBalanceAsset,
    onQuantitySelect, 
    onPriceSelect 
}) => {
    const balanceCheck = validateBalanceRequirements();
    const availableBalance = getAvailableBalance();
    const balanceAsset = getBalanceAsset();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    📊 Order Preview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Balance Information */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-2">Available Balance</h4>
                        {loadingBalances ? (
                            <div className="text-sm text-blue-600">Loading balances...</div>
                        ) : (
                            <div className="text-sm">
                                <div className="flex justify-between items-center">
                                    <span className="text-blue-700">
                                        {balanceAsset === 'USD' ? 'USD:' : `${balanceAsset}:`}
                                    </span>
                                    <span className="font-bold text-blue-900">
                                        {balanceAsset === 'USD' 
                                            ? `$${availableBalance.toLocaleString()}` 
                                            : formatQuantity(availableBalance)
                                        }
                                    </span>
                                </div>
                                {!balanceCheck.valid && (
                                    <div className="mt-2 text-red-600 text-xs">
                                        ⚠️ {balanceCheck.message}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Order Details</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Symbol:</span>
                                <span className="font-medium">{formData.symbol}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Side:</span>
                                <span className={`font-medium ${formData.side === 'BUY' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {formData.side}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium">{formData.quantity || '0.00000000'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Price:</span>
                                <span className="font-medium">${formData.price || '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span className="font-medium text-yellow-600">PENDING</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Filled Quantity:</span>
                                <span className="font-medium">0.00000000</span>
                            </div>
                            {formData.quantity && formData.price && (
                                <>
                                    <div className="flex justify-between border-t pt-2 mt-2">
                                        <span className="text-gray-600">Total:</span>
                                        <span className="font-bold text-lg">${calculateTotal()}</span>
                                    </div>
                                    {formData.side === 'BUY' && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Will reserve from USD:</span>
                                            <span className="text-gray-700">${calculateTotal()}</span>
                                        </div>
                                    )}
                                    {formData.side === 'SELL' && (
                                        <div className="flex justify-between text-xs">
                                            <span className="text-gray-500">Will reserve from {getBalanceAsset()}:</span>
                                            <span className="text-gray-700">{formData.quantity}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quick Quantity Actions */}
                    <QuickQuantitySelector onQuantitySelect={onQuantitySelect} />

                    {/* Quick Price Actions */}
                    <QuickPriceSelector onPriceSelect={onPriceSelect} />

                    {/* Form Validation Status */}
                    <FormValidationStatus 
                        isValid={validateForm() && balanceCheck.valid} 
                        isSubmitting={isSubmitting}
                        balanceError={!balanceCheck.valid ? balanceCheck.message : null}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default OrderSummaryCard;
