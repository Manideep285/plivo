import { Service } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ServiceCardProps {
  service: Service;
}

const statusConfig = {
  operational: {
    color: "bg-green-100 text-green-800",
    icon: CheckCircle2,
  },
  degraded: {
    color: "bg-yellow-100 text-yellow-800",
    icon: AlertCircle,
  },
  outage: {
    color: "bg-red-100 text-red-800",
    icon: AlertCircle,
  },
};

export function ServiceCard({ service }: ServiceCardProps) {
  const StatusIcon = statusConfig[service.status].icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{service.name}</CardTitle>
          <Badge className={statusConfig[service.status].color}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {service.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{service.description}</p>
      </CardContent>
    </Card>
  );
}