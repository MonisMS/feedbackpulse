import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db, project } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateProjectKey, generateEmbedScript } from '@/lib/project-utils';
import type { CreateProjectRequest, CreateProjectResponse } from '@/types/project';

/**
 * GET /api/projects
 * Retrieves all projects for the authenticated user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's projects
    const userProjects = await db
      .select()
      .from(project)
      .where(eq(project.userId, parseInt(session.user.id)));

    return NextResponse.json(userProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Creates a new project for the authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateProjectRequest = await request.json();
    
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Generate unique project key
    let projectKey = generateProjectKey();
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure uniqueness (unlikely to collide, but checking anyway)
    while (!isUnique && attempts < maxAttempts) {
      const existing = await db
        .select()
        .from(project)
        .where(eq(project.projectKey, projectKey))
        .limit(1);

      if (existing.length === 0) {
        isUnique = true;
      } else {
        projectKey = generateProjectKey();
        attempts++;
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        { error: 'Failed to generate unique project key' },
        { status: 500 }
      );
    }

    // Create project
    const [newProject] = await db
      .insert(project)
      .values({
        userId: parseInt(session.user.id),
        name: body.name.trim(),
        projectKey,
      })
      .returning();

    // Generate embed script
    const embedScript = generateEmbedScript(newProject.projectKey);

    const response: CreateProjectResponse = {
      id: newProject.id,
      name: newProject.name,
      projectKey: newProject.projectKey,
      embedScript,
      createdAt: newProject.createdAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
