import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES } from "@/config/constants";
import { getInitials } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/config/constants";

const TopBar = () => {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: [API_ENDPOINTS.NOTIFICATIONS],
    queryFn: async () => {
      const response = await fetch(`${API_ENDPOINTS.NOTIFICATIONS}?unread=true`, {
        credentials: 'include'
      });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
  });

  const hasUnreadNotifications = notifications.length > 0;

  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
  };

  const handleNotificationsClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleLogoClick = () => {
    navigate(ROUTES.HOME);
  };

  return (
    <div className="bg-white shadow-sm sticky top-0 z-40">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={handleProfileClick} 
            className="h-9 w-9 rounded-full bg-neutral-200 flex items-center justify-center overflow-hidden"
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="text-neutral-600 font-medium text-sm">
                {user ? getInitials(`${user.firstName} ${user.lastName}`) : "?"}
              </span>
            )}
          </button>
        </div>
        
        <div className="text-center">
          <h1 
            onClick={handleLogoClick}
            className="font-bold text-lg text-primary cursor-pointer"
          >
            Kribs
          </h1>
        </div>
        
        <div className="flex items-center">
          <button 
            onClick={handleNotificationsClick} 
            className="h-9 w-9 rounded-full flex items-center justify-center relative"
          >
            <i className="fas fa-bell text-neutral-600"></i>
            {hasUnreadNotifications && (
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-secondary"></span>
            )}
          </button>

          {/* Notifications dropdown - show when showNotifications is true */}
          {showNotifications && (
            <div className="absolute top-12 right-2 w-64 bg-white rounded-lg shadow-lg z-50 py-2 max-h-80 overflow-y-auto">
              <div className="px-3 py-2 border-b border-neutral-100">
                <h3 className="font-medium">Notifications</h3>
              </div>
              
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-center text-neutral-500 text-sm">
                  No new notifications
                </div>
              ) : (
                notifications.map((notification: any) => (
                  <div key={notification.id} className="px-3 py-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-neutral-500">{notification.body}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
