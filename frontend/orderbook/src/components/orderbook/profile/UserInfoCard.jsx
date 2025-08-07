import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

const UserInfoCard = ({ user, orders }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    👤 User Profile
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Account Information</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">User ID:</span>
                                <span className="font-medium">{user?.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Username:</span>
                                <span className="font-medium">{user?.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-medium">{user?.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Member Since:</span>
                                <span className="font-medium">
                                    {user?.created_at ? 
                                        new Date(user.created_at).toLocaleDateString() : 
                                        'Date not available'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Account Statistics */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Trading Statistics</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Orders:</span>
                                <span className="font-medium">{Array.isArray(orders) ? orders.length : 0}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Active Orders:</span>
                                <span className="font-medium text-yellow-600">
                                    {Array.isArray(orders) ? orders.filter(o => o.status === 'PENDING' || o.status === 'PARTIAL').length : 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Completed Orders:</span>
                                <span className="font-medium text-green-600">
                                    {Array.isArray(orders) ? orders.filter(o => o.status === 'FILLED').length : 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Volume:</span>
                                <span className="font-medium">
                                    ${Array.isArray(orders) ? orders.reduce((sum, o) => sum + (parseFloat(o.quantity || 0) * parseFloat(o.price || 0)), 0).toLocaleString() : '0'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserInfoCard;
