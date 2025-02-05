import { ScrollArea } from "@/components/ui/scroll-area";
import { Incident, IncidentUpdate } from "@/types";
import { format } from "date-fns";

interface IncidentTimelineProps {
  incident: Incident;
  updates: IncidentUpdate[];
}

export const IncidentTimeline = ({ incident, updates }: IncidentTimelineProps) => {
  const sortedUpdates = [...updates].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ScrollArea className="h-[400px] w-full rounded-md border p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Incident Timeline</h3>
          <span className={`px-2 py-1 rounded-full text-sm ${
            incident.status === "resolved" ? "bg-green-100 text-green-800" :
            incident.status === "investigating" ? "bg-yellow-100 text-yellow-800" :
            "bg-red-100 text-red-800"
          }`}>
            {incident.status.charAt(0).toUpperCase() + incident.status.slice(1)}
          </span>
        </div>
        
        <div className="space-y-4">
          {sortedUpdates.map((update, index) => (
            <div key={update.id} className="relative pl-4 border-l-2 border-gray-200">
              <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-2" />
              <div className="mb-1">
                <span className="text-sm text-gray-500">
                  {format(new Date(update.createdAt), "MMM d, yyyy HH:mm")}
                </span>
              </div>
              <div className="text-sm">{update.message}</div>
              {update.status && (
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    update.status === "resolved" ? "bg-green-100 text-green-800" :
                    update.status === "investigating" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    Status changed to: {update.status}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
