import { test as setup } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { login } from './support/auth';
import { testUsers } from './support/test-users';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const authDir = path.join(__dirname, '.auth');

setup('generate auth storage states', async ({ browser }) => {
  fs.mkdirSync(authDir, { recursive: true });

  for (const user of Object.values(testUsers)) {
    const context = await browser.newContext();
    const page = await context.newPage();
    // Set longer timeout for auth setup
    page.setDefaultTimeout(120000);
    try {
      await login(page, user);
      await context.storageState({ path: path.join(authDir, `${user.label}.json`) });
    } catch (error) {
      console.error(`Failed to login as ${user.label}:`, error);
      throw error;
    } finally {
      await context.close();
    }
  }
});
