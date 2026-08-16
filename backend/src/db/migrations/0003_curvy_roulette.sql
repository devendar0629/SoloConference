ALTER TABLE "conferences" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "conferences" ADD COLUMN "updatedAt" timestamp DEFAULT now() NOT NULL;