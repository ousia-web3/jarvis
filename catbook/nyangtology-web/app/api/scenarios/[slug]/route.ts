import { NextResponse } from 'next/server';
import {
  cacheHeaders,
  getScenario,
  isOntologyNodeNotFoundError,
} from '@/lib/ontology';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const response = await getScenario(slug);
    return NextResponse.json(response, {
      headers: cacheHeaders(response.meta.ontologyVersion),
    });
  } catch (error) {
    if (isOntologyNodeNotFoundError(error)) {
      return NextResponse.json(
        {
          error: 'scenario_not_found',
          message: '요청한 상황을 찾을 수 없습니다.',
        },
        { status: 404, headers: cacheHeaders(null) }
      );
    }
    throw error;
  }
}
