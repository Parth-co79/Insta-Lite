require('dotenv').config();

const { PrismaPg } = require('@prisma/adapter-pg');

let prismaPromise;

function getPrisma() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  if (!prismaPromise) {
    prismaPromise = import('../generated/prisma/client.ts')
      .then(({ PrismaClient }) => {
        const adapter = new PrismaPg({
          connectionString: process.env.DATABASE_URL,
        });
        return new PrismaClient({ adapter });
      })
      .catch((error) => {
        prismaPromise = undefined;
        throw error;
      });
  }

  return prismaPromise;
}

module.exports = getPrisma;