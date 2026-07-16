import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message: { type: () => string; text: () => string }) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  return errors;
}

test('home keeps six frequently asked question cards text-only', async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.goto('/');

  const cards = page.locator('.questionCard');
  await expect(cards).toHaveCount(6);
  await expect(page.locator('.questionCard img')).toHaveCount(0);
  await expect(page.locator('.questionCard .aiGeneratedBadge')).toHaveCount(0);

  for (const card of await cards.all()) {
    await expect(card.locator('h3')).not.toBeEmpty();
    await expect(card.locator('p')).not.toBeEmpty();
    await expect(card).toHaveAttribute('href', /\/ask\?question=/);
  }

  expect(consoleErrors).toEqual([]);
});

test('explore renders eleven text-only scenario cards', async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/explore');

  const scenarioCards = page.locator('.scenarioLinkCard');
  await expect(scenarioCards).toHaveCount(11);
  await expect(page.locator('.scenarioLinkCard img')).toHaveCount(0);
  await expect(page.locator('.scenarioLinkCard .aiGeneratedBadge')).toHaveCount(0);
  await expect(page.locator('.conceptGrid img')).toHaveCount(0);

  for (const card of await scenarioCards.all()) {
    await expect(card.locator('h2')).not.toBeEmpty();
    await expect(card.locator('p')).not.toBeEmpty();
  }

  expect(consoleErrors).toEqual([]);
});

test('scenario, concept, and chapter detail routes resolve their Cat-first V5 assets', async ({
  page,
}) => {
  const consoleErrors = collectConsoleErrors(page);
  const cases = [
    ['/scenarios/hissing', /images%2Fv2%2Fscenarios%2Fhissing/],
    ['/concepts/knowledge-breed-context', /images%2Fv2%2Fconcepts%2Fknowledge-breed-context/],
    ['/concepts/chapter-37', /images%2Fv2%2Fchapters%2Fchapter-37/],
  ] as const;

  for (const [route, srcPattern] of cases) {
    await page.goto(route);
    const image = page.locator('.scenarioVisualImage img').first();
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute('src', srcPattern);
    await expect(image).toHaveAttribute('alt', /[가-힣]/);
    await expect
      .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);
    await expect(page.locator('.scenarioVisualCard .aiGeneratedBadge')).toBeVisible();
    await expect(page.locator('.detailGrid aside.stack img')).toHaveCount(0);
  }

  expect(consoleErrors).toEqual([]);
});

test('text-only lists and detail visual remain usable at four review widths', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const viewports = [
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 768, height: 1024 },
    { width: 1280, height: 900 },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    await page.goto('/');
    await expect(page.locator('.questionCard')).toHaveCount(6);
    await expect(page.locator('.questionCard img')).toHaveCount(0);

    await page.goto('/explore');
    await expect(page.locator('.scenarioLinkCard')).toHaveCount(11);
    await expect(page.locator('.scenarioLinkCard img')).toHaveCount(0);
    await expect(page.locator('.conceptGrid img')).toHaveCount(0);

    await page.goto('/concepts/chapter-37');
    const detailImage = page.locator('.scenarioVisualImage img').first();
    await expect(detailImage).toBeVisible();
    await expect
      .poll(() => detailImage.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);

    const box = await page.locator('.scenarioVisualImage').boundingBox();
    expect(box?.width ?? 0).toBeGreaterThan(0);
    expect(box?.width ?? viewport.width + 1).toBeLessThanOrEqual(viewport.width);
  }
});
