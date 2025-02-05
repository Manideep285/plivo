export type Role = 'admin' | 'member' | 'viewer';

export interface Team {
  id: string;
  name: string;
  organizationId: string;
  members: TeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: Role;
  joinedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  teams: Team[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: Role;
  joinedAt: Date;
}
