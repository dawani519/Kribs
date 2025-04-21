import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useVerification } from "@/hooks/use-verification";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, USER_ROLES } from "@/config/constants";
import { formatDate, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const MoreScreen = () => {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { isVerified } = useVerification();
  const { toast } = useToast();
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="text-center">
          <p className="text-neutral-600 mb-4">Please log in to view your profile</p>
          <Button onClick={() => navigate(ROUTES.LOGIN)}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }
  
  const handleProfileClick = () => {
    navigate(ROUTES.PROFILE);
  };
  
  const handleListingsClick = () => {
    navigate(ROUTES.MY_LISTINGS);
  };
  
  const handleVerificationClick = () => {
    navigate(ROUTES.VERIFICATION);
  };
  
  const handlePaymentsClick = () => {
    navigate(ROUTES.PAYMENTS);
  };
  
  const handleSavedPropertiesClick = () => {
    toast({
      title: "Coming Soon",
      description: "Saved properties feature will be available soon.",
    });
  };
  
  const handleRecentlyViewedClick = () => {
    toast({
      title: "Coming Soon",
      description: "Recently viewed properties feature will be available soon.",
    });
  };
  
  const handleSettingsClick = () => {
    toast({
      title: "Coming Soon",
      description: "Settings feature will be available soon.",
    });
  };
  
  const handleSupportClick = () => {
    toast({
      title: "Coming Soon",
      description: "Support feature will be available soon.",
    });
  };
  
  const handleAboutClick = () => {
    toast({
      title: "About Kribs",
      description: "Kribs is a property listing platform that connects renters with landlords and real estate managers.",
    });
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate(ROUTES.LOGIN);
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const getVerificationStatus = () => {
    if (isVerified) {
      return (
        <span className="text-xs font-medium bg-success text-white px-2 py-0.5 rounded mr-2">
          Verified
        </span>
      );
    }
    return (
      <span className="text-xs font-medium bg-warning text-white px-2 py-0.5 rounded mr-2">
        Not Verified
      </span>
    );
  };
  
  const getRoleDisplay = () => {
    switch (user.role) {
      case USER_ROLES.RENTER:
        return "Renter";
      case USER_ROLES.LANDLORD:
        return "Landlord";
      case USER_ROLES.MANAGER:
        return "Property Manager";
      case USER_ROLES.ADMIN:
        return "Admin";
      default:
        return user.role;
    }
  };
  
  const joinedDate = user.createdAt 
    ? formatDate(new Date(user.createdAt))
    : "N/A";
  
  return (
    <div className="px-4 py-3 pb-20">
      <h2 className="text-xl font-semibold mb-4">Account</h2>
      
      {/* Profile Summary */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-center">
          <div className="h-16 w-16 rounded-full bg-neutral-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-neutral-600 font-medium">
                {getInitials(`${user.firstName} ${user.lastName}`)}
              </div>
            )}
          </div>
          <div className="ml-4">
            <h3 className="font-semibold text-lg">{user.firstName} {user.lastName}</h3>
            <div className="flex items-center mt-1">
              <span className="text-sm text-neutral-600">{getRoleDisplay()}</span>
              <span className="mx-2 text-neutral-300">•</span>
              <span className="flex items-center text-sm">
                {isVerified ? (
                  <>
                    <i className="fas fa-check-circle text-primary text-xs mr-1"></i>
                    Verified
                  </>
                ) : (
                  <>
                    <i className="fas fa-exclamation-circle text-warning text-xs mr-1"></i>
                    Not Verified
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex divide-x divide-neutral-200">
          <div className="flex-1 text-center">
            <p className="text-xs text-neutral-500">Status</p>
            <p className="font-medium text-neutral-800">Active</p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-neutral-500">Joined</p>
            <p className="font-medium text-neutral-800">
              {joinedDate.split(' ')[0]} {joinedDate.split(' ')[1].substring(0, 3)}
            </p>
          </div>
          <div className="flex-1 text-center">
            <p className="text-xs text-neutral-500">Saved</p>
            <p className="font-medium text-neutral-800">0</p>
          </div>
        </div>
      </div>
      
      {/* Menu Options */}
      <div className="space-y-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={handleSavedPropertiesClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-heart"></i>
              </div>
              <span className="ml-3 flex-1">Saved Properties</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
          
          <div className="border-t border-neutral-100"></div>
          
          <button 
            onClick={handleListingsClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-building"></i>
              </div>
              <span className="ml-3 flex-1">My Listings</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
          
          <div className="border-t border-neutral-100"></div>
          
          <button 
            onClick={handleRecentlyViewedClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-history"></i>
              </div>
              <span className="ml-3 flex-1">Recently Viewed</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={handlePaymentsClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-credit-card"></i>
              </div>
              <span className="ml-3 flex-1">Payments</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
          
          <div className="border-t border-neutral-100"></div>
          
          <button 
            onClick={handleVerificationClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-id-card"></i>
              </div>
              <span className="ml-3 flex-1">Verification</span>
              <div className="flex items-center">
                {getVerificationStatus()}
                <i className="fas fa-chevron-right text-neutral-400"></i>
              </div>
            </div>
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button 
            onClick={handleSettingsClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-cog"></i>
              </div>
              <span className="ml-3 flex-1">Settings</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
          
          <div className="border-t border-neutral-100"></div>
          
          <button 
            onClick={handleSupportClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-headset"></i>
              </div>
              <span className="ml-3 flex-1">Support</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
          
          <div className="border-t border-neutral-100"></div>
          
          <button 
            onClick={handleAboutClick}
            className="block w-full p-4 hover:bg-neutral-50 text-left"
          >
            <div className="flex items-center">
              <div className="w-8 text-center text-neutral-500">
                <i className="fas fa-question-circle"></i>
              </div>
              <span className="ml-3 flex-1">About Kribs</span>
              <i className="fas fa-chevron-right text-neutral-400"></i>
            </div>
          </button>
        </div>
      </div>
      
      {/* Logout */}
      <Button
        onClick={() => setShowLogoutConfirm(true)}
        variant="outline"
        className="w-full border border-neutral-300 text-neutral-700 font-medium py-3 px-4 rounded-lg mb-6"
      >
        Sign Out
      </Button>
      
      {/* Version Info */}
      <p className="text-xs text-neutral-500 text-center">Kribs v1.0.0</p>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
          </DialogHeader>
          <p className="py-4">Are you sure you want to sign out?</p>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
            >
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoreScreen;
