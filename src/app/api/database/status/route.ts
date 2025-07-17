import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const mockDataEnabled = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

    if (mockDataEnabled) {
      // Mock data mode status
      const mockStatus = {
        status: "healthy",
        dataSource: "mock",
        message: "Using mock data service (no database required)",
        timestamp: new Date().toISOString(),
        mockData: {
          projects: 5,
          gpsEntries: 3,
          financialEntries: 5,
          users: 4,
          provinces: 10,
        },
      };

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        database: mockStatus,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          mockDataEnabled: true,
          realTimeSyncEnabled: false,
          pngApiIntegrationEnabled: false,
        },
        deployment: {
          vercelRegion: process.env.VERCEL_REGION || "unknown",
          vercelUrl: process.env.VERCEL_URL || "unknown",
        },
      });
    } else {
      // Real database connection check
      await prisma.$connect();

      // Test database with a simple query
      const userCount = await prisma.user.count();
      const projectCount = await prisma.project.count();
      const provinceCount = await prisma.province.count();

      const databaseStatus = {
        status: "connected",
        dataSource: "postgresql",
        message: "Connected to PostgreSQL database (Neon)",
        timestamp: new Date().toISOString(),
        connection: {
          url: process.env.DATABASE_URL ? "configured" : "missing",
          provider: "postgresql",
          host: "neon.tech",
        },
        data: {
          users: userCount,
          projects: projectCount,
          provinces: provinceCount,
        },
      };

      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        database: databaseStatus,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          mockDataEnabled: false,
          realTimeSyncEnabled: true,
          pngApiIntegrationEnabled: true,
        },
        deployment: {
          vercelRegion: process.env.VERCEL_REGION || "unknown",
          vercelUrl: process.env.VERCEL_URL || "unknown",
        },
      });
    }
  } catch (error) {
    console.error("Database status check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Database connection failed",
        details: error.message,
        timestamp: new Date().toISOString(),
        environment: {
          mockDataEnabled: process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true",
          hasDatabaseUrl: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
