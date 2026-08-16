import { relations } from "drizzle-orm";
import {
    pgTable,
    uuid,
    varchar,
    integer,
    timestamp,
} from "drizzle-orm/pg-core";
import { UsersTable } from "./user";

export const ConferenceTable = pgTable("conferences", {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 255 }).notNull(),
    owner: integer().notNull(),

    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp()
        .defaultNow()
        .$onUpdateFn(() => new Date())
        .notNull(),
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
