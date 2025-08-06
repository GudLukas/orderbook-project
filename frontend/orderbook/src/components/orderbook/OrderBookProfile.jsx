import React from 'react';
import { useOrderBookProfile } from '../../hooks/useOrderBookProfile';
import UserInfoCard from './profile/UserInfoCard';
import AccountBalancesCard from './profile/AccountBalancesCard';
import OrdersManagementCard from './profile/OrdersManagementCard';
import UserTransactionHistory from './profile/UserTransactionHistory';

const OrderBookProfile = () => {
    const {
        // State
        user,
        orders,
        balances,
        loading,
        editingOrder,
        editForm,
        orderMessage,
        balanceMessage,
        
        // Functions
        refreshOrders,
        refreshBalances,
        handleCancelOrder,
        handleEditOrder,
        handleUpdateOrder,
        handleCancelEdit,
        handleFormChange,
        getStatusColor,
        getSideColor
    } = useOrderBookProfile();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading profile...</span>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <UserInfoCard user={user} orders={orders} />
            
            <AccountBalancesCard 
                balances={balances}
                balanceMessage={balanceMessage}
                onRefresh={refreshBalances}
            />
            
            <OrdersManagementCard
                orders={orders}
                orderMessage={orderMessage}
                editingOrder={editingOrder}
                editForm={editForm}
                onRefresh={refreshOrders}
                onRetry={refreshOrders}
                onEditOrder={handleEditOrder}
                onUpdateOrder={handleUpdateOrder}
                onCancelOrder={handleCancelOrder}
                onCancelEdit={handleCancelEdit}
                onFormChange={handleFormChange}
                getStatusColor={getStatusColor}
                getSideColor={getSideColor}
            />

            <UserTransactionHistory />
        </div>
    );
};

export default OrderBookProfile;