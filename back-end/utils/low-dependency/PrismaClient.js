const { PrismaClient } = require("@prisma/client");

/**
 * @description Create one global instance of PrismaClient for optimization
 * @reference https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prismaclient-in-long-running-applications
 */
let prisma = new PrismaClient();

module.exports = {
  prisma
};
