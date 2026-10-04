
const fs = require('fs');
const path = require('path');

const CLEAN = process.argv.includes('--clean');
const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const STATIC = path.join(ROOT, 'static');

function bundle() {
  const esbuild = require('esbuild');
  console.log('1. Bundling src/main.js');
  const out = esbuild.buildSync({
    entryPoints: [path.join(ROOT, 'src', 'main.js')],
    bundle: true,
    write: false,
    format: 'iife',
    target: ['es2018'],
    sourcemap: false,
    minify: !CLEAN,
    legalComments: 'none',
    logLevel: 'warning'
  });
  return out.outputFiles[0].text;
}

function obfuscate(code) {
  const JavaScriptObfuscator = require('javascript-obfuscator');
  console.log('2. Obfuscating');
  return JavaScriptObfuscator
    .obfuscate(code, {
      compact: true,
      identifierNamesGenerator: 'mangled',
      renameGlobals: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 0.2,
      numbersToExpressions: true,
      simplify: true,
      stringArray: true,
      stringArrayEncoding: ['base64', 'rc4'],
      stringArrayThreshold: 0.8,
      stringArrayShuffle: true,
      splitStrings: true,
      splitStringsChunkLength: 6,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
      selfDefending: false
    })
    .getObfuscatedCode();
}

function stripModuleBanners(code) {
  return code.replace(/^\/\/ src\/[^\n]*\n/gm, '');
}

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
  console.log('   -> ' + path.relative(ROOT, file) + '  (' + (Buffer.byteLength(data) / 1024).toFixed(1) + ' KB)');
}

function copyInto(from, to) {
  if (!fs.existsSync(from)) return;
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const s = path.join(from, e.name);
    const d = path.join(to, e.name);
    if (e.isDirectory()) copyInto(s, d);
    else {
      fs.copyFileSync(s, d);
      console.log('   -> ' + path.relative(ROOT, d) + '  (' + (fs.statSync(d).size / 1024).toFixed(1) + ' KB)');
    }
  }
}

function cleanPublishRoot() {
  for (const e of fs.readdirSync(PUB, { withFileTypes: true })) {
    if (e.name === 'index.html' || e.name === '404.html') continue;
    fs.rmSync(path.join(PUB, e.name), { recursive: true, force: true });
  }
}

function main() {
  cleanPublishRoot();

  const raw = stripModuleBanners(bundle());
  console.log('   bundled ' + (Buffer.byteLength(raw) / 1024).toFixed(1) + ' KB');
  write(path.join(PUB, 'js', 'app.js'), CLEAN ? raw : obfuscate(raw));

  const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
  write(path.join(PUB, '404.html'), html);

  console.log('3. Copying static assets');
  copyInto(STATIC, PUB);
  copyInto(path.join(ROOT, 'images'), path.join(PUB, 'images'));
  copyInto(path.join(ROOT, 'spitari'), path.join(PUB, 'spitari'));

  verifyReferences();

  if (CLEAN) console.log('   CLEAN build -- do not deploy, this one is readable');
  console.log('4. Done. Deploy public/ only.');
}

function verifyReferences() {
  const html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
  const refs = new Set();
  const patterns = [/(?<![-\w])(?:src|href)\s*=\s*"([^"]+)"/g];
  for (const re of patterns) {
    let m;
    while ((m = re.exec(html))) refs.add(m[1]);
  }
  const missing = [];
  for (const ref of refs) {
    if (/^(https?:|data:|\/\/|#|mailto:|javascript:)/i.test(ref)) continue;
    const clean = ref.split(/[?#]/)[0];
    if (!clean) continue;
    if (!fs.existsSync(path.join(PUB, clean))) missing.push(clean);
  }
  if (missing.length) {
    console.error('\nBUILD FAILED: published HTML references files that do not exist:');
    for (const m of missing) console.error('   ' + m);
    process.exit(1);
  }
  console.log('   verified ' + refs.size + ' references, all present');
}

main();
