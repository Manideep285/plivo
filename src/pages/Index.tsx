import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { Link } from "react-router-dom";
import { Service } from "@/types";

const Index = () => {
  // Demo data - in a real app, this would come from an API
  const services: Service[] = [
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
  ];

  const allOperational = services.every((service) => service.status === "operational");

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">System Status</h1>
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div
              className={`h-3 w-3 rounded-full ${
                allOperational ? "bg-status-operational" : "bg-status-degraded"
              }`}
            />
            <span className="text-lg">
              {allOperational ? "All systems operational" : "Some systems are experiencing issues"}
            </span>
          </div>
          <Link to="/login">
            <Button variant="outline">Admin Login</Button>
          </Link>
        </div>

        <div className="grid gap-6 max-w-3xl mx-auto">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;