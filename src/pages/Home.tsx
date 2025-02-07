import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, ActivitySquare } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated');
      if (isAuthenticated === 'true') {
        navigate('/dashboard', { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle className="text-3xl">Welcome to Service Shield</CardTitle>
          <CardDescription className="text-lg">
            Your comprehensive solution for service monitoring and incident management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Service Shield helps you monitor your services, manage incidents, schedule maintenance,
            and keep your team in sync - all in one place.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Monitor Services</h3>
              <p className="text-sm text-muted-foreground">
                Keep track of your services' health and status in real-time
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Manage Incidents</h3>
              <p className="text-sm text-muted-foreground">
                Report and track incidents with detailed updates and metrics
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Schedule Maintenance</h3>
              <p className="text-sm text-muted-foreground">
                Plan and communicate maintenance windows effectively
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Work together with your team to resolve issues quickly
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button
            size="lg"
            onClick={() => navigate('/login')}
            className="w-[200px]"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/status')}
            className="w-[200px]"
          >
            <ActivitySquare className="mr-2 h-4 w-4" />
            View Status
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
