import { pgEnum, timestamp, uuid } from 'drizzle-orm/pg-core';

export const labelColorEnum = pgEnum('label_color', [
	'purple',
	'teal',
	'rose',
	'amber',
	'blue',
	'lime',
	'cyan',
	'orange',
]);

/** Shared created_at/updated_at columns with defaultNow(). */
export const timestamps = {
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
};

/** Shared UUID v4 primary key column with defaultRandom(). */
export const uuidPrimaryKey = uuid('id').primaryKey().defaultRandom();
