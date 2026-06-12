const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');
const backendSrc = path.join(rootDir, 'backend/src');
const frontendSrc = path.join(rootDir, 'frontend/src');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        results = results.concat(walk(fullPath));
      }
    } else {
      results.push({
        path: fullPath,
        relPath: path.relative(rootDir, fullPath),
        size: stat.size
      });
    }
  });
  return results;
}

console.log('Scanning files...');
const backendFiles = walk(backendSrc);
const frontendFiles = walk(frontendSrc);
const allFiles = [...backendFiles, ...frontendFiles];

console.log(`Found ${backendFiles.length} backend files and ${frontendFiles.length} frontend files.`);

const fileSet = new Set(allFiles.map(f => f.path));

function resolveImport(sourceFile, importStr) {
  let resolved = null;

  if (importStr.startsWith('@/')) {
    // Frontend alias
    resolved = path.resolve(frontendSrc, importStr.slice(2));
  } else if (importStr.startsWith('.')) {
    const dir = path.dirname(sourceFile);
    resolved = path.resolve(dir, importStr);
  } else {
    // Maybe an absolute style import within backend (e.g. import from 'src/...')
    // NestJS sometimes uses paths relative to src
    if (sourceFile.includes('backend/src')) {
      if (importStr.startsWith('src/')) {
        resolved = path.resolve(backendSrc, '..', importStr);
      }
    }
  }

  if (resolved) {
    const exts = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
    for (const ext of exts) {
      const p = resolved + ext;
      if (fileSet.has(p)) return p;
    }
    if (fileSet.has(resolved)) return resolved;
  }
  return null;
}

const graph = {};
allFiles.forEach(file => {
  if (!file.path.endsWith('.ts') && !file.path.endsWith('.tsx') && !file.path.endsWith('.js') && !file.path.endsWith('.jsx')) return;
  try {
    const content = fs.readFileSync(file.path, 'utf-8');
    const importRegex = /(?:import|from|require)\s+['"]([^'"]+)['"]/g;
    let match;
    const imports = [];
    while ((match = importRegex.exec(content)) !== null) {
      const resolved = resolveImport(file.path, match[1]);
      if (resolved) {
        imports.push(resolved);
      }
    }
    graph[file.path] = imports;
  } catch (err) {
    // Ignore errors
  }
});

// 1. Detect cyclic dependencies
const visited = {};
const recStack = {};
const cycles = [];

function findCycles(node, pathTrace = []) {
  if (!visited[node]) {
    visited[node] = true;
    recStack[node] = true;
    pathTrace.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (!visited[neighbor]) {
        findCycles(neighbor, [...pathTrace]);
      } else if (recStack[neighbor]) {
        const cycleStartIdx = pathTrace.indexOf(neighbor);
        if (cycleStartIdx !== -1) {
          cycles.push(pathTrace.slice(cycleStartIdx).concat(neighbor));
        }
      }
    }
  }
  recStack[node] = false;
}

Object.keys(graph).forEach(node => {
  findCycles(node);
});

console.log('\n--- Cyclic Dependencies ---');
if (cycles.length === 0) {
  console.log('None detected!');
} else {
  console.log(`Found ${cycles.length} cycles:`);
  cycles.slice(0, 15).forEach((cycle, idx) => {
    console.log(`Cycle ${idx + 1}:`);
    cycle.forEach(p => console.log(`  -> ${path.relative(rootDir, p)}`));
  });
}

// 2. Detect dead code / unused files (files with 0 incoming dependencies)
const incomingRefs = {};
allFiles.forEach(file => {
  incomingRefs[file.path] = 0;
});

Object.values(graph).forEach(imports => {
  imports.forEach(imp => {
    incomingRefs[imp] = (incomingRefs[imp] || 0) + 1;
  });
});

console.log('\n--- Potentially Unused Files (0 incoming imports) ---');
const entryPoints = [
  'backend/src/main.ts',
  'backend/src/app.module.ts',
  'backend/src/app.controller.ts',
  'backend/src/app.service.ts',
  'backend/validation-runner.ts',
  'frontend/src/middleware.ts'
];

const unusedFiles = [];
allFiles.forEach(file => {
  const rel = file.relPath;
  // Skip entry points, tests, next.js pages/layouts (which are loaded by Next.js router, not imported), configuration, or markdown files
  if (
    entryPoints.includes(rel) ||
    rel.includes('\\app\\') || rel.includes('/app/') || // Next.js pages/layouts
    rel.endsWith('.spec.ts') ||
    rel.endsWith('.test.ts') ||
    rel.endsWith('.md') ||
    rel.endsWith('.json') ||
    rel.endsWith('.txt') ||
    rel.endsWith('.css') ||
    rel.includes('scratch/')
  ) {
    return;
  }

  if (incomingRefs[file.path] === 0) {
    unusedFiles.push(file);
    console.log(`Unused: ${rel} (${file.size} bytes)`);
  }
});

// Output results to a json file
const analysisResult = {
  totalFiles: allFiles.length,
  backendCount: backendFiles.length,
  frontendCount: frontendFiles.length,
  cycles: cycles.map(c => c.map(p => path.relative(rootDir, p))),
  unused: unusedFiles.map(f => f.relPath)
};

fs.writeFileSync(path.join(__dirname, 'analysis_report.json'), JSON.stringify(analysisResult, null, 2));
console.log('\nAnalysis completed. Report written to backend/scratch/analysis_report.json');
