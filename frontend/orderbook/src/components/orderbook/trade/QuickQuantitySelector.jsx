import React from 'react';

const QuickQuantitySelector = ({ onQuantitySelect }) => {
    const quickQuantities = [
        { label: '0.1', value: '0.1' },
        { label: '0.5', value: '0.5' },
        { label: '1.0', value: '1.0' },
        { label: '5.0', value: '5.0' }
    ];

    return (
        <div>
            <h4 className="font-medium text-gray-900 mb-3">Quick Quantity</h4>
            <div className="grid grid-cols-2 gap-2">
                {quickQuantities.map(({ label, value }) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => onQuantitySelect(value)}
                        className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickQuantitySelector;
