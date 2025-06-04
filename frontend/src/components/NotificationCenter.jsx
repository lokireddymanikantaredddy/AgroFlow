import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

const NotificationCenter = ({ customerId }) => {
  const [showAll, setShowAll] = useState(false);

  const { data: notifications, isLoading } = useQuery(
    ['notifications', customerId],
    () => axios.get(`/api/notifications/customer/${customerId}`).then(res => res.data),
    {
      enabled: !!customerId,
      refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes
    }
  );

  if (isLoading) {
    return (
      <div className="animate-pulse p-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const displayNotifications = showAll ? notifications : notifications?.slice(0, 3);

  const getNotificationColor = (type) => {
    switch (type) {
      case 'overdue':
        return 'bg-red-50 border-red-400 text-red-700';
      case 'upcoming':
        return 'bg-yellow-50 border-yellow-400 text-yellow-700';
      case 'credit_warning':
        return 'bg-orange-50 border-orange-400 text-orange-700';
      default:
        return 'bg-blue-50 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
        {notifications?.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-agro-green hover:text-agro-green-dark"
          >
            {showAll ? 'Show Less' : 'View All'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayNotifications?.map((notification, index) => (
          <div
            key={index}
            className={`p-4 border-l-4 rounded-r-md ${getNotificationColor(notification.type)}`}
          >
            <div className="flex justify-between">
              <p className="font-medium">{notification.message}</p>
              {notification.amount && (
                <span className="font-medium">
                  ${notification.amount.toFixed(2)}
                </span>
              )}
            </div>
            {notification.dueDate && (
              <p className="text-sm mt-1">
                Due: {format(new Date(notification.dueDate), 'MMM d, yyyy')}
              </p>
            )}
            {notification.type === 'credit_warning' && (
              <div className="mt-2 text-sm">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span>${notification.currentBalance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Limit:</span>
                  <span>${notification.creditLimit.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>
        ))}

        {(!notifications || notifications.length === 0) && (
          <p className="text-gray-500 text-center py-4">
            No notifications at this time
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter; 