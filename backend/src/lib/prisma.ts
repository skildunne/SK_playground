import { PrismaClient } from '@prisma/client';

// Initialize a singleton instance of the Prisma Client
// This prevents exhausting connection pool limits during hot-reloads
const prisma = new PrismaClient();

export default prisma;
