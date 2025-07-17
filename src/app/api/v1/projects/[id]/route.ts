import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    const project = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        financialEntries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { date: "desc" },
        },
        progressEntries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            gpsEntries: true,
            financialEntries: true,
            progressEntries: true,
          },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch project",
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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 },
      );
    }

    // Validate required fields if provided
    if (body.name && !body.name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name cannot be empty",
        },
        { status: 400 },
      );
    }

    // Validate province exists if provided
    if (body.provinceId) {
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

    // Prepare update data
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.provinceId !== undefined) updateData.provinceId = body.provinceId;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress !== undefined) updateData.progress = body.progress;
    if (body.budget !== undefined) updateData.budget = body.budget;
    if (body.spent !== undefined) updateData.spent = body.spent;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.endDate !== undefined) updateData.endDate = body.endDate ? new Date(body.endDate) : null;
    if (body.contractor !== undefined) updateData.contractor = body.contractor;
    if (body.managerId !== undefined) updateData.managerId = body.managerId;
    if (body.fundingSource !== undefined) updateData.fundingSource = body.fundingSource;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.totalDistance !== undefined) updateData.totalDistance = body.totalDistance;
    if (body.completedDistance !== undefined) updateData.completedDistance = body.completedDistance;
    if (body.contractValue !== undefined) updateData.contractValue = body.contractValue;
    if (body.roadStartPoint !== undefined) updateData.roadStartPoint = body.roadStartPoint;
    if (body.roadEndPoint !== undefined) updateData.roadEndPoint = body.roadEndPoint;
    if (body.tenderNumber !== undefined) updateData.tenderNumber = body.tenderNumber;
    if (body.contractDate !== undefined) updateData.contractDate = body.contractDate ? new Date(body.contractDate) : null;

    const updatedProject = await prisma.project.update({
      where: { id: resolvedParams.id },
      data: updateData,
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
      data: updatedProject,
    });
  } catch (error) {
    console.error("Error updating project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update project",
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

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            gpsEntries: true,
            financialEntries: true,
            progressEntries: true,
          },
        },
      },
    });

    if (!existingProject) {
      return NextResponse.json(
        {
          success: false,
          error: "Project not found",
        },
        { status: 404 },
      );
    }

    // Check if project has related data
    const hasRelatedData =
      existingProject._count.gpsEntries > 0 ||
      existingProject._count.financialEntries > 0 ||
      existingProject._count.progressEntries > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete project with existing GPS entries, financial entries, or progress data. Please delete related data first.",
          relatedData: existingProject._count,
        },
        { status: 400 },
      );
    }

    await prisma.project.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete project",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
