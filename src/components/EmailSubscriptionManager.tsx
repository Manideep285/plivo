import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface EmailSubscriptionManagerProps {
  serviceId: string;
  serviceName: string;
}

interface SubscriptionPreferences {
  incidents: boolean;
  maintenance: boolean;
  statusChanges: boolean;
}

export function EmailSubscriptionManager({ serviceId, serviceName }: EmailSubscriptionManagerProps) {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState<SubscriptionPreferences>({
    incidents: true,
    maintenance: true,
    statusChanges: true
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          serviceId,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      toast({
        title: "Subscription successful",
        description: "You will now receive email notifications based on your preferences.",
      });

      setEmail('');
    } catch (error) {
      toast({
        title: "Subscription failed",
        description: "There was an error subscribing to notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address to unsubscribe.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          serviceId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe');
      }

      toast({
        title: "Unsubscribed successfully",
        description: "You will no longer receive notifications for this service.",
      });

      setEmail('');
    } catch (error) {
      toast({
        title: "Unsubscribe failed",
        description: "There was an error unsubscribing from notifications. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Notifications</CardTitle>
        <CardDescription>
          Subscribe to receive notifications for {serviceName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Notification preferences</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="incidents"
                  checked={preferences.incidents}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, incidents: checked as boolean }))
                  }
                />
                <Label htmlFor="incidents">Incident updates</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="maintenance"
                  checked={preferences.maintenance}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, maintenance: checked as boolean }))
                  }
                />
                <Label htmlFor="maintenance">Maintenance notifications</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="statusChanges"
                  checked={preferences.statusChanges}
                  onCheckedChange={(checked) => 
                    setPreferences(prev => ({ ...prev, statusChanges: checked as boolean }))
                  }
                />
                <Label htmlFor="statusChanges">Status changes</Label>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleUnsubscribe}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Unsubscribe'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
