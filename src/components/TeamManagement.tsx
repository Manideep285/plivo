import { useState, RefObject } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Role = "admin" | "member" | "viewer";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: "active" | "invited";
  lastActive?: string;
  invitedBy?: string;
  joinedAt?: string;
}

interface AuditLog {
  id: string;
  action: "invite" | "remove" | "role_change" | "status_change";
  performedBy: string;
  affectedUser: string;
  timestamp: string;
  details: string;
}

interface NewMember {
  email: string;
  role: Role;
}

interface TeamManagementProps {
  dialogTriggerRef?: RefObject<HTMLButtonElement>;
  currentUser?: {
    id: string;
    email: string;
    name: string;
    role: Role;
  };
}

export function TeamManagement({ dialogTriggerRef, currentUser }: TeamManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState<NewMember>({ email: "", role: "member" });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const { toast } = useToast();

  const addAuditLog = (log: Omit<AuditLog, "id" | "timestamp">) => {
    const newLog: AuditLog = {
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMember.email.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    const member: TeamMember = {
      id: Math.random().toString(36).substring(7),
      name: newMember.email.split("@")[0],
      email: newMember.email,
      role: newMember.role,
      status: "invited",
      invitedBy: currentUser?.email,
      lastActive: null,
    };

    setMembers([...members, member]);
    addAuditLog({
      action: "invite",
      performedBy: currentUser?.email || "system",
      affectedUser: member.email,
      details: `Invited with role: ${member.role}`,
    });

    setNewMember({ email: "", role: "member" });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: `Invitation sent to ${newMember.email}`,
    });
  };

  const handleRemoveMember = (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      addAuditLog({
        action: "remove",
        performedBy: currentUser?.email || "system",
        affectedUser: member.email,
        details: "Removed from team",
      });
    }
    setMembers(members.filter(member => member.id !== id));
    toast({
      title: "Success",
      description: "Team member has been removed",
    });
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    const member = members.find(m => m.id === memberId);
    if (member && member.role !== newRole) {
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
      addAuditLog({
        action: "role_change",
        performedBy: currentUser?.email || "system",
        affectedUser: member.email,
        details: `Role changed from ${member.role} to ${newRole}`,
      });
      toast({
        title: "Success",
        description: `Role updated for ${member.email}`,
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <div className="space-x-2">
          <Button 
            variant="outline"
            onClick={() => setShowAuditLogs(!showAuditLogs)}
          >
            {showAuditLogs ? "Hide Audit Log" : "Show Audit Log"}
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button ref={dialogTriggerRef}>
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="colleague@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newMember.role}
                    onValueChange={(value: Role) => 
                      setNewMember({ ...newMember, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">Send Invitation</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>{member.name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  {currentUser?.role === "admin" ? (
                    <Select
                      value={member.role}
                      onValueChange={(value: Role) => handleRoleChange(member.id, value)}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className="capitalize">
                      {member.role}
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={member.status === "active" ? "default" : "secondary"}
                    className="capitalize"
                  >
                    {member.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {member.lastActive ? (
                    new Date(member.lastActive).toLocaleString()
                  ) : (
                    <span className="text-muted-foreground">Never</span>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {currentUser?.role === "admin" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {members.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No team members yet. Invite some members to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showAuditLogs && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs.map((log) => (
                <div key={log.id} className="text-sm border-b pb-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                    <span>{log.performedBy}</span>
                  </div>
                  <div>
                    <span className="font-medium">{log.action.replace("_", " ").toUpperCase()}</span>
                    {" - "}
                    <span>{log.details}</span>
                  </div>
                  <div className="text-muted-foreground">
                    Affected user: {log.affectedUser}
                  </div>
                </div>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center text-muted-foreground py-4">
                  No audit logs available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}