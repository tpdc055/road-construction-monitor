import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const reportType = searchParams.get("reportType");
    const severity = searchParams.get("severity");
    const status = searchParams.get("status");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause for filtering
    const where: any = {};

    if (projectId && projectId !== "all") {
      where.projectId = projectId;
    }

    if (reportType) {
      where.reportType = reportType;
    }

    if (severity) {
      where.severity = severity;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.incidentDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const hseReports = await prisma.hSEReport.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { incidentDate: "desc" },
    });

    // Calculate summary statistics
    const summary = {
      total: hseReports.length,
      bySeverity: {
        low: hseReports.filter(r => r.severity === "LOW").length,
        medium: hseReports.filter(r => r.severity === "MEDIUM").length,
        high: hseReports.filter(r => r.severity === "HIGH").length,
        critical: hseReports.filter(r => r.severity === "CRITICAL").length,
      },
      byType: {
        safety: hseReports.filter(r => r.reportType === "SAFETY").length,
        health: hseReports.filter(r => r.reportType === "HEALTH").length,
        environmental: hseReports.filter(r => r.reportType === "ENVIRONMENTAL").length,
      },
      byStatus: {
        open: hseReports.filter(r => r.status === "OPEN").length,
        investigating: hseReports.filter(r => r.status === "INVESTIGATING").length,
        resolved: hseReports.filter(r => r.status === "RESOLVED").length,
        closed: hseReports.filter(r => r.status === "CLOSED").length,
      },
    };

    return NextResponse.json({
      success: true,
      data: hseReports,
      count: hseReports.length,
      summary,
    });
  } catch (error) {
    console.error("Error fetching HSE reports:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch HSE reports",
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
    if (!body.projectId || !body.reportedById || !body.reportType || !body.severity || !body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: projectId, reportedById, reportType, severity, title, description",
        },
        { status: 400 },
      );
    }

    // Validate enum values
    const validReportTypes = ["SAFETY", "HEALTH", "ENVIRONMENTAL"];
    const validSeverities = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const validStatuses = ["OPEN", "INVESTIGATING", "RESOLVED", "CLOSED"];

    if (!validReportTypes.includes(body.reportType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid report type. Must be one of: ${validReportTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!validSeverities.includes(body.severity)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid severity. Must be one of: ${validSeverities.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
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
      where: { id: body.reportedById },
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

    const hseReport = await prisma.hSEReport.create({
      data: {
        projectId: body.projectId,
        reportedById: body.reportedById,
        reportType: body.reportType,
        severity: body.severity,
        title: body.title,
        description: body.description,
        location: body.location || null,
        incidentDate: body.incidentDate ? new Date(body.incidentDate) : new Date(),
        status: body.status || "OPEN",
        injuries: body.injuries || null,
        damages: body.damages || null,
        immediateActions: body.immediateActions || null,
        rootCause: body.rootCause || null,
        preventiveMeasures: body.preventiveMeasures || null,
        followUpRequired: body.followUpRequired || false,
        attachments: body.attachments || [],
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
        reportedBy: {
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
      data: hseReport,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating HSE report:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create HSE report",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
