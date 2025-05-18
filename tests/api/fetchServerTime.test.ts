// placeholder test file
import request from 'supertest';
import { test, expect } from '@playwright/test';
import { config } from '../../configs/config';

test('Fetch server time', async () => {
  const res = await request(config.baseUrl).get('/api/v3/time');
  expect(res.status).toBe(200);
});
