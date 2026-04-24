CREATE TABLE "user_settings" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL,
    "theme" text DEFAULT 'light' NOT NULL,
    "notifications_enabled" boolean DEFAULT true NOT NULL,
    "email_notifications" boolean DEFAULT true NOT NULL,
    "push_notifications" boolean DEFAULT true NOT NULL,
    "language" text DEFAULT 'en' NOT NULL,
    "privacy_level" text DEFAULT 'public' NOT NULL,
    "show_online_status" boolean DEFAULT true NOT NULL,
    "show_activity_status" boolean DEFAULT true NOT NULL,
    "preferences" jsonb DEFAULT '{}' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
--> statement-breakpoint
CREATE UNIQUE INDEX "user_settings_user_id_idx" ON "user_settings" ("user_id");
