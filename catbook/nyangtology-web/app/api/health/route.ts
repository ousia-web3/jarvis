import { NextResponse } from 'next/server';
import { cacheHeaders, getStats } from '@/lib/ontology';

export async function GET() {
  const stats = await getStats();
  return NextResponse.json(
    {
      data: {
        status: 'ok',
        service: 'nyangtology-web',
        mode: 'read-only',
        nodes: stats.data.nodes,
        scenarios: stats.data.scenarios,
      },
      meta: stats.meta,
    },
    {
      headers: cacheHeaders(stats.meta.ontologyVersion),
    }
  );
}
