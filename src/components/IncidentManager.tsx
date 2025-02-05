import { useState, useRef, RefObject } from "react";
import { Service, Incident, IncidentStatus, IncidentSeverity } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncidentManagerProps {
  services: Service[];
  incidents: Incident[];
  compact?: boolean;
  onIncidentCreate?: (incident: Omit<Incident, "id" | "createdAt" | "updatedAt">) => void;
  onIncidentUpdate?: (incident: Incident) => void;
  dialogTriggerRef?: RefObject<HTMLButtonElement>;
}

const statusConfig = {
  investigating: {
    label: "Investigating",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
  identified: {
    label: "Identified",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircle2,
  },
  monitoring: {
    label: "Monitoring",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: Clock,
  },
  resolved: {
    label: "Resolved",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
};

const severityConfig = {
  minor: {
    label: "Minor",
    color: "bg-yellow-100 text-yellow-800",
  },
  major: {
    label: "Major",
    color: "bg-orange-100 text-orange-800",
  },
  critical: {
    label: "Critical",
    color: "bg-red-100 text-red-800",
  },
};

export function IncidentManager({ 
  services, 
  incidents, 
  compact = false,
  onIncidentCreate, 
  onIncidentUpdate,
  dialogTriggerRef
}: IncidentManagerProps) {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newIncident, setNewIncident] = useState({
    title: "",
    description: "",
    serviceId: "",
    status: IncidentStatus.INVESTIGATING,
    severity: IncidentSeverity.MINOR,
  });

  const handleCreateIncident = () => {
    if (!newIncident.title || !newIncident.serviceId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onIncidentCreate?.(newIncident);
    setIsCreateDialogOpen(false);
    setNewIncident({
      title: "",
      description: "",
      serviceId: "",
      status: IncidentStatus.INVESTIGATING,
      severity: IncidentSeverity.MINOR,
    });
  };

  const handleUpdateStatus = (incident: Incident, newStatus: IncidentStatus) => {
    onIncidentUpdate?.({
      ...incident,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-4">
      {!compact && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Incidents</h2>
            <p className="text-muted-foreground">
              Manage and track service incidents
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button ref={dialogTriggerRef}>
                Create Incident
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Incident</DialogTitle>
                <DialogDescription>
                  Report a new service incident
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newIncident.title}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the incident"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIncident.description}
                    onChange={(e) => setNewIncident(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description of the incident"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Affected Service</Label>
                  <Select
                    value={newIncident.serviceId}
                    onValueChange={(value) => setNewIncident(prev => ({ ...prev, serviceId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={newIncident.severity}
                    onValueChange={(value: IncidentSeverity) => setNewIncident(prev => ({ ...prev, severity: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(severityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateIncident}>
                  Create Incident
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      <div className="space-y-4">
        {incidents.map((incident) => {
          const StatusIcon = statusConfig[incident.status].icon;
          const service = services.find(s => s.id === incident.serviceId);
          
          return (
            <Card key={incident.id} className={cn(
              "transition-all duration-200",
              incident.status !== "resolved" && "border-l-4",
              {
                "border-l-yellow-500": incident.severity === "minor",
                "border-l-orange-500": incident.severity === "major",
                "border-l-red-500": incident.severity === "critical",
              }
            )}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <StatusIcon className={cn(
                      "h-4 w-4",
                      statusConfig[incident.status].color.split(" ")[1]
                    )} />
                    <span>{incident.title}</span>
                  </CardTitle>
                  <CardDescription>
                    Affecting {service?.name}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={severityConfig[incident.severity].color}>
                    {severityConfig[incident.severity].label}
                  </Badge>
                  <Badge className={statusConfig[incident.status].color}>
                    {statusConfig[incident.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {incident.description}
                </p>
                <div className="mt-2 text-xs text-muted-foreground">
                  Created: {new Date(incident.createdAt).toLocaleString()}
                </div>
              </CardContent>
              {!compact && incident.status !== "resolved" && (
                <CardFooter className="flex justify-end space-x-2">
                  {incident.status === "investigating" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(incident, IncidentStatus.IDENTIFIED)}
                    >
                      Mark as Identified
                    </Button>
                  )}
                  {incident.status === "identified" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(incident, IncidentStatus.MONITORING)}
                    >
                      Start Monitoring
                    </Button>
                  )}
                  {incident.status === "monitoring" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(incident, IncidentStatus.RESOLVED)}
                    >
                      Mark as Resolved
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}