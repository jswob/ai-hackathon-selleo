#!/usr/bin/env bun
/**
 * Schema Changes Check Script
 *
 * This script checks if there are uncommitted database schema changes
 * by running drizzle-kit generate and using git to detect new files.
 *
 * Used by pre-commit hooks to ensure all schema changes have corresponding
 * migration files before committing.
 *
 * Exit codes:
 * - 0: No schema changes detected
 * - 1: Uncommitted schema changes detected (blocks commit)
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '../../.env');
const SCHEMA_DEPENDENCIES = ['apps/api/src/db/schema/'];
const DRIZZLE_FOLDER = 'apps/api/drizzle/';

function checkStagedSchemaDependencies(): boolean {
	try {
		const stagedFiles = execSync('git diff --cached --name-only', {
			stdio: 'pipe',
			cwd: join(process.cwd(), '../..'),
		})
			.toString()
			.split('\n')
			.filter(Boolean);

		const stagedSchemaDeps = stagedFiles.filter(file =>
			SCHEMA_DEPENDENCIES.some(dep => file.startsWith(dep))
		);

		const stagedDrizzleFiles = stagedFiles.filter(file => file.startsWith(DRIZZLE_FOLDER));

		if (stagedSchemaDeps.length === 0 && stagedDrizzleFiles.length === 0) {
			console.log('ℹ️  No schema-related files staged, skipping schema check');
			return false;
		}

		console.log('📋 Found staged schema-related files:');
		if (stagedSchemaDeps.length > 0) {
			console.log('  Schema dependencies:');
			stagedSchemaDeps.forEach(file => console.log(`    - ${file}`));
		}
		if (stagedDrizzleFiles.length > 0) {
			console.log('  Migration files:');
			stagedDrizzleFiles.forEach(file => console.log(`    - ${file}`));
		}

		return true;
	} catch (error) {
		console.error('❌ Failed to check staged files:', String(error));
		return true; // Proceed with check on error to be safe
	}
}

function checkAllDependenciesStaged(): boolean {
	try {
		const allStatus = execSync('git status --porcelain', {
			stdio: 'pipe',
			cwd: join(process.cwd(), '../..'),
		}).toString();

		const unstagedSchemaDeps: string[] = [];

		allStatus.split('\n').forEach(line => {
			if (!line.trim()) return;

			const status = line.substring(0, 2);
			const file = line.substring(3);

			// Check for unstaged changes in schema dependencies
			// Status codes: ' M' (modified unstaged), 'MM' (modified staged and unstaged)
			if (
				(status[1] === 'M' || status === ' M') &&
				SCHEMA_DEPENDENCIES.some(dep => file.startsWith(dep))
			) {
				unstagedSchemaDeps.push(file);
			}
		});

		if (unstagedSchemaDeps.length > 0) {
			console.error('❌ Found unstaged changes in schema dependencies!');
			console.error('📄 These schema files have unstaged changes:');
			unstagedSchemaDeps.forEach(file => {
				console.error(`  - ${file}`);
			});
			console.error('');
			console.error('To fix this:');
			console.error('  - Stage all schema changes: git add <files>');
			console.error('  - Or revert unstaged changes: git checkout -- <files>');
			console.error('');
			console.error('Schema check requires ALL dependencies to be staged to ensure consistency.');
			return false;
		}

		return true;
	} catch (error) {
		console.error('❌ Failed to check dependency staging:', String(error));
		return false;
	}
}

function checkUnstagedDrizzleChanges(): boolean {
	try {
		const statusOutput = execSync('git status --porcelain drizzle/', {
			stdio: 'pipe',
			cwd: process.cwd(),
		})
			.toString()
			.trim();

		if (!statusOutput) {
			return true;
		}

		// Parse status output to find truly unstaged changes
		const unstagedLines: string[] = [];

		statusOutput.split('\n').forEach(line => {
			if (!line.trim()) return;

			const status = line.substring(0, 2);

			// Check for unstaged changes
			// ' M' = modified unstaged, 'MM' = modified staged and unstaged, '??' = untracked
			// We ignore 'A ' (staged for addition) and 'M ' (staged for modification)
			if (status[1] === 'M' || status === ' M' || status === '??') {
				unstagedLines.push(line);
			}
		});

		if (unstagedLines.length > 0) {
			console.error('❌ Found unstaged changes in drizzle/ directory!');
			console.error('📄 Please handle these changes first:');
			unstagedLines.forEach(line => {
				console.error(`  ${line}`);
			});
			console.error('');
			console.error('To fix this:');
			console.error('  - Stage changes: git add drizzle/');
			console.error('  - Or revert changes: git checkout -- drizzle/ && git clean -fd drizzle/');
			return false;
		}

		return true;
	} catch (error) {
		console.error('❌ Failed to check unstaged drizzle changes:', String(error));
		return false;
	}
}

function loadEnv() {
	try {
		const envContent = readFileSync(ENV_FILE, 'utf8');
		envContent.split('\n').forEach(line => {
			const [key, value] = line.split('=');
			if (key && value && !key.startsWith('#')) {
				process.env[key.trim()] = value.trim();
			}
		});
	} catch {
		console.warn('Warning: Could not load .env file');
	}
}

function checkSchemaChanges(): boolean {
	console.log('🔍 Checking for uncommitted schema changes...');

	try {
		console.log('Running drizzle-kit generate...');
		execSync('bun drizzle-kit generate', {
			stdio: 'pipe',
			cwd: process.cwd(),
		});

		console.log('Checking for new migration files...');
		const gitStatus = execSync('git status --porcelain drizzle/', {
			stdio: 'pipe',
			cwd: process.cwd(),
		}).toString();

		const newFiles = gitStatus.split('\n').filter(line => line.startsWith('??'));

		if (newFiles.length > 0) {
			console.error('❌ Uncommitted schema changes detected!');
			console.error(`📄 ${newFiles.length} new migration file(s) were generated:`);
			newFiles.forEach(file => {
				console.error(`  - ${file.substring(3)}`);
			});
			console.error('');
			console.error('To fix this:');
			console.error('  1. Add migrations to your commit: git add drizzle/');
			console.error('  2. Commit again');
			console.error('');
			console.error('Or if you want to develop without migrations:');
			console.error('  - Use: bun db:push for development');
			console.error('  - Only generate migrations when ready for production');

			console.log('🧹 Cleaning up generated migration files...');
			// Revert tracked file changes (like _journal.json)
			execSync('git checkout -- drizzle/', {
				stdio: 'pipe',
				cwd: process.cwd(),
			});
			// Remove untracked files
			execSync('git clean -fd drizzle/', {
				stdio: 'pipe',
				cwd: process.cwd(),
			});

			return true;
		}

		console.log('✅ No uncommitted schema changes detected');
		return false;
	} catch (error) {
		const errorOutput = String(error);
		if (errorOutput.includes('No schema changes')) {
			console.log('✅ No schema changes detected');
			return false;
		}

		console.error('❌ Failed to check schema changes:', errorOutput);

		console.log('🧹 Attempting to clean up any generated files...');
		try {
			execSync('git checkout -- drizzle/', {
				stdio: 'pipe',
				cwd: process.cwd(),
			});
			execSync('git clean -fd drizzle/', {
				stdio: 'pipe',
				cwd: process.cwd(),
			});
		} catch {
			// Ignore cleanup errors
		}

		return true;
	}
}

function main() {
	loadEnv();

	// Step 1: Check if schema dependencies or drizzle files are staged
	if (!checkStagedSchemaDependencies()) {
		process.exit(0);
	}

	// Step 2: Check if ALL modified schema dependencies are staged
	if (!checkAllDependenciesStaged()) {
		process.exit(1);
	}

	// Step 3: Check for unstaged drizzle changes
	if (!checkUnstagedDrizzleChanges()) {
		process.exit(1);
	}

	// Step 4: Run generate and check for differences
	const hasChanges = checkSchemaChanges();

	if (hasChanges) {
		process.exit(1);
	}

	console.log('🎉 Schema check passed');
	process.exit(0);
}

try {
	main();
} catch (error) {
	console.error('Schema check failed:', error);
	process.exit(1);
}
