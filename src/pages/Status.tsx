import { ServiceCard } from "@/components/ServiceCard";
import { useQuery } from "@tanstack/react-query";
import { Service, Incident, Maintenance } from "@/types";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsGraph } from "@/components/MetricsGraph"; 
import { useWebSocket } from "@/hooks/useWebSocket";
import { useState } from "react";

interface ServiceStatusProps {
  service: Service;
  incidents: Incident[];
  maintenances: Maintenance[];
}

const ServiceStatus = ({ service, incidents, maintenances }: ServiceStatusProps) => (
  <div key={service.id} className="mb-4">
    <ServiceCard 
      key={service.id}
      service={service}
    />
  </div>
);

const Status = () => {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("current");
  
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [];
    },
  });

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<Incident[]>({
    queryKey: ["incidents"],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [];
    },
  });

  const { data: maintenances = [], isLoading: maintenancesLoading } = useQuery<Maintenance[]>({
    queryKey: ["maintenances"],
    queryFn: async () => {
      // This would be replaced with actual API call
      return [];
    },
  });

  const { isConnected } = useWebSocket("wss://your-websocket-server.com", (data) => {
    if (data.type === "METRICS_UPDATE") {
      setMetrics(prev => [...prev.slice(-50), {
        timestamp: new Date().toISOString(),
        ...data.metrics
      }]);
    }
  });

  if (servicesLoading || incidentsLoading || maintenancesLoading) {
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

        <TabsContent value="current" className="space-y-4">
          <div className="grid gap-6">
            {services.map((service) => (
              <ServiceStatus
                key={service.id}
                service={service}
                incidents={incidents}
                maintenances={maintenances}
              />
            ))}
          </div>

          {metrics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>System Metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <MetricsGraph
                  title="Response Time"
                  type="latency"
                  data={[
                    { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 120 },
                    { timestamp: new Date(Date.now() - 2700000).toISOString(), value: 200 },
                    { timestamp: new Date(Date.now() - 1800000).toISOString(), value: 150 },
                    { timestamp: new Date(Date.now() - 900000).toISOString(), value: 180 },
                    { timestamp: new Date().toISOString(), value: 130 }
                  ]}
                />
                <MetricsGraph
                  title="Availability"
                  type="uptime"
                  data={[
                    { timestamp: new Date(Date.now() - 3600000).toISOString(), value: 100 },
                    { timestamp: new Date(Date.now() - 2700000).toISOString(), value: 98 },
                    { timestamp: new Date(Date.now() - 1800000).toISOString(), value: 99 },
                    { timestamp: new Date(Date.now() - 900000).toISOString(), value: 100 },
                    { timestamp: new Date().toISOString(), value: 100 }
                  ]}
                />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incidents?.map((incident) => (
                <div 
                  key={incident.id} 
                  className={`p-4 rounded-lg border ${
                    incident.status === "resolved"
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{incident.title}</h3>
                      <p className="text-sm text-muted-foreground">{incident.description}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      incident.status === "resolved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {incident.status}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    Affected Service: {services?.find(s => s.id === incident.serviceId)?.name}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    {new Date(incident.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Maintenance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingMaintenances.map((maintenance) => (
                <div key={maintenance.id} className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                  <h3 className="font-semibold">{maintenance.title}</h3>
                  <p className="text-sm text-muted-foreground">{maintenance.description}</p>
                  <div className="mt-2 text-sm">
                    <div>Start: {new Date(maintenance.scheduledStart).toLocaleString()}</div>
                    <div>End: {new Date(maintenance.scheduledEnd).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Status;