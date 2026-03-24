-- 004: Add `archived` on conversations (chat list hides archived threads).
--
-- PREREQUISITE: table `public.conversations` must already exist.
-- If you see a skip NOTICE, run one of these first in Supabase SQL Editor:
--   • db/migrations/001_init.sql  (recommended full schema), OR
--   • db/migrations/002_repair_missing_tables.sql
--     then db/migrations/003_init_remaining_after_002.sql
--
-- Safe to run multiple times. Does nothing (with NOTICE) if `conversations` is missing.

DO $migration$
BEGIN
  IF to_regclass('public.conversations') IS NOT NULL THEN
    ALTER TABLE public.conversations
      ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

    CREATE INDEX IF NOT EXISTS idx_conversations_user_archived
      ON public.conversations (user_id, archived);
  ELSE
    RAISE NOTICE '004_conversations_archived: skipped — public.conversations does not exist. Run 001_init.sql or 003_init_remaining_after_002.sql first.';
  END IF;
END
$migration$;
