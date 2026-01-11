import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function ensureFileExists(filePath: string) {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, '');
  }
}

function upsertEnvLine(envContent: string, key: string, value: string) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  if (pattern.test(envContent)) return envContent.replace(pattern, line);
  return `${envContent.trimEnd()}\n${line}\n`;
}

export default async function globalSetup() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../../../');
  const envExamplePath = path.join(projectRoot, '.env.e2e.example');
  const envPath = path.join(projectRoot, '.env.e2e');

  if (!fs.existsSync(envPath)) {
    fs.copyFileSync(envExamplePath, envPath);
  }

  const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:8011';
  const dbFilePath = path.join(projectRoot, 'database/database.e2e.sqlite');

  // Force cleanup of any existing database and WAL files
  if (fs.existsSync(dbFilePath)) {
    fs.unlinkSync(dbFilePath);
  }
  ['-wal', '-shm'].forEach(ext => {
    const walFile = dbFilePath + ext;
    if (fs.existsSync(walFile)) {
      fs.unlinkSync(walFile);
    }
  });

  // Ensure fresh database file exists
  ensureFileExists(dbFilePath);

  const envRaw = fs.readFileSync(envPath, 'utf8');
  const envUpdated = [
    ['APP_URL', baseUrl],
    ['DB_DATABASE', 'database/database.e2e.sqlite'],
    ['DB_FOREIGN_KEYS', 'true'],
    ['DB_BUSY_TIMEOUT', '30000'],
    ['DB_SQLITE_JOURNAL_MODE', 'WAL'],
    ['APP_ENV', 'e2e'],
    ['APP_DEBUG', 'false'],
    ['QUEUE_CONNECTION', 'sync'],
    ['MAIL_MAILER', 'log'],
  ].reduce((acc, [key, value]) => upsertEnvLine(acc, key, value), envRaw);
  fs.writeFileSync(envPath, envUpdated);

  const manifestPath = path.join(projectRoot, 'public/build/manifest.json');

  execSync('php artisan key:generate --env=e2e --force', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  execSync('php artisan migrate:fresh --seed --env=e2e', {
    cwd: projectRoot,
    stdio: 'inherit',
  });

  // Run WAL checkpoint after migration to ensure database consistency
  // This is important for SQLite in WAL mode to ensure all changes are flushed
  if (fs.existsSync(dbFilePath)) {
    try {
      // Check if sqlite3 command is available
      execSync('which sqlite3', { stdio: 'ignore' });

      execSync(`sqlite3 "${dbFilePath}" "PRAGMA wal_checkpoint(TRUNCATE);"`, {
        cwd: projectRoot,
        stdio: 'inherit',
      });
    } catch (error) {
      // Log warning but don't fail - sqlite3 CLI might not be installed
      console.warn('Warning: WAL checkpoint skipped after migration (sqlite3 not available)');
    }
  }

  if (!fs.existsSync(manifestPath)) {
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
  }
}
