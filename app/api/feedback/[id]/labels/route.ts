import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, project, feedback, feedbackLabel } from '@/lib/db';
import { eq } from 'drizzle-orm';
import type { AddLabelRequest } from '@/types/feedback';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/feedback/[id]/labels
 * Add a label to a feedback item
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const feedbackId = parseInt(id);

    if (isNaN(feedbackId)) {
      return NextResponse.json(
        { error: 'Invalid feedback ID' },
        { status: 400 }
      );
    }

    const body: AddLabelRequest = await request.json();

    if (!body.label || body.label.trim().length === 0) {
      return NextResponse.json(
        { error: 'Label is required' },
        { status: 400 }
      );
    }

    // Verify feedback exists and user owns the project
    const [feedbackData] = await db
      .select({
        feedback: feedback,
        project: project,
      })
      .from(feedback)
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(eq(feedback.id, feedbackId))
      .limit(1);

    if (!feedbackData) {
      return NextResponse.json(
        { error: 'Feedback not found' },
        { status: 404 }
      );
    }

    if (feedbackData.project.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Add label
    const [newLabel] = await db
      .insert(feedbackLabel)
      .values({
        feedbackId,
        label: body.label.trim(),
      })
      .returning();

    return NextResponse.json(newLabel, { status: 201 });
  } catch (error) {
    console.error('Error adding label:', error);
    return NextResponse.json(
      { error: 'Failed to add label' },
      { status: 500 }
    );
  }
}
