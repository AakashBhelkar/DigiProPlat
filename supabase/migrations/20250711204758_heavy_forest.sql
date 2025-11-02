/*
  # Create get_total_revenue RPC function

  1. New Functions
    - `get_total_revenue()` - Returns the sum of total_revenue from all products
  
  2. Security
    - Function is accessible to authenticated users
    - Uses existing RLS policies on products table
  
  3. Purpose
    - Provides dashboard with total revenue calculation
    - Aggregates revenue data from products table
*/

CREATE OR REPLACE FUNCTION public.get_total_revenue()
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    total_revenue numeric;
BEGIN
    SELECT COALESCE(SUM(total_revenue), 0) INTO total_revenue 
    FROM public.products 
    WHERE is_public = true;
    
    RETURN total_revenue;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_total_revenue() TO authenticated;