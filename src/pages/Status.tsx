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

          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <MetricsGraph
                title="Response Time"
                type="response_time"
                data={metrics.map(m => ({
                  timestamp: m.timestamp,
                  value: m.responseTime || Math.random() * 100 + 50 // Placeholder data
                }))}
              />
              <MetricsGraph
                title="Availability"
                type="availability"
                data={metrics.map(m => ({
                  timestamp: m.timestamp,
                  value: m.availability || 99.5 + Math.random() * 0.5 // Placeholder data
                }))}
              />
              <MetricsGraph
                title="Request Rate"
                type="requests"
                data={metrics.map(m => ({
                  timestamp: m.timestamp,
                  value: m.requestRate || Math.floor(Math.random() * 100 + 150) // Placeholder data
                }))}
              />
              <MetricsGraph
                title="Error Rate"
                type="errors"
                data={metrics.map(m => ({
                  timestamp: m.timestamp,
                  value: m.errorRate || Math.floor(Math.random() * 5) // Placeholder data
                }))}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {incidents?.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No incidents to report
                </div>
              ) : (
                incidents?.map((incident) => (
                  <div 
                    key={incident.id} 
                    className={`p-4 rounded-lg border ${
                      incident.status === "resolved"
                        ? "bg-green-50 border-green-200"
                        : incident.status === "investigating"
                        ? "bg-yellow-50 border-yellow-200"
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
                          : incident.status === "investigating"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {incident.status}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Affected Service: {services?.find(s => s.id === incident.serviceId)?.name}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      Started: {new Date(incident.createdAt).toLocaleString()}
                      {incident.status === "resolved" && incident.resolvedAt && (
                        <span className="ml-2">
                          | Resolved: {new Date(incident.resolvedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {incident.updates && incident.updates.length > 0 && (
                      <div className="mt-4 border-t pt-2">
                        <h4 className="text-sm font-semibold mb-2">Updates</h4>
                        {incident.updates.map((update, index) => (
                          <div key={index} className="text-sm mb-2">
                            <div className="text-muted-foreground">
                              {new Date(update.timestamp).toLocaleString()}
                            </div>
                            <div>{update.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
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