-- Fix: bank_transactions_match_status_check constraint
-- Der bestehende Constraint erlaubt nur 'unmatched' und 'rejected',
-- aber der Code erwartet 'unmatched', 'auto', 'manual', 'ignored'.
-- Wir droppen den alten Constraint und erstellen einen neuen mit den korrekten Werten.

ALTER TABLE public.bank_transactions
  DROP CONSTRAINT IF EXISTS bank_transactions_match_status_check;

ALTER TABLE public.bank_transactions
  ADD CONSTRAINT bank_transactions_match_status_check
  CHECK (match_status IN ('unmatched', 'auto', 'manual', 'ignored', 'matched', 'rejected'));
