import { expect, test } from '@playwright/test';

test('search API accepts normal queries and rejects overlong queries', async ({
  request,
}) => {
  const valid = await request.get('/api/search?q=화장실');
  expect(valid.status()).toBe(200);
  const validPayload = await valid.json();
  expect(validPayload.data.query).toBe('화장실');
  expect(validPayload.data.count).toBeGreaterThan(0);

  const overlongQuery = '화'.repeat(161);
  const invalid = await request.get(
    `/api/search?q=${encodeURIComponent(overlongQuery)}`
  );
  expect(invalid.status()).toBe(400);
  const invalidPayload = await invalid.json();
  expect(invalidPayload.error).toBe('search_query_too_long');
});

test('detail APIs return 404 JSON for unknown slugs', async ({ request }) => {
  const scenario = await request.get('/api/scenarios/not-a-real-slug');
  expect(scenario.status()).toBe(404);
  await expect(scenario.json()).resolves.toMatchObject({
    error: 'scenario_not_found',
  });

  const concept = await request.get('/api/concepts/not-a-real-slug');
  expect(concept.status()).toBe(404);
  await expect(concept.json()).resolves.toMatchObject({
    error: 'concept_not_found',
  });

  const evidence = await request.get('/api/concepts/not-a-real-slug/evidence');
  expect(evidence.status()).toBe(404);
  await expect(evidence.json()).resolves.toMatchObject({
    error: 'concept_not_found',
  });
});

test('health API reuses ontology metadata from stats API', async ({ request }) => {
  const [healthResponse, statsResponse] = await Promise.all([
    request.get('/api/health'),
    request.get('/api/stats'),
  ]);

  expect(healthResponse.status()).toBe(200);
  expect(statsResponse.status()).toBe(200);

  const health = await healthResponse.json();
  const stats = await statsResponse.json();

  expect(health.meta.ontologyVersion).toBe(stats.meta.ontologyVersion);
  expect(health.meta.snapshotDate).toBe(stats.meta.snapshotDate);
  expect(health.data.nodes).toBe(stats.data.nodes);
  expect(health.data.scenarios).toBe(stats.data.scenarios);
});
