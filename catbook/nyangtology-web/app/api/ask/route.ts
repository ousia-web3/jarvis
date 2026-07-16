import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { askQuestion } from '@/lib/ontology';

export const runtime = 'nodejs';

const AskRequestSchema = z.object({
  question: z.string().trim().min(2).max(160),
  catId: z.string().trim().max(80).optional().nullable(),
});

function noStoreHeaders(ontologyVersion?: string | null): HeadersInit {
  return {
    'Cache-Control': 'no-store',
    'X-Ontology-Version': ontologyVersion ?? 'unknown',
  };
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: '질문을 JSON 형식으로 보내주세요.' },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const parsed = AskRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '질문을 2자 이상 160자 이하로 적어주세요.' },
      { status: 400, headers: noStoreHeaders() }
    );
  }

  const response = await askQuestion(
    parsed.data.question,
    parsed.data.catId ?? null
  );

  return NextResponse.json(response, {
    headers: noStoreHeaders(response.meta.ontologyVersion),
  });
}
