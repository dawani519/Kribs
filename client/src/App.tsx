import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ui/theme-provider";

// Pages
import HomePage from "./pages/home/HomePage";
import ChatPage from "./pages/chat/ChatPage";
import NotFound from "./pages/not-found";

// Services and Config
import { queryClient } from "./lib/queryClient";
import { store } from "./redux/store";
import { ROUTES } from "./config/constants";

// Protected route component
interface ProtectedRouteProps {
  component: React.ComponentType<any>;
  [x: string]: any;
}

function ProtectedRoute({ component: Component, ...rest }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  const isAuthenticated = true; // This would normally be determined by your auth service
  const isLoading = false;

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

  return <Component {...rest} />;
}

// Main layout with navigation
function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  
  // We'll implement auth checking later
  const isAuthenticated = true;
  
  // Don't show navigation on auth screens
  const isAuthScreen = [ROUTES.LOGIN, ROUTES.REGISTER, ROUTES.VERIFICATION].includes(location);
  
  if (!isAuthenticated || isAuthScreen) {
    return <>{children}</>;
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Main routes */}
      <Route path={ROUTES.HOME} component={HomePage} />
      <Route path={ROUTES.CHAT} component={ChatPage} />
      
      {/* Listing detail route with params */}
      <Route path={ROUTES.LISTING_DETAIL(":id")}>
        {(params) => <div>Listing Detail: {params.id}</div>}
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
