import { NextResponse } from 'next/server';
import { cacheHeaders, getScenarios } from '@/lib/ontology';

export async function GET() {
  const response = await getScenarios();
  return NextResponse.json(response, {
    headers: cacheHeaders(response.meta.ontologyVersion),
  });
}
