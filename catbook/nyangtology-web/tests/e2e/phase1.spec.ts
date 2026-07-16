import { expect, test } from '@playwright/test';

test('sudden-run scenario leads to zoomies detail with PC breadcrumb and contextual image', async ({
  page,
}) => {
  await page.goto('/scenarios/sudden-run');

  await expect(page.getByRole('heading', { name: '갑자기 뛰어요' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '페이지 경로' })).toContainText(
    '상황별 보기'
  );

  await page.getByRole('link', { name: /우다다/ }).click();

  await expect(page).toHaveURL(/\/concepts\/signal-zoomies$/);
  await expect(page.getByRole('heading', { name: '우다다 / 갑자기 뛰기' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: '페이지 경로' })).toContainText(
    '궁금증'
  );
  await expect(page.locator('.scenarioVisualImage img')).toBeVisible();
  await expect(page.getByRole('heading', { name: '참고 영상' })).toHaveCount(0);
  await expect(page.locator('.evidenceUnavailable')).toHaveCount(0);
});

test('CONSULT_WHEN safety concept exposes non-diagnostic consultation CTA', async ({
  page,
}) => {
  await page.goto('/concepts/risk-self-diagnosis');

  await expect(page.getByRole('heading', { name: '자가진단·처방 단정' })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '전문가에게 물어볼 메모를 먼저 정리하세요' })
  ).toBeVisible();
  await expect(page.getByText('예약이나 진단 안내가 아니라')).toBeVisible();
  await expect(page.getByRole('link', { name: '상담 메모 정리하기' })).toHaveAttribute(
    'href',
    '/ask'
  );
});

test('common header titles fit on one line in the mobile channel', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });

  const paths = ['/', '/ask', '/explore', '/search', '/safety', '/about'];

  for (const path of paths) {
    await page.goto(path);

    const metrics = await page.locator('h1').first().evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const lineRects = Array.from(range.getClientRects()).filter(
        (rect) => rect.width > 0 && rect.height > 0
      );
      const elementWidth = element.getBoundingClientRect().width;
      const textWidth = Math.max(...lineRects.map((rect) => rect.width));

      range.detach();

      return {
        lineCount: lineRects.length,
        text: element.textContent?.trim(),
        textWidth,
        elementWidth,
      };
    });

    expect(metrics.lineCount, `${path}: ${metrics.text}`).toBe(1);
    expect(metrics.textWidth, `${path}: ${metrics.text}`).toBeLessThanOrEqual(
      metrics.elementWidth + 1
    );
  }
});

test('mobile sticky header sits flush with the viewport while scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, 360));

  const chrome = await page.evaluate(() => {
    const header = document.querySelector('.siteHeader');
    const footer = document.querySelector('.bottomTab');

    if (!header || !footer) {
      throw new Error('Mobile chrome elements were not found');
    }

    const headerRect = header.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();
    const headerStyles = getComputedStyle(header);

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      headerTop: headerRect.top,
      headerLeft: headerRect.left,
      headerRight: headerRect.right,
      headerRadius: headerStyles.borderTopLeftRadius,
      footerBottom: window.innerHeight - footerRect.bottom,
    };
  });

  expect(chrome.headerTop).toBeGreaterThanOrEqual(0);
  expect(chrome.headerTop).toBeLessThanOrEqual(1);
  expect(chrome.headerLeft).toBeGreaterThanOrEqual(0);
  expect(chrome.headerLeft).toBeLessThanOrEqual(1);
  expect(chrome.headerRight).toBeGreaterThanOrEqual(chrome.viewportWidth - 1);
  expect(chrome.headerRadius).toBe('0px');
  expect(Math.abs(chrome.footerBottom)).toBeLessThanOrEqual(1);
});

test('card navigation shows an instant loading landing before route transition', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('**/*scenarios/litter*', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 700));
    await route.continue();
  });

  await page.goto('/explore');
  await page.getByRole('link', { name: /화장실이 달라졌어요 상세 페이지/ }).click();

  await expect(page.getByTestId('instant-transition-overlay')).toBeVisible({
    timeout: 500,
  });
  await expect(
    page.getByRole('heading', { name: '관찰 카드를 펼치는 중이에요' })
  ).toBeVisible();

  const layout = await page.evaluate(() => {
    const overlay = document.querySelector('[data-testid="instant-transition-overlay"]');
    const loader = overlay?.querySelector('.observationLoader');
    const header = document.querySelector('.siteHeader');
    const footer = document.querySelector('.bottomTab');

    if (!overlay || !loader || !header || !footer) {
      throw new Error('Required loading layout elements were not found');
    }

    const overlayRect = overlay.getBoundingClientRect();
    const loaderRect = loader.getBoundingClientRect();
    const headerRect = header.getBoundingClientRect();
    const footerRect = footer.getBoundingClientRect();

    return {
      overlayTop: overlayRect.top,
      overlayBottom: overlayRect.bottom,
      loaderCenterY: loaderRect.top + loaderRect.height / 2,
      contentCenterY: overlayRect.top + overlayRect.height / 2,
      headerBottom: headerRect.bottom,
      footerTop: footerRect.top,
    };
  });

  expect(layout.overlayTop).toBeGreaterThanOrEqual(layout.headerBottom - 1);
  expect(layout.overlayBottom).toBeLessThanOrEqual(layout.footerTop + 1);
  expect(Math.abs(layout.loaderCenterY - layout.contentCenterY)).toBeLessThanOrEqual(2);
  await expect(page).toHaveURL(/\/scenarios\/litter$/);
});
