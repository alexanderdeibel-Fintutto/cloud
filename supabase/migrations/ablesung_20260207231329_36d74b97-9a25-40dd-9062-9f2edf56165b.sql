-- Add replaced_by column to meters table for meter succession chains
-- This creates a self-referencing link: old_meter.replaced_by = new_meter.id
ALTER TABLE public.meters 
ADD COLUMN replaced_by uuid REFERENCES public.meters(id) ON DELETE SET NULL DEFAULT NULL;

-- Index for efficient chain lookups
CREATE INDEX idx_meters_replaced_by ON public.meters(replaced_by) WHERE replaced_by IS NOT NULL;

-- Comment for documentation
COMMENT ON COLUMN public.meters.replaced_by IS 'Points to the meter that replaced this one (for meter swap chains)';