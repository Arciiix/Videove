import { PrismaClient } from "@prisma/client";
import logger from "./utils/logger";

const prisma: PrismaClient = new PrismaClient();

async function initDatabase(): Promise<void> {
  await prisma.$connect();

  logger.info(`Connected to the database`);
}
export { initDatabase, prisma };
