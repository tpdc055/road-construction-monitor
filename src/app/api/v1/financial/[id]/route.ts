import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const resolvedParams = await params;

    const financialEntry = await prisma.financialEntry.findUnique({
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

    if (!financialEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Financial entry not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: financialEntry,
    });
  } catch (error) {
    console.error("Error fetching financial entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch financial entry",
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

    // Check if financial entry exists
    const existingEntry = await prisma.financialEntry.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Financial entry not found",
        },
        { status: 404 },
      );
    }

    // Validate amount if provided
    if (body.amount !== undefined) {
      const amount = Number(body.amount);
      if (Number.isNaN(amount) || amount <= 0) {
        return NextResponse.json(
          {
            success: false,
            error: "Amount must be a valid positive number",
          },
          { status: 400 },
        );
      }
    }

    // Validate category and type if provided
    const validCategories = [
      "MATERIALS",
      "LABOR",
      "EQUIPMENT",
      "TRANSPORT",
      "UTILITIES",
      "OVERHEAD",
      "CONTINGENCY",
      "CONSULTING",
      "OTHER",
    ];
    const validTypes = ["EXPENSE", "PAYMENT", "REFUND", "ADJUSTMENT"];

    if (body.category !== undefined && !validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (body.type !== undefined && !validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Prepare update data
    const updateData: any = {};

    if (body.category !== undefined) updateData.category = body.category;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.description !== undefined) updateData.description = body.description;
    if (body.date !== undefined) updateData.date = new Date(body.date);
    if (body.invoiceNumber !== undefined) updateData.invoiceNumber = body.invoiceNumber;
    if (body.vendor !== undefined) updateData.vendor = body.vendor;
    if (body.isApproved !== undefined) updateData.isApproved = body.isApproved;
    if (body.approvedBy !== undefined) updateData.approvedBy = body.approvedBy;
    if (body.approvedAt !== undefined) updateData.approvedAt = body.approvedAt ? new Date(body.approvedAt) : null;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.exchangeRate !== undefined) updateData.exchangeRate = body.exchangeRate;

    const updatedEntry = await prisma.financialEntry.update({
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
    console.error("Error updating financial entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update financial entry",
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

    // Check if financial entry exists
    const existingEntry = await prisma.financialEntry.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!existingEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Financial entry not found",
        },
        { status: 404 },
      );
    }

    await prisma.financialEntry.delete({
      where: { id: resolvedParams.id },
    });

    return NextResponse.json({
      success: true,
      message: "Financial entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting financial entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete financial entry",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
