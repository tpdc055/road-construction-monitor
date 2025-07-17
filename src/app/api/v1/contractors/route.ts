import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const projectId = searchParams.get("projectId");

    // Build where clause for filtering
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status && status !== "ALL") {
      where.status = status;
    }

    const contractors = await prisma.contractor.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            status: true,
            budget: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: contractors,
      count: contractors.length,
    });
  } catch (error) {
    console.error("Error fetching contractors:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contractors",
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
    if (!body.name || !body.email || !body.contactPerson) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, email, contactPerson",
        },
        { status: 400 },
      );
    }

    // Validate email format
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

    // Check if contractor already exists
    const existingContractor = await prisma.contractor.findFirst({
      where: {
        OR: [
          { email: body.email },
          { name: body.name },
        ],
      },
    });

    if (existingContractor) {
      return NextResponse.json(
        {
          success: false,
          error: "Contractor with this name or email already exists",
        },
        { status: 400 },
      );
    }

    const contractor = await prisma.contractor.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || null,
        address: body.address || null,
        contactPerson: body.contactPerson,
        registrationNumber: body.registrationNumber || null,
        businessType: body.businessType || "CONSTRUCTION",
        specialization: body.specialization || null,
        capacity: body.capacity || null,
        status: body.status || "ACTIVE",
        rating: body.rating || null,
        certifications: body.certifications || [],
        website: body.website || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: contractor,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating contractor:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contractor",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
