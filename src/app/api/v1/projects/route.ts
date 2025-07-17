import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const provinceId = searchParams.get("provinceId");

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { contractor: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (provinceId && provinceId !== "ALL") {
      where.provinceId = provinceId;
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        province: true,
        manager: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        gpsEntries: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            createdAt: true,
          },
        },
        financialEntries: {
          select: {
            id: true,
            amount: true,
            type: true,
            date: true,
          },
        },
        _count: {
          select: {
            gpsEntries: true,
            financialEntries: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
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
    if (!body.name || !body.location || !body.provinceId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, location, provinceId",
        },
        { status: 400 },
      );
    }

    // Validate province exists
    const province = await prisma.province.findUnique({
      where: { id: body.provinceId },
    });

    if (!province) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid province ID",
        },
        { status: 400 },
      );
    }

    // Validate manager exists if provided
    if (body.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: body.managerId },
      });

      if (!manager) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid manager ID",
          },
          { status: 400 },
        );
      }
    }

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description || null,
        location: body.location,
        provinceId: body.provinceId,
        status: body.status || "PLANNING",
        progress: body.progress || 0,
        budget: body.budget || 0,
        spent: body.spent || 0,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        contractor: body.contractor || null,
        managerId: body.managerId || null,
        fundingSource: body.fundingSource || "GOVERNMENT",
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        totalDistance: body.totalDistance || null,
        completedDistance: body.completedDistance || null,
        contractValue: body.contractValue || null,
        roadStartPoint: body.roadStartPoint || null,
        roadEndPoint: body.roadEndPoint || null,
        tenderNumber: body.tenderNumber || null,
        contractDate: body.contractDate ? new Date(body.contractDate) : null,
      },
      include: {
        province: true,
        manager: {
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
      data: project,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
