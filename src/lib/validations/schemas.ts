import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["operational", "degraded", "outage", "maintenance"]),
  url: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
});

export const incidentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
  severity: z.enum(["critical", "major", "minor", "maintenance"]),
  serviceIds: z.array(z.string()).min(1, "At least one service must be selected"),
  updates: z.array(z.object({
    message: z.string().min(1),
    status: z.enum(["investigating", "identified", "monitoring", "resolved"]),
    createdAt: z.date(),
  })).optional(),
});

export const teamSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  description: z.string().optional(),
  members: z.array(z.object({
    email: z.string().email(),
    role: z.enum(["admin", "member", "viewer"]),
  })),
});

export const userSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  name: z.string().min(1, "Name is required"),
});

export const maintenanceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startTime: z.date(),
  endTime: z.date(),
  serviceIds: z.array(z.string()).min(1, "At least one service must be selected"),
  status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]),
});
