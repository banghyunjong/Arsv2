/**
 * Architecture Boundary Linter
 *
 * Validates that package imports follow the dependency law:
 *   Types(0) → Config(1) → Repo(2) → Service(3) → Runtime(4) → UI(5)
 *
 * A package may only import from packages at a LOWER layer number.
 *
 * Usage: ts-node tools/linters/arch-boundary.ts
 * Exit code: 0 = pass, 1 = violations found
 */

import * as fs from 'fs';
import * as path from 'path';

const LAYER_MAP: Record<string, number> = {
  '@arsv2/types': 0,
  '@arsv2/config': 1,
  '@arsv2/repo': 2,
  '@arsv2/service': 3,
  '@arsv2/runtime': 4,
  '@arsv2/ui': 5,
};

const PACKAGE_DIR_TO_NAME: Record<string, string> = {
  types: '@arsv2/types',
  config: '@arsv2/config',
  repo: '@arsv2/repo',
  service: '@arsv2/service',
  runtime: '@arsv2/runtime',
  ui: '@arsv2/ui',
};

const MAX_FILE_LINES = 300;

interface Violation {
  file: string;
  line: number;
  message: string;
  fix: string;
}

function findTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...findTsFiles(fullPath));
    } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

function getPackageName(filePath: string): string | null {
  const packagesDir = path.join(process.cwd(), 'packages');
  const relative = path.relative(packagesDir, filePath);
  const dirName = relative.split(path.sep)[0];
  return PACKAGE_DIR_TO_NAME[dirName] || null;
}

function checkFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const packageName = getPackageName(filePath);

  if (!packageName) return violations;

  const currentLayer = LAYER_MAP[packageName];
  if (currentLayer === undefined) return violations;

  // Check file length
  if (lines.length > MAX_FILE_LINES) {
    violations.push({
      file: filePath,
      line: lines.length,
      message: `File exceeds ${MAX_FILE_LINES} line limit (${lines.length} lines)`,
      fix: `Split this file into smaller modules. Each file should have a single responsibility and stay under ${MAX_FILE_LINES} lines.`,
    });
  }

  // Check import violations
  const importRegex = /(?:import|from)\s+['"](@arsv2\/[a-z]+)['"]/g;

  for (let i = 0; i < lines.length; i++) {
    let match: RegExpExecArray | null;
    importRegex.lastIndex = 0;

    while ((match = importRegex.exec(lines[i])) !== null) {
      const importedPackage = match[1];
      const importedLayer = LAYER_MAP[importedPackage];

      if (importedLayer === undefined) continue;

      if (importedLayer >= currentLayer) {
        violations.push({
          file: filePath,
          line: i + 1,
          message: `Layer violation: ${packageName} (Layer ${currentLayer}) imports ${importedPackage} (Layer ${importedLayer})`,
          fix: `Move this dependency to a lower layer, or extract the shared code into a package at Layer ${Math.min(currentLayer, importedLayer) - 1} or below. Dependency law: Types(0) → Config(1) → Repo(2) → Service(3) → Runtime(4) → UI(5). A package may ONLY import from lower-numbered layers.`,
        });
      }
    }
  }

  return violations;
}

function main() {
  const packagesDir = path.join(process.cwd(), 'packages');
  const allFiles = findTsFiles(packagesDir);
  const allViolations: Violation[] = [];

  for (const file of allFiles) {
    allViolations.push(...checkFile(file));
  }

  if (allViolations.length === 0) {
    console.log('✓ Architecture boundary check passed. No violations found.');
    process.exit(0);
  }

  console.error(`✗ ${allViolations.length} architecture violation(s) found:\n`);

  for (const v of allViolations) {
    const relative = path.relative(process.cwd(), v.file);
    console.error(`  ${relative}:${v.line}`);
    console.error(`    ERROR: ${v.message}`);
    console.error(`    FIX: ${v.fix}`);
    console.error('');
  }

  process.exit(1);
}

main();
