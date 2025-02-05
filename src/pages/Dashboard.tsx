import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { Service, Incident, Maintenance } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddServiceDialog } from "@/components/AddServiceDialog";
import { IncidentManager } from "@/components/IncidentManager";
import { MaintenanceScheduler } from "@/components/MaintenanceScheduler";
import { TeamManagement } from "@/components/TeamManagement";
import { MetricsGraph } from "@/components/MetricsGraph";
import { Plus, AlertTriangle, Calendar, Users, LogOut } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "API",
      status: "operational",
      description: "Main API endpoint",
    },
    {
      id: "2",
      name: "Website",
      status: "degraded",
      description: "Customer-facing website",
    },
    {
      id: "3",
      name: "Database",
      status: "operational",
      description: "Primary database cluster",
    },
  ]);

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const navigate = useNavigate();

  // Refs for dialog triggers
  const incidentDialogRef = useRef<HTMLButtonElement>(null);
  const maintenanceDialogRef = useRef<HTMLButtonElement>(null);
  const teamDialogRef = useRef<HTMLButtonElement>(null);

  const handleServiceAdd = (service: Omit<Service, "id">) => {
    const newService = {
      ...service,
      id: uuidv4(),
    };
    setServices([...services, newService]);
  };

  const handleIncidentCreate = (incident: Omit<Incident, "id" | "createdAt" | "updatedAt">) => {
    const newIncident = {
      ...incident,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setIncidents([...incidents, newIncident]);
  };

  const handleIncidentUpdate = (updatedIncident: Incident) => {
    setIncidents(incidents.map(incident => 
      incident.id === updatedIncident.id ? updatedIncident : incident
    ));
  };

  const handleMaintenanceAdd = (maintenance: Omit<Maintenance, "id">) => {
    const newMaintenance = {
      ...maintenance,
      id: uuidv4(),
    };
    setMaintenances([...maintenances, newMaintenance]);
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    toast({
      title: 'Success',
      description: 'Successfully logged out',
    });
    navigate('/');
  };

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [navigate]);

  // Demo metrics data
  const incidentMetrics = [
    { timestamp: new Date(Date.now() - 6 * 3600000).toISOString(), value: 2 },
    { timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), value: 3 },
    { timestamp: new Date(Date.now() - 4 * 3600000).toISOString(), value: 1 },
    { timestamp: new Date(Date.now() - 3 * 3600000).toISOString(), value: 4 },
    { timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), value: 2 },
    { timestamp: new Date(Date.now() - 1 * 3600000).toISOString(), value: 1 },
    { timestamp: new Date().toISOString(), value: incidents.length },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Status</h1>
        <div className="flex gap-2">
          <AddServiceDialog onServiceAdd={handleServiceAdd} />
          <Button 
            variant="outline"
            onClick={() => {
              setActiveTab("incidents");
              setTimeout(() => incidentDialogRef.current?.click(), 100);
            }}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report Incident
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setActiveTab("maintenance");
              setTimeout(() => maintenanceDialogRef.current?.click(), 100);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Maintenance
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setActiveTab("teams");
              setTimeout(() => teamDialogRef.current?.click(), 100);
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            Manage Teams
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {services.every(s => s.status === "operational") 
                    ? "All Systems Operational"
                    : "Some Systems Degraded"
                  }
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Incidents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">
                  {incidents.filter(i => i.status !== "resolved").length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scheduled Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {maintenances.filter(m => m.status === "scheduled").length}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8">
            <MetricsGraph
              title="Incident Trend"
              type="errors"
              data={incidentMetrics}
            />
          </div>
        </TabsContent>

        <TabsContent value="services">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <div className="space-y-8">
            <MetricsGraph
              title="Incident History"
              type="errors"
              data={incidentMetrics}
            />
            <IncidentManager
              services={services}
              incidents={incidents}
              onIncidentCreate={handleIncidentCreate}
              onIncidentUpdate={handleIncidentUpdate}
              dialogTriggerRef={incidentDialogRef}
            />
          </div>
        </TabsContent>

        <TabsContent value="maintenance">
          <MaintenanceScheduler
            services={services}
            maintenances={maintenances}
            onMaintenanceAdd={handleMaintenanceAdd}
            dialogTriggerRef={maintenanceDialogRef}
          />
        </TabsContent>

        <TabsContent value="teams">
          <TeamManagement dialogTriggerRef={teamDialogRef} />
        </TabsContent>
      </Tabs>
    </div>
  );
}