
import { integer, pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";

const user = pgTable("user",{
    id:serial("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const session = pgTable("session", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


const project = pgTable("project", {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    projectKey: varchar("project_key", { length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

const feedback = pgTable("feedback", {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull().references(() => project.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 50 }).notNull(), // 'bug', 'feature', 'other'
    message: varchar("message", { length: 1000 }).notNull(),
    userEmail: varchar("user_email", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

const feedbackLabel = pgTable("feedback_label", {
    id: serial("id").primaryKey(),
    feedbackId: integer("feedback_id").notNull().references(() => feedback.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 100 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export { user, session, project, feedback, feedbackLabel };