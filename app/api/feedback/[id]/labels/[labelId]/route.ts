import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, project, feedback, feedbackLabel } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{
    id: string;
    labelId: string;
  }>;
}

/**
 * DELETE /api/feedback/[id]/labels/[labelId]
 * Remove a label from a feedback item
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, labelId } = await params;
    const feedbackId = parseInt(id);
    const labelIdNum = parseInt(labelId);

    if (isNaN(feedbackId) || isNaN(labelIdNum)) {
      return NextResponse.json(
        { error: 'Invalid ID' },
        { status: 400 }
      );
    }

    // Verify label exists and user owns the project
    const [labelData] = await db
      .select({
        label: feedbackLabel,
        feedback: feedback,
        project: project,
      })
      .from(feedbackLabel)
      .innerJoin(feedback, eq(feedbackLabel.feedbackId, feedback.id))
      .innerJoin(project, eq(feedback.projectId, project.id))
      .where(
        and(
          eq(feedbackLabel.id, labelIdNum),
          eq(feedbackLabel.feedbackId, feedbackId)
        )
      )
      .limit(1);

    if (!labelData) {
      return NextResponse.json(
        { error: 'Label not found' },
        { status: 404 }
      );
    }

    if (labelData.project.userId !== parseInt(session.user.id)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Delete label
    await db
      .delete(feedbackLabel)
      .where(eq(feedbackLabel.id, labelIdNum));

    return NextResponse.json(
      { message: 'Label removed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error removing label:', error);
    return NextResponse.json(
      { error: 'Failed to remove label' },
      { status: 500 }
    );
  }
}
