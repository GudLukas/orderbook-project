import React from 'react';

const QuickPriceSelector = ({ onPriceSelect }) => {
    const quickPrices = [
        { label: '$10,000', value: '10000' },
        { label: '$25,000', value: '25000' },
        { label: '$50,000', value: '50000' },
        { label: '$100,000', value: '100000' }
    ];

    return (
        <div>
            <h4 className="font-medium text-gray-900 mb-3">Quick Price (USD)</h4>
            <div className="grid grid-cols-2 gap-2">
                {quickPrices.map(({ label, value }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onPriceSelect(value)}
                        className="px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickPriceSelector;
