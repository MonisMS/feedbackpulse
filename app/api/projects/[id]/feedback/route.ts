import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, project, feedback, feedbackLabel } from '@/lib/db';
import { eq, and, desc } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/projects/[id]/feedback
 * Retrieves all feedback for a specific project
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const projectId = parseInt(id);

    if (isNaN(projectId)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const [projectData] = await db
      .select()
      .from(project)
      .where(
        and(
          eq(project.id, projectId),
          eq(project.userId, parseInt(session.user.id))
        )
      )
      .limit(1);

    if (!projectData) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Fetch all feedback for this project
    const feedbackData = await db
      .select()
      .from(feedback)
      .where(eq(feedback.projectId, projectId))
      .orderBy(desc(feedback.createdAt));

    // Fetch labels for all feedback items
    const feedbackIds = feedbackData.map(f => f.id);
    const labelsData = feedbackIds.length > 0
      ? await db
          .select()
          .from(feedbackLabel)
          .where(eq(feedbackLabel.feedbackId, feedbackIds[0]))
          .orderBy(feedbackLabel.createdAt)
      : [];

    // Group labels by feedbackId
    const labelsByFeedback: Record<number, typeof labelsData> = {};
    
    // Fetch labels for each feedback separately (simple approach)
    for (const fb of feedbackData) {
      const labels = await db
        .select()
        .from(feedbackLabel)
        .where(eq(feedbackLabel.feedbackId, fb.id))
        .orderBy(feedbackLabel.createdAt);
      labelsByFeedback[fb.id] = labels;
    }

    // Combine feedback with labels
    const feedbackWithLabels = feedbackData.map(fb => ({
      ...fb,
      labels: labelsByFeedback[fb.id] || [],
    }));

    return NextResponse.json(feedbackWithLabels);
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feedback' },
      { status: 500 }
    );
  }
}
