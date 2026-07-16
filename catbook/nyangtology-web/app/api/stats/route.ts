import { NextResponse } from 'next/server';
import { cacheHeaders, getStats } from '@/lib/ontology';

export async function GET() {
  const response = await getStats();
  return NextResponse.json(response, {
    headers: cacheHeaders(response.meta.ontologyVersion),
  });
}
