import { NextRequest, NextResponse } from 'next/server';
import { cacheHeaders, searchNodes } from '@/lib/ontology';
import { validateSearchQuery } from '@/lib/search-policy';

export async function GET(request: NextRequest) {
  const validation = validateSearchQuery(request.nextUrl.searchParams.get('q'));
  if (!validation.ok) {
    return NextResponse.json(
      {
        error: validation.error,
        message: validation.message,
      },
      { status: 400, headers: cacheHeaders(null) }
    );
  }

  const response = await searchNodes(validation.query);
  return NextResponse.json(response, {
    headers: cacheHeaders(response.meta.ontologyVersion),
  });
}
