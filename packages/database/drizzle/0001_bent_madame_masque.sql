CREATE TABLE "user_profile" (
	"user_id" text PRIMARY KEY NOT NULL,
	"role" text DEFAULT 'Viewer' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"last_active" text DEFAULT 'Not yet' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;