import { useState, RefObject } from "react";
import { Service, Maintenance, MaintenanceStatus } from "@/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Clock, CheckCircle2, AlertCircle } from "lucide-react";

interface MaintenanceSchedulerProps {
  services: Service[];
  maintenances: Maintenance[];
  onMaintenanceAdd: (maintenance: Omit<Maintenance, "id">) => void;
  dialogTriggerRef?: RefObject<HTMLButtonElement>;
}

const statusConfig = {
  [MaintenanceStatus.SCHEDULED]: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  [MaintenanceStatus.IN_PROGRESS]: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: AlertCircle,
  },
  [MaintenanceStatus.COMPLETED]: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
  },
  [MaintenanceStatus.CANCELLED]: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
  },
};

export function MaintenanceScheduler({ 
  services, 
  maintenances, 
  onMaintenanceAdd,
  dialogTriggerRef
}: MaintenanceSchedulerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newMaintenance, setNewMaintenance] = useState({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    serviceIds: [] as string[],
    status: MaintenanceStatus.SCHEDULED,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const maintenanceData: Omit<Maintenance, "id"> = {
      title: newMaintenance.title,
      description: newMaintenance.description,
      startTime: new Date(newMaintenance.startTime).toISOString(),
      endTime: new Date(newMaintenance.endTime).toISOString(),
      scheduledStart: new Date(newMaintenance.startTime).toISOString(),
      scheduledEnd: new Date(newMaintenance.endTime).toISOString(),
      status: MaintenanceStatus.SCHEDULED,
      serviceId: newMaintenance.serviceIds[0],
      serviceIds: newMaintenance.serviceIds,
    };

    onMaintenanceAdd(maintenanceData);
    setIsCreateDialogOpen(false);
    setNewMaintenance({
      title: "",
      description: "",
      startTime: new Date(),
      endTime: new Date(),
      status: MaintenanceStatus.SCHEDULED,
      serviceIds: []
    });
  };

  const isScheduled = (status: MaintenanceStatus) => status === MaintenanceStatus.SCHEDULED;
  const isCompleted = (status: MaintenanceStatus) => status === MaintenanceStatus.COMPLETED;
  const isCancelled = (status: MaintenanceStatus) => status === MaintenanceStatus.CANCELLED;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Maintenance Windows</h2>
          <p className="text-muted-foreground">
            Schedule and manage maintenance periods
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button ref={dialogTriggerRef}>
              Schedule Maintenance
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Schedule Maintenance Window</DialogTitle>
              <DialogDescription>
                Plan a maintenance window for system updates or improvements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newMaintenance.title}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Maintenance window title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newMaintenance.description}
                  onChange={(e) => setNewMaintenance(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the maintenance activities"
                />
              </div>
              <div className="space-y-2">
                <Label>Services</Label>
                <Select
                  value={newMaintenance.serviceIds[0]}
                  onValueChange={(value) => setNewMaintenance(prev => ({ ...prev, serviceIds: [value] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select affected services" />
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newMaintenance.startTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newMaintenance.startTime ? (
                          format(newMaintenance.startTime, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newMaintenance.startTime}
                        onSelect={(date) => date && setNewMaintenance(prev => ({ ...prev, startTime: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !newMaintenance.endTime && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newMaintenance.endTime ? (
                          format(newMaintenance.endTime, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newMaintenance.endTime}
                        onSelect={(date) => date && setNewMaintenance(prev => ({ ...prev, endTime: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                Schedule Maintenance
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {maintenances.map((maintenance) => {
          const StatusIcon = statusConfig[maintenance.status].icon;
          const affectedServices = services.filter(s => 
            maintenance.serviceIds.includes(s.id)
          );
          
          return (
            <Card key={maintenance.id} className={cn(
              "transition-all duration-200",
              !isCompleted(maintenance.status) && "border-l-4",
              {
                "border-l-yellow-500": isScheduled(maintenance.status),
                "border-l-blue-500": maintenance.status === MaintenanceStatus.IN_PROGRESS,
                "border-l-green-500": isCompleted(maintenance.status),
                "border-l-red-500": isCancelled(maintenance.status)
              }
            )}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    <StatusIcon className={cn(
                      "h-4 w-4",
                      statusConfig[maintenance.status].color.split(" ")[1]
                    )} />
                    <span>{maintenance.title}</span>
                  </CardTitle>
                  <CardDescription>
                    Affecting: {affectedServices.map(s => s.name).join(", ")}
                  </CardDescription>
                </div>
                <Badge className={statusConfig[maintenance.status].color}>
                  {statusConfig[maintenance.status].label}
                </Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {maintenance.description}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>
                      {format(new Date(maintenance.startTime), "PPP")} - {format(new Date(maintenance.endTime), "PPP")}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}