import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Pages
import Login from "@/pages/auth/Login";
import RegisterRole from "@/pages/auth/RegisterRole";
import Register from "@/pages/auth/Register";
import Verification from "@/pages/auth/Verification";
import HomeScreen from "@/pages/home/HomeScreen";
import ChatList from "@/pages/chat/ChatList";
import ListingDetail from "@/pages/listings/ListingDetail";
import CreateListing from "@/pages/listings/CreateListing";
import MoreScreen from "@/pages/more/MoreScreen";
import NotFound from "@/pages/not-found";

// Hooks
import { useAuth } from "@/hooks/use-auth";

// Components
import TopBar from "@/components/TopBar";
import BottomTabBar from "@/components/BottomTabBar";

// Services and Config
import { queryClient } from "./lib/queryClient";
import { store } from "./redux/store";
import { ROUTES } from "./config/constants";

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return isAuthenticated ? <Component {...rest} /> : null;
}

// Main layout with navigation bars
function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [location] = useLocation();
  
  // Don't show navigation on auth screens
  const isAuthScreen = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.REGISTER_ROLE, ROUTES.VERIFICATION].includes(location);
  
  if (!isAuthenticated || isAuthScreen) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-neutral-200">
      <TopBar />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path={ROUTES.LOGIN} component={Login} />
      <Route path={ROUTES.REGISTER_ROLE} component={RegisterRole} />
      <Route path={ROUTES.REGISTER} component={Register} />
      <Route path={ROUTES.VERIFICATION} component={Verification} />
      
      {/* Main routes */}
      <Route path={ROUTES.HOME}>
        <ProtectedRoute component={HomeScreen} />
      </Route>
      <Route path={ROUTES.CHAT}>
        <ProtectedRoute component={ChatList} />
      </Route>
      <Route path={ROUTES.LISTING_DETAIL.replace(':id', ':id')}>
        {(params: { id?: string }) => <ProtectedRoute component={ListingDetail} id={params.id} />}
      </Route>
      <Route path={ROUTES.CREATE_LISTING}>
        <ProtectedRoute component={CreateListing} />
      </Route>
      <Route path={ROUTES.MORE}>
        <ProtectedRoute component={MoreScreen} />
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <MainLayout>
              <Router />
            </MainLayout>
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
