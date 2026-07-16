import { NextResponse } from 'next/server';
import {
  cacheHeaders,
  getConcept,
  isOntologyNodeNotFoundError,
} from '@/lib/ontology';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const response = await getConcept(slug);
    return NextResponse.json(response, {
      headers: cacheHeaders(response.meta.ontologyVersion),
    });
  } catch (error) {
    if (isOntologyNodeNotFoundError(error)) {
      return NextResponse.json(
        {
          error: 'concept_not_found',
          message: '요청한 관찰 항목을 찾을 수 없습니다.',
        },
        { status: 404, headers: cacheHeaders(null) }
      );
    }
    throw error;
  }
}
