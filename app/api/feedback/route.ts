import { NextRequest, NextResponse } from 'next/server';
import { db, project, feedback } from '@/lib/db';
import { eq } from 'drizzle-orm';

interface FeedbackRequest {
  projectKey: string;
  type: string;
  message: string;
  userName?: string | null;
  userEmail?: string | null;
}

/**
 * POST /api/feedback
 * Public endpoint to submit feedback (no authentication required)
 * Used by the widget on external websites
 */
export async function POST(request: NextRequest) {
  try {
    const body: FeedbackRequest = await request.json();

    // Validate required fields
    if (!body.projectKey || !body.type || !body.message) {
      return NextResponse.json(
        { error: 'Missing required fields: projectKey, type, message' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Validate feedback type
    const validTypes = ['bug', 'feature', 'other'];
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid feedback type. Must be: bug, feature, or other' },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Verify project exists
    const [existingProject] = await db
      .select()
      .from(project)
      .where(eq(project.projectKey, body.projectKey))
      .limit(1);

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Invalid project key' },
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // Save feedback
    const [newFeedback] = await db
      .insert(feedback)
      .values({
        projectId: existingProject.id,
        type: body.type,
        message: body.message.trim(),
        userName: body.userName?.trim() || null,
        userEmail: body.userEmail?.trim() || null,
        sentiment: null, // Can be analyzed later
      })
      .returning();

    return NextResponse.json(
      { 
        success: true,
        id: newFeedback.id,
        message: 'Feedback submitted successfully'
      },
      { 
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

/**
 * OPTIONS /api/feedback
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    }
  );
}
