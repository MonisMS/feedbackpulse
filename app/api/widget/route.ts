import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

/**
 * GET /api/widget
 * Serves the widget.js file with proper headers for cross-domain embedding
 */
export async function GET() {
  try {
    const widgetPath = join(process.cwd(), 'public', 'widget.js');
    const widgetContent = await readFile(widgetPath, 'utf-8');

    return new NextResponse(widgetContent, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving widget:', error);
    return NextResponse.json(
      { error: 'Widget not found' },
      { status: 404 }
    );
  }
}

/**
 * OPTIONS /api/widget
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
