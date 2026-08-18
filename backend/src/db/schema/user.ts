import { relations } from "drizzle-orm";
import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { ConferenceTable } from "./conference.js";

export const UsersTable = pgTable("users", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .defaultNow()
        .$onUpdateFn(() => new Date())
        .notNull(),
});

export const UsersTableRelations = relations(UsersTable, ({ many }) => {
    return {
        conferences: many(ConferenceTable),
    };
});
