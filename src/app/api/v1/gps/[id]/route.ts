import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    const gpsEntry = await prisma.gPSEntry.findUnique({
      where: { id: resolvedParams.id },
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

    if (!gpsEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "GPS entry not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: gpsEntry,
    });
  } catch (error) {
    console.error("Error fetching GPS entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch GPS entry",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const resolvedParams = await params;

    // Check if GPS entry exists
    const existingEntry = await prisma.gPSEntry.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "GPS entry not found",
        },
        { status: 404 },
      );
    }

    // Validate coordinates if provided
    if (body.latitude !== undefined || body.longitude !== undefined) {
      const lat = body.latitude !== undefined ? body.latitude : existingEntry.latitude;
      const lng = body.longitude !== undefined ? body.longitude : existingEntry.longitude;

      if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid GPS coordinates",
          },
          { status: 400 },
        );
      }

      // Validate PNG coordinates
      if (lat > 0 || lat < -12 || lng < 140 || lng > 160) {
        return NextResponse.json(
          {
            success: false,
            error: "GPS coordinates are outside Papua New Guinea territory",
          },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (body.latitude !== undefined) updateData.latitude = parseFloat(body.latitude);
    if (body.longitude !== undefined) updateData.longitude = parseFloat(body.longitude);
    if (body.elevation !== undefined) updateData.elevation = body.elevation ? parseFloat(body.elevation) : null;
    if (body.accuracy !== undefined) updateData.accuracy = body.accuracy ? parseFloat(body.accuracy) : null;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.taskName !== undefined) updateData.taskName = body.taskName;
    if (body.workType !== undefined) updateData.workType = body.workType;
    if (body.roadSide !== undefined) updateData.roadSide = body.roadSide;
    if (body.startChainage !== undefined) updateData.startChainage = body.startChainage;
    if (body.endChainage !== undefined) updateData.endChainage = body.endChainage;
    if (body.taskDescription !== undefined) updateData.taskDescription = body.taskDescription;
    if (body.photos !== undefined) updateData.photos = body.photos;
    if (body.timestamp !== undefined) updateData.timestamp = new Date(body.timestamp);

    const updatedEntry = await prisma.gPSEntry.update({
      where: { id: resolvedParams.id },
      data: updateData,
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
      data: updatedEntry,
    });
  } catch (error) {
    console.error("Error updating GPS entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update GPS entry",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    // Check if GPS entry exists
    const existingEntry = await prisma.gPSEntry.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "GPS entry not found",
        },
        { status: 404 },
      );
    }

    await prisma.gPSEntry.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      message: "GPS entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting GPS entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete GPS entry",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
