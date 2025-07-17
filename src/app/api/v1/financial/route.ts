import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const userId = searchParams.get("userId");
    const category = searchParams.get("category");
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause for filtering
    const where: any = {};

    if (projectId && projectId !== "all") {
      where.projectId = projectId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const financialEntries = await prisma.financialEntry.findMany({
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
      orderBy: { date: "desc" },
    });

    // Calculate summary statistics
    const totalAmount = financialEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const expenseTotal = financialEntries
      .filter(entry => entry.type === "EXPENSE")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const paymentTotal = financialEntries
      .filter(entry => entry.type === "PAYMENT")
      .reduce((sum, entry) => sum + entry.amount, 0);

    return NextResponse.json({
      success: true,
      data: financialEntries,
      count: financialEntries.length,
      summary: {
        totalAmount,
        expenseTotal,
        paymentTotal,
        averageAmount: financialEntries.length > 0 ? totalAmount / financialEntries.length : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching financial entries:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch financial entries",
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
    if (
      !body.projectId ||
      !body.userId ||
      !body.category ||
      !body.type ||
      !body.amount ||
      !body.description
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: projectId, userId, category, type, amount, description",
        },
        { status: 400 },
      );
    }

    // Validate amount
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

    // Validate category and type
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

    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
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

    const financialEntry = await prisma.financialEntry.create({
      data: {
        projectId: body.projectId,
        userId: body.userId,
        category: body.category,
        type: body.type,
        amount: amount,
        description: body.description,
        date: body.date ? new Date(body.date) : new Date(),
        invoiceNumber: body.invoiceNumber || null,
        vendor: body.vendor || null,
        isApproved: body.isApproved || false,
        approvedBy: body.approvedBy || null,
        approvedAt: body.approvedAt ? new Date(body.approvedAt) : null,
        currency: body.currency || "PGK",
        exchangeRate: body.exchangeRate || 1.0,
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
      data: financialEntry,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating financial entry:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create financial entry",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
