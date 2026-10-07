import { ExampleApi } from '../../../api/example.api';
import { expect, test } from '../../../fixtures/base.fixture';

test('SAMPLE-API-TC-001 GET /health trả JSON thành công', { tag: ['@module:health', '@health', '@api'] }, async ({ request }) => {
  const response = await new ExampleApi(request).health();
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type'] || '').toContain('application/json');
  expect(await response.json()).not.toBeNull();
});
