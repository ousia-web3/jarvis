import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const nextDir = path.join(cwd, '.next');
const outDir = path.join(cwd, 'out');
const artifactPath = path.join(cwd, 'nyangtology.ait');
const apiDir = path.join(cwd, 'app', 'api');
const tempApiDir = path.join(cwd, 'app', '_api.disabled-for-ait-build');
const publicImagesDir = path.join(cwd, 'public', 'images');
const tempPngDir = path.join(cwd, '.ait-build-temp', 'png-assets');

function psQuote(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

function movePath(source, destination) {
  if (process.platform !== 'win32') {
    fs.renameSync(source, destination);
    return;
  }

  const command = `Move-Item -LiteralPath ${psQuote(source)} -Destination ${psQuote(destination)} -Force -ErrorAction Stop`;
  const moveResult = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], {
    shell: false,
    stdio: 'inherit',
  });

  if (moveResult.error) {
    throw moveResult.error;
  }

  if (moveResult.status !== 0) {
    throw new Error(`Move-Item failed: ${source} -> ${destination}`);
  }
}

function collectPngFiles(dir, results = []) {
  if (!fs.existsSync(dir)) {
    return results;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectPngFiles(absolutePath, results);
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      results.push(absolutePath);
    }
  }

  return results;
}

function relativeFromPublicImages(filePath) {
  return path.relative(publicImagesDir, filePath);
}

function restoreMovedFiles(movedFiles) {
  for (const { source, temp } of [...movedFiles].reverse()) {
    if (!fs.existsSync(temp)) {
      continue;
    }

    fs.mkdirSync(path.dirname(source), { recursive: true });
    movePath(temp, source);
  }

  fs.rmSync(path.join(cwd, '.ait-build-temp'), {
    force: true,
    recursive: true,
  });
}

if (fs.existsSync(tempApiDir) && !fs.existsSync(apiDir)) {
  movePath(tempApiDir, apiDir);
}

if (fs.existsSync(tempPngDir)) {
  const pendingRestores = collectPngFiles(tempPngDir).map((temp) => ({
    source: path.join(publicImagesDir, path.relative(tempPngDir, temp)),
    temp,
  }));
  restoreMovedFiles(pendingRestores);
}

if (fs.existsSync(tempApiDir)) {
  console.error(`Temporary API build directory already exists: ${tempApiDir}`);
  process.exit(1);
}

fs.rmSync(nextDir, { force: true, recursive: true });
fs.rmSync(outDir, { force: true, recursive: true });
fs.rmSync(artifactPath, { force: true });

let movedApi = false;
const movedPngs = [];
let result;

try {
  if (fs.existsSync(apiDir)) {
    movePath(apiDir, tempApiDir);
    movedApi = true;
  }

  for (const source of collectPngFiles(publicImagesDir)) {
    const temp = path.join(tempPngDir, relativeFromPublicImages(source));
    fs.mkdirSync(path.dirname(temp), { recursive: true });
    movePath(source, temp);
    movedPngs.push({ source, temp });
  }

  const env = {
    ...process.env,
    AIT_STATIC_EXPORT: '1',
    NEXT_PUBLIC_AIT_STATIC_EXPORT: '1',
  };

  result = process.platform === 'win32'
    ? spawnSync('cmd.exe', ['/d', '/s', '/c', 'npx ait build'], {
        env,
        shell: false,
        stdio: 'inherit',
      })
    : spawnSync('npx', ['ait', 'build'], {
        env,
        shell: false,
        stdio: 'inherit',
      });
} finally {
  restoreMovedFiles(movedPngs);

  if (movedApi && fs.existsSync(tempApiDir)) {
    movePath(tempApiDir, apiDir);
  }
}

if (result?.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result?.status ?? 1);
