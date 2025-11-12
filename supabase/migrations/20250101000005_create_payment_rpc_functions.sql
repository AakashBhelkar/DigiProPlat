-- Create RPC functions for payment processing
-- These functions are used by process-payment and stripe-webhook edge functions

-- Function to increment product sales count and revenue
CREATE OR REPLACE FUNCTION increment_product_sales(
    p_product_id UUID,
    p_amount DECIMAL(10, 2)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE products
    SET
        sales_count = COALESCE(sales_count, 0) + 1,
        total_revenue = COALESCE(total_revenue, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_product_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_product_sales(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_product_sales(UUID, DECIMAL) TO service_role;

-- Function to add amount to user wallet balance
CREATE OR REPLACE FUNCTION add_to_wallet(
    p_user_id UUID,
    p_amount DECIMAL(10, 2)
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles
    SET
        wallet_balance = COALESCE(wallet_balance, 0) + p_amount,
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION add_to_wallet(UUID, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION add_to_wallet(UUID, DECIMAL) TO service_role;

-- Function to update product rating (already exists but ensure it's correct)
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE products
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM product_reviews
            WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.product_id, OLD.product_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists for product rating updates
DROP TRIGGER IF EXISTS update_product_rating_trigger ON product_reviews;
CREATE TRIGGER update_product_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON product_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_product_rating();

