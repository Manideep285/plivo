import { ServiceCard } from "@/components/ServiceCard";
import { Service, Incident, Maintenance } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsGraph } from "@/components/MetricsGraph"; 
import { useState, useEffect } from "react";

const PublicStatus = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [activeTab, setActiveTab] = useState("current");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Replace these with your public API endpoints
        const [servicesRes, incidentsRes, maintenancesRes] = await Promise.all([
          fetch('/api/public/services'),
          fetch('/api/public/incidents'),
          fetch('/api/public/maintenances')
        ]);

        const [servicesData, incidentsData, maintenancesData] = await Promise.all([
          servicesRes.json(),
          incidentsRes.json(),
          maintenancesRes.json()
        ]);

        setServices(servicesData);
        setIncidents(incidentsData);
        setMaintenances(maintenancesData);
      } catch (error) {
        console.error('Error fetching status data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Setup WebSocket connection for real-time metrics
  useEffect(() => {
    const ws = new WebSocket('wss://your-public-websocket-server.com');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "METRICS_UPDATE") {
        setMetrics(prev => [...prev.slice(-50), {
          timestamp: new Date().toISOString(),
          ...data.metrics
        }]);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  const activeIncidents = incidents?.filter(i => i.status !== "resolved") || [];
  const upcomingMaintenances = maintenances?.filter(m => 
    new Date(m.scheduledStart) > new Date()
  ) || [];

  const overallStatus = services?.every(s => s.status === "operational")
    ? "All Systems Operational"
    : "System Issues Detected";

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">System Status</h1>
        <div className={`text-xl ${
          overallStatus === "All Systems Operational" 
            ? "text-green-600" 
            : "text-yellow-600"
        }`}>
          {overallStatus}
        </div>
      </div>

      {activeIncidents.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Active Incidents</AlertTitle>
          <AlertDescription>
            There are currently {activeIncidents.length} active incidents affecting our services.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="current">Current Status</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map(service => (
              <ServiceCard 
                key={service.id}
                service={service}
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <MetricsGraph
              data={metrics}
              title="System Latency"
              type="latency"
            />
            <MetricsGraph
              data={metrics}
              title="System Uptime"
              type="uptime"
            />
            <MetricsGraph
              data={metrics}
              title="Request Rate"
              type="requests"
            />
            <MetricsGraph
              data={metrics}
              title="Error Rate"
              type="errors"
            />
          </div>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          {incidents.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                No incidents reported.
              </CardContent>
            </Card>
          ) : (
            incidents.map(incident => (
              <Card key={incident.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{incident.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{incident.description}</p>
                  <p className="mt-2 text-sm">Status: {incident.status}</p>
                  <p className="text-sm">Last Updated: {new Date(incident.updatedAt).toLocaleString()}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {maintenances.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                No scheduled maintenance.
              </CardContent>
            </Card>
          ) : (
            maintenances.map(maintenance => (
              <Card key={maintenance.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{maintenance.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{maintenance.description}</p>
                  <p className="mt-2 text-sm">Scheduled Start: {new Date(maintenance.scheduledStart).toLocaleString()}</p>
                  <p className="text-sm">Estimated Duration: {maintenance.estimatedDuration}</p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicStatus;
