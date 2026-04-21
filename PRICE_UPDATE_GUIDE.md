# Product Price Update Guide

## Overview

Your shop currently displays prices dynamically from the database. To update product prices, you have several options depending on your preference and technical setup.

## Current Price System

Prices are stored in the database and displayed dynamically:
- **Database Field**: `Product.price` (Float type)
- **Display Format**: `GHS {price.toLocaleString()}`
- **Location**: `src/app/(public)/shop/page.tsx` and `src/app/(public)/shop/[slug]/page.tsx`

## Price Update Options

### Option 1: Admin Dashboard (Recommended)

Update prices through your admin dashboard:
1. Go to `/admin/dashboard/products`
2. Click "Edit" on any product
3. Update the price field
4. Save changes

**Benefits:**
- No code changes required
- Real-time updates
- User-friendly interface
- Multiple price updates at once

### Option 2: Database Direct Update

Update prices directly in the database:
```sql
-- Update single product
UPDATE "Product" SET price = 150.00 WHERE name = 'Product Name';

-- Update multiple products
UPDATE "Product" SET price = CASE 
  WHEN name = 'Product A' THEN 100.00
  WHEN name = 'Product B' THEN 200.00
  ELSE price
END;
```

### Option 3: Environment Variables (For Default Prices)

Set default prices in `.env.local`:
```env
# Default product prices
DEFAULT_BLACK_SOAP_PRICE=150.00
DEFAULT_WASHING_POWDER_PRICE=120.00
DEFAULT_REPELLENT_LOTION_PRICE=180.00
DEFAULT_REPELLENT_BALM_PRICE=160.00
```

### Option 4: Seed Script (For Bulk Updates)

Create a price update script:
```typescript
// prisma/update-prices.ts
import { prisma } from '../src/lib/prisma';

const newPrices = {
  'Eco Black Soap': 150.00,
  'Washing Powder': 120.00,
  'Repellent Lotion': 180.00,
  'Repellent Balm': 160.00,
};

async function updatePrices() {
  for (const [productName, newPrice] of Object.entries(newPrices)) {
    await prisma.product.updateMany({
      where: { name: productName },
      data: { price: newPrice },
    });
    console.log(`Updated ${productName} to GHS ${newPrice}`);
  }
}

updatePrices().catch(console.error);
```

## Price Format Standards

### Currency Format
- **Symbol**: GHS (Ghanaian Cedis)
- **Decimals**: 2 decimal places (e.g., 150.00)
- **Display**: Uses `toLocaleString()` for proper formatting

### Price Categories

#### Low Range (GHS 50 - 150)
- Small items
- Basic products
- Accessories

#### Medium Range (GHS 150 - 500)
- Standard products
- Mid-range items
- Gift items

#### High Range (GHS 500+)
- Premium products
- Bulk orders
- Special items

## Price Update Examples

### Example 1: Single Product Update
```sql
UPDATE "Product" SET price = 175.00 WHERE slug = 'eco-black-soap';
```

### Example 2: Category Price Update
```sql
UPDATE "Product" SET price = price * 1.10 WHERE "categoryId" = 'category-id';
-- Increases all products in category by 10%
```

### Example 3: Percentage Increase
```sql
UPDATE "Product" SET price = ROUND(price * 1.05, 2);
-- Increases all prices by 5% and rounds to 2 decimals
```

## Price Validation

### Minimum Price
- **Rule**: Price must be > 0
- **Validation**: Database constraint and form validation
- **Error**: "Price must be greater than 0"

### Maximum Price
- **Rule**: Price should be reasonable for product type
- **Suggestion**: Keep under GHS 10,000 for standard products
- **Validation**: Admin form validation

### Price Consistency
- **Rule**: Similar products should have similar price ranges
- **Check**: Compare with similar category products
- **Adjustment**: Ensure competitive pricing

## Price Display Updates

### Shop Page
- **File**: `src/app/(public)/shop/page.tsx`
- **Line**: 80
- **Format**: `GHS {p.price.toLocaleString()}`

### Product Detail Page
- **File**: `src/app/(public)/shop/[slug]/page.tsx`
- **Format**: `GHS {product.price.toLocaleString()}`

### Cart Display
- **File**: `src/components/Cart.tsx` (if exists)
- **Format**: `GHS {item.price.toLocaleString()}`

### Checkout Summary
- **File**: `src/app/(public)/checkout/confirmation/page.tsx`
- **Format**: `GHS {(item.unitPrice * item.quantity).toLocaleString()}`

## Price Update Workflow

### 1. Determine New Prices
- Research market prices
- Consider production costs
- Check competitor pricing
- Factor in profit margins

### 2. Update Prices
- Use admin dashboard (recommended)
- Or update via database query
- Or use seed script for bulk updates

### 3. Verify Changes
- Check shop page displays
- Verify product detail pages
- Test cart and checkout flow
- Confirm price calculations

### 4. Communicate Changes
- Update any marketing materials
- Notify customers if significant changes
- Train staff on new prices

## Common Price Updates

### Seasonal Adjustments
```sql
-- Holiday season increase
UPDATE "Product" SET price = ROUND(price * 1.15, 2);

-- End of season clearance
UPDATE "Product" SET price = ROUND(price * 0.85, 2);
```

### Cost-Based Adjustments
```sql
-- Raw material cost increase
UPDATE "Product" SET price = ROUND(price * 1.10, 2) 
WHERE name LIKE '%Soap%';

-- Shipping cost adjustment
UPDATE "Product" SET price = price + 10.00;
```

### Promotional Pricing
```sql
-- Special offer
UPDATE "Product" SET price = 99.99 WHERE name = 'Special Product';

-- Bundle pricing
UPDATE "Product" SET price = 250.00 WHERE name IN ('Product A', 'Product B');
```

## Price Monitoring

### Regular Reviews
- **Monthly**: Check competitor pricing
- **Quarterly**: Review cost structure
- **Annually**: Major price adjustments

### Performance Tracking
- Monitor sales volume changes
- Track customer feedback
- Analyze profit margins
- Adjust based on demand

## Troubleshooting

### Price Not Updating
1. Check if product is published
2. Verify database update succeeded
3. Clear browser cache
4. Check for caching issues

### Display Issues
1. Check price format in database
2. Verify currency symbol display
3. Test on different devices
4. Check for JavaScript errors

### Calculation Errors
1. Verify price data type (Float)
2. Check for null/undefined values
3. Test price calculations in cart
4. Review checkout total calculations

## Next Steps

1. **Choose Update Method**: Decide which price update method works best for you
2. **Set New Prices**: Determine the new price values
3. **Update Database**: Apply the price changes
4. **Test Changes**: Verify all displays show correct prices
5. **Monitor Impact**: Track sales and customer response

## Support

If you need help updating prices:
1. Use the admin dashboard for easiest updates
2. Contact your developer for database updates
3. Refer to this guide for common scenarios
4. Test thoroughly before going live

Would you like me to help you implement any specific price update method, or do you have particular prices you'd like to set for your products?