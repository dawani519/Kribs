import { useLocation, useRoute } from "wouter";
import { useState, useEffect } from "react";
import { ROUTES } from "@/config/constants";
import { cn } from "@/lib/utils";

const BottomTabBar = () => {
  const [location, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(ROUTES.HOME);

  // Update active tab based on current location
  useEffect(() => {
    if (location === ROUTES.HOME) {
      setActiveTab(ROUTES.HOME);
    } else if (location.startsWith('/chat')) {
      setActiveTab(ROUTES.CHAT);
    } else if (location === ROUTES.MORE) {
      setActiveTab(ROUTES.MORE);
    }
  }, [location]);

  const handleTabClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40">
      <div className="flex justify-around items-center h-16">
        <button 
          onClick={() => handleTabClick(ROUTES.HOME)}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full",
            activeTab === ROUTES.HOME ? "text-primary" : "text-neutral-500"
          )}
        >
          <i className="fas fa-home text-lg"></i>
          <span className="text-xs mt-1">Home</span>
          {activeTab === ROUTES.HOME && (
            <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary"></span>
          )}
        </button>

        <button 
          onClick={() => handleTabClick(ROUTES.CHAT)}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full",
            activeTab === ROUTES.CHAT ? "text-primary" : "text-neutral-500"
          )}
        >
          <i className="fas fa-comment text-lg"></i>
          <span className="text-xs mt-1">Chat</span>
          {activeTab === ROUTES.CHAT && (
            <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary"></span>
          )}
        </button>

        <button 
          onClick={() => handleTabClick(ROUTES.CREATE_LISTING)}
          className="bg-primary text-white rounded-full h-12 w-12 flex items-center justify-center shadow-md -mt-6"
        >
          <i className="fas fa-plus"></i>
        </button>

        <button 
          onClick={() => handleTabClick(ROUTES.MORE)}
          className={cn(
            "flex flex-col items-center justify-center w-20 h-full",
            activeTab === ROUTES.MORE ? "text-primary" : "text-neutral-500"
          )}
        >
          <i className="fas fa-ellipsis-h text-lg"></i>
          <span className="text-xs mt-1">More</span>
          {activeTab === ROUTES.MORE && (
            <span className="absolute bottom-2 w-1 h-1 rounded-full bg-primary"></span>
          )}
        </button>
      </div>
    </div>
  );
};

export default BottomTabBar;
