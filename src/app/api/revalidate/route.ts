import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * Revalidation endpoint called by the NestJS backend after publish/unpublish.
 * Protected by a shared secret header.
 */
export async function POST(request: Request) {
  const secret = request.headers.get('x-revalidation-secret');
  const expectedSecret = process.env.REVALIDATION_SECRET;

  if (!expectedSecret || secret !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { type?: string; slug?: string };
    if (!body.type || !body.slug) {
      return NextResponse.json({ error: 'Missing type or slug' }, { status: 400 });
    }

    revalidateTag(`${body.type}:${body.slug}`);
    return NextResponse.json({ revalidated: true, type: body.type, slug: body.slug });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
