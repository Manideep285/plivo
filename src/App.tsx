import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from '@/components/ui/toaster';
import Dashboard from "@/pages/Dashboard";
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import PublicStatus from '@/pages/PublicStatus';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 10 * 60 * 1000,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <main className="min-h-screen bg-background">
            <Routes>
              {/* Public Routes */}
              <Route path="/status" element={<PublicStatus />} />
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              
              {/* Protected Route */}
              <Route
                path="/dashboard"
                element={
                  <RequireAuth>
                    <Dashboard />
                  </RequireAuth>
                }
              />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
            <Toaster />
          </main>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// Protected route wrapper component
function RequireAuth({ children }: { children: JSX.Element }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
