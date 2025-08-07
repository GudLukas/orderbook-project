import { useState, useEffect } from 'react';
import { placeOrder, getUserBalances } from '../services/api';

export const useTradeEntry = () => {
    const [formData, setFormData] = useState({
        symbol: 'BTCUSD',
        side: 'BUY',      // Match ENUM values in database
        quantity: '',
        price: ''         // Always required since status defaults to PENDING
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [balances, setBalances] = useState({});
    const [loadingBalances, setLoadingBalances] = useState(false);

    // Load user balances on mount
    useEffect(() => {
        console.log('=== TradeEntry Hook MOUNTED ===');
        const token = localStorage.getItem('authToken');
        console.log('Token on mount:', token ? 'Exists' : 'Missing');
        console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'None');
        
        loadBalances();

        return () => {
            console.log('=== TradeEntry Hook UNMOUNTED ===');
        };
    }, []);

    const loadBalances = async () => {
        try {
            setLoadingBalances(true);
            const userBalances = await getUserBalances();
            setBalances(userBalances);
        } catch (error) {
            console.error('Error loading balances:', error);
            setBalances({});
        } finally {
            setLoadingBalances(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const updateFormField = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateBalanceRequirements = () => {
        const quantity = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.price) || 0;
        
        if (quantity <= 0 || price <= 0) {
            return { valid: true, message: '' }; // Let basic validation handle this
        }

        if (formData.side === 'BUY') {
            const totalCost = quantity * price;
            const usdBalance = balances.USD?.available || 0;
            
            if (totalCost > usdBalance) {
                return {
                    valid: false,
                    message: `Insufficient USD balance. Required: $${totalCost.toFixed(2)}, Available: $${usdBalance.toFixed(2)}`
                };
            }
        } else if (formData.side === 'SELL') {
            const baseAsset = formData.symbol.replace('USD', '').replace('USDT', '');
            const assetBalance = balances[baseAsset]?.available || 0;
            
            if (quantity > assetBalance) {
                return {
                    valid: false,
                    message: `Insufficient ${baseAsset} balance. Required: ${quantity}, Available: ${assetBalance}`
                };
            }
        }

        return { valid: true, message: '' };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        // Check balance requirements before submission
        const balanceCheck = validateBalanceRequirements();
        if (!balanceCheck.valid) {
            setMessage({ type: 'error', text: balanceCheck.message });
            setIsSubmitting(false);
            return;
        }

        try {
            // Prepare order data to match your backend schema exactly
            const orderData = {
                symbol: formData.symbol.toUpperCase(),
                side: formData.side.toUpperCase(),        // BUY or SELL
                quantity: parseFloat(formData.quantity),
                price: parseFloat(formData.price)
                // status will default to 'PENDING' in backend
                // filled_quantity will default to 0.0 in backend
                // user_id will be extracted from JWT token
                // created_at and updated_at will be set by backend
            };

            console.log('Submitting order data:', orderData);

            const response = await placeOrder(orderData);

            setMessage({
                type: 'success',
                text: `Order placed successfully! Order ID: ${response.order?.id || response.id || 'N/A'}`
            });

            // Reset form on success
            setFormData({
                symbol: 'BTCUSD',
                side: 'BUY',
                quantity: '',
                price: ''
            });

            // Reload balances to reflect the reservation
            loadBalances();

        } catch (error) {
            console.error('Order submission error:', error);

            let errorMessage = 'Failed to submit order';

            if (error.response?.status === 401) {
                errorMessage = 'Authentication expired. Please log in again.';
            } else if (error.response?.status === 400) {
                errorMessage = error.response.data?.error || 'Invalid order data. Please check your inputs.';
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateForm = () => {
        return (
            formData.quantity &&
            parseFloat(formData.quantity) > 0 &&
            formData.price &&
            parseFloat(formData.price) > 0
        );
    };

    const calculateTotal = () => {
        const qty = parseFloat(formData.quantity) || 0;
        const price = parseFloat(formData.price) || 0;
        return (qty * price).toFixed(2);
    };

    const getAvailableBalance = () => {
        if (formData.side === 'BUY') {
            return balances.USD?.available || 0;
        } else {
            const baseAsset = formData.symbol.replace('USD', '').replace('USDT', '');
            return balances[baseAsset]?.available || 0;
        }
    };

    const getBalanceAsset = () => {
        if (formData.side === 'BUY') {
            return 'USD';
        } else {
            return formData.symbol.replace('USD', '').replace('USDT', '');
        }
    };

    return {
        // State
        formData,
        isSubmitting,
        message,
        balances,
        loadingBalances,

        // Functions
        handleInputChange,
        updateFormField,
        handleSubmit,
        validateForm,
        calculateTotal,
        validateBalanceRequirements,
        getAvailableBalance,
        getBalanceAsset,
        loadBalances
    };
};
