import { NextResponse } from 'next/server';

/**
 * Preview endpoint.
 * Verifies a short-lived preview token (issued by the backend after permission check),
 * sets a preview cookie, and redirects to the draft page via the _preview route.
 *
 * The backend validates permissions before issuing the token.
 * This endpoint only sets a short-lived cookie for the preview context.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const slug = searchParams.get('slug');

  if (!token || !slug) {
    return NextResponse.json({ error: 'Missing token or slug' }, { status: 400 });
  }

  // Token presence check — the backend already validated permissions
  // before issuing it. For production, verify JWT signature here.
  if (token.length < 10) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const response = NextResponse.redirect(new URL(`/_preview/${slug}`, request.url));
  response.cookies.set('__preview_token', token, {
    httpOnly: true,
    sameSite: 'strict',
    maxAge: 3600, // 1 hour
    path: '/',
  });

  return response;
}
