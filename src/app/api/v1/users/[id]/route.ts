import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    const user = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in response
        managedProjects: {
          select: {
            id: true,
            name: true,
            status: true,
            location: true,
          },
        },
        gpsEntries: {
          select: {
            id: true,
            latitude: true,
            longitude: true,
            description: true,
            createdAt: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10, // Limit to recent entries
        },
        financialEntries: {
          select: {
            id: true,
            amount: true,
            category: true,
            type: true,
            date: true,
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { date: "desc" },
          take: 10, // Limit to recent entries
        },
        _count: {
          select: {
            managedProjects: true,
            gpsEntries: true,
            financialEntries: true,
          },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Validate email format if provided
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid email format",
          },
          { status: 400 },
        );
      }

      // Check if new email is already taken by another user
      const existingEmailUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingEmailUser && existingEmailUser.id !== resolvedParams.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Email is already taken by another user",
          },
          { status: 400 },
        );
      }
    }

    // Validate role if provided
    if (body.role) {
      const validRoles = [
        "ADMIN",
        "PROJECT_MANAGER",
        "SITE_ENGINEER",
        "FINANCIAL_OFFICER",
        "GOVERNMENT_ADMIN",
        "DONOR_ADMIN",
        "CONTRACTOR_ADMIN",
        "COMMUNITY_LIAISON",
      ];

      if (!validRoles.includes(body.role)) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
          },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    if (body.email !== undefined) updateData.email = body.email;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Handle password update separately (hash if provided)
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        // Don't include password in response
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: {
        _count: {
          select: {
            managedProjects: true,
            gpsEntries: true,
            financialEntries: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      );
    }

    // Check if user has related data
    const hasRelatedData =
      existingUser._count.managedProjects > 0 ||
      existingUser._count.gpsEntries > 0 ||
      existingUser._count.financialEntries > 0;

    if (hasRelatedData) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete user with existing projects, GPS entries, or financial entries. Please transfer ownership first.",
          relatedData: existingUser._count,
        },
        { status: 400 },
      );
    }

    await prisma.user.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
