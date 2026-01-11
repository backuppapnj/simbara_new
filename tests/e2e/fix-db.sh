#!/bin/bash
# Cleanup script for corrupted E2E database

echo "Stopping all processes..."
pkill -f "php artisan serve" 2>/dev/null || true
pkill -f "playwright" 2>/dev/null || true
sleep 2

echo "Cleaning database files..."
rm -f database/database.e2e.sqlite*
rm -f database/database.e2e.sqlite-wal
rm -f database/database.e2e.sqlite-shm

echo "Database cleaned. Ready for tests."
