import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Global teardown for E2E tests.
 *
 * This runs after all E2E tests complete to:
 * - Run WAL checkpoint to ensure all changes are written to the main database file
 * - Clean up any temporary files if needed
 */
export default async function globalTeardown() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const projectRoot = path.resolve(__dirname, '../../../');
  const dbFilePath = path.join(projectRoot, 'database/database.e2e.sqlite');

  // If database exists, run WAL checkpoint to ensure all changes are persisted
  if (fs.existsSync(dbFilePath)) {
    try {
      // Run WAL checkpoint to flush all changes to main database file
      // This is important for SQLite in WAL mode to ensure database consistency
      execSync(`sqlite3 "${dbFilePath}" "PRAGMA wal_checkpoint(TRUNCATE);"`, {
        cwd: projectRoot,
        stdio: 'inherit',
      });
    } catch (error) {
      // Log error but don't fail the teardown
      console.warn('Warning: WAL checkpoint failed:', error);
    }

    // Optional: Clean up WAL files after checkpoint
    ['-wal', '-shm'].forEach((ext) => {
      const walFile = dbFilePath + ext;
      if (fs.existsSync(walFile)) {
        try {
          fs.unlinkSync(walFile);
        } catch (error) {
          // Log warning but don't fail
          console.warn(`Warning: Failed to remove ${walFile}:`, error);
        }
      }
    });
  }

  console.log('E2E global teardown completed');
}
