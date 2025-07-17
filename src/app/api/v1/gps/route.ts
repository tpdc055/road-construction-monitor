import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");
    const taskName = searchParams.get("taskName");
    const workType = searchParams.get("workType");

    // Build where clause for filtering
    const where: any = {};

    if (projectId && projectId !== "all") {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (taskName) {
      where.taskName = { contains: taskName, mode: "insensitive" };
    }

    if (workType) {
      where.workType = { contains: workType, mode: "insensitive" };
    }

    const gpsEntries = await prisma.gPSEntry.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: gpsEntries,
      count: gpsEntries.length,
    });
  } catch (error) {
    console.error("Error fetching GPS entries:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch GPS entries",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.latitude || !body.longitude || !body.projectId || !body.userId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: latitude, longitude, projectId, userId",
        },
        { status: 400 },
      );
    }

    // Validate coordinates
    if (Math.abs(body.latitude) > 90 || Math.abs(body.longitude) > 180) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid GPS coordinates",
        },
        { status: 400 },
      );
    }

    // Validate PNG coordinates (more specific validation)
    if (body.latitude > 0 || body.latitude < -12 || body.longitude < 140 || body.longitude > 160) {
      return NextResponse.json(
        {
          success: false,
          error: "GPS coordinates are outside Papua New Guinea territory",
        },
        { status: 400 },
      );
    }

    // Validate project exists
    const project = await prisma.project.findUnique({
      where: { id: body.projectId },
    });

    if (!project) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 },
      );
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: body.userId },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    const gpsEntry = await prisma.gPSEntry.create({
      data: {
        latitude: parseFloat(body.latitude),
        longitude: parseFloat(body.longitude),
        elevation: body.elevation ? parseFloat(body.elevation) : null,
        accuracy: body.accuracy ? parseFloat(body.accuracy) : null,
        description: body.description || "",
        projectId: body.projectId,
        userId: body.userId,
        taskName: body.taskName || "",
        workType: body.workType || "",
        roadSide: body.roadSide || "",
        startChainage: body.startChainage || "",
        endChainage: body.endChainage || "",
        taskDescription: body.taskDescription || "",
        photos: body.photos || [],
        timestamp: body.timestamp ? new Date(body.timestamp) : new Date(),
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: gpsEntry,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating GPS entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create GPS entry",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
