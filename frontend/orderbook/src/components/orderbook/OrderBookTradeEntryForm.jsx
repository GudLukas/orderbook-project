import React from 'react';
import { useTradeEntry } from '../../hooks/useTradeEntry';
import TradeOrderForm from './trade/TradeOrderForm';
import OrderSummaryCard from './trade/OrderSummaryCard';

const TradeEntryForm = () => {
    const {
        formData,
        isSubmitting,
        message,
        balances,
        loadingBalances,
        handleInputChange,
        updateFormField,
        handleSubmit,
        validateForm,
        calculateTotal,
        validateBalanceRequirements,
        getAvailableBalance,
        getBalanceAsset
    } = useTradeEntry();

    const handleQuantitySelect = (quantity) => {
        updateFormField('quantity', quantity);
    };

    const handlePriceSelect = (price) => {
        updateFormField('price', price);
    };

    return (
        <div className="max-w-4xl mx-auto p-5">
            <div className="grid md:grid-cols-2 gap-6">
                {/* Order Entry Form */}
                <TradeOrderForm
                    formData={formData}
                    isSubmitting={isSubmitting}
                    message={message}
                    onInputChange={handleInputChange}
                    onSubmit={handleSubmit}
                    onFieldUpdate={updateFormField}
                    validateForm={() => validateForm() && validateBalanceRequirements().valid}
                />

                {/* Order Summary */}
                <OrderSummaryCard
                    formData={formData}
                    isSubmitting={isSubmitting}
                    balances={balances}
                    loadingBalances={loadingBalances}
                    calculateTotal={calculateTotal}
                    validateForm={validateForm}
                    validateBalanceRequirements={validateBalanceRequirements}
                    getAvailableBalance={getAvailableBalance}
                    getBalanceAsset={getBalanceAsset}
                    onQuantitySelect={handleQuantitySelect}
                    onPriceSelect={handlePriceSelect}
                />
            </div>
        </div>
    );
};

export default TradeEntryForm;