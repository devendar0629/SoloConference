import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar, integer } from "drizzle-orm/pg-core";
import { UsersTable } from "./user";

export const ConferenceTable = pgTable("conferences", {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    owner: integer().notNull(),
});

export const ConferenceTableRelations = relations(
    ConferenceTable,
    ({ one }) => {
        return {
            owner: one(UsersTable, {
                fields: [ConferenceTable.owner],
                references: [UsersTable.id],
            }),
        };
    },
);
