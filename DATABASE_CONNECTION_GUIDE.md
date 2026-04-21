# Database Connection Issues Guide

## Understanding the Connection Errors

The error messages you're seeing:
```
prisma:error Error in PostgreSQL connection: Error { kind: Io, cause: Some(Os { code: 10054, kind: ConnectionReset, message: "An existing connection was forcibly closed by the remote host." }) }
```

This is a **connection timeout issue** with your Neon PostgreSQL database, not a problem with your Paystack integration code.

## Causes

1. **Neon Free Tier Limits**: The free tier has connection limits and timeouts
2. **Idle Connections**: Long periods of inactivity cause connections to be dropped
3. **Network Issues**: Temporary network interruptions
4. **Database Overload**: High traffic or resource constraints

## Solutions

### 1. Environment-Specific Configuration

For **Development** (`.env.local`):
```env
# Use direct connection for development
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

For **Production**:
- Consider upgrading to a paid Neon plan
- Use connection pooling services like PgBouncer
- Implement connection retry logic

### 2. Connection Pool Management

Add this to your `lib/prisma.ts` (create if it doesn't exist):

```typescript
import { PrismaClient } from '@prisma/client';

// Create a singleton instance with connection pooling
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Connection pool settings
    __internal: {
      useUds: false,
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 3. Connection Retry Logic

For critical operations, implement retry logic:

```typescript
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.code === 'P2002') {
      // Wait and retry
      await new Promise(res => setTimeout(res, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
```

### 4. Production Recommendations

1. **Upgrade Database Plan**: Move to paid Neon tier for better connection limits
2. **Use Connection Pooling**: Services like PgBouncer or Neon's built-in pooling
3. **Monitor Connections**: Use Neon dashboard to monitor connection usage
4. **Implement Health Checks**: Add database health check endpoints

### 5. Local Development Alternative

For local development, consider using a local PostgreSQL instance:

```env
# Local development
DATABASE_URL="postgresql://localhost:5432/exa_anesvad"
DIRECT_URL="postgresql://localhost:5432/exa_anesvad"
```

## Impact on Paystack Integration

**Good news**: These database connection errors do NOT affect your Paystack integration functionality:

1. **Payment Processing**: Works independently of database connections
2. **Order Creation**: May fail temporarily during connection drops, but will retry
3. **Payment Verification**: Uses Paystack API directly, not your database
4. **User Experience**: Users won't see these errors unless they cause order failures

## Monitoring

To monitor database health:

1. **Neon Dashboard**: Check connection metrics at https://console.neon.tech/
2. **Error Logging**: Monitor your application logs for database errors
3. **Health Endpoints**: Create `/api/health` endpoint to check database connectivity

## Quick Fix for Now

For immediate relief, add this to your `.env.local`:

```env
# Reduce connection timeout
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require&connect_timeout=10"
```

## When to Worry

These errors are **normal** for free-tier databases and usually resolve automatically. Only be concerned if:

1. Errors persist for hours
2. Orders are consistently failing
3. Application becomes completely unresponsive
4. You're in production with paying customers

In those cases, consider upgrading your database plan or implementing more robust connection management.

## Testing

Test your Paystack integration independently of database issues:

1. Enable test mode: `PAYSTACK_TEST_MODE="true"`
2. Complete checkout flow
3. Verify orders are created successfully
4. Check that cart clearing works

The database connection errors are infrastructure issues that don't break your core payment functionality.