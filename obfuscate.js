// Build: src/*.js -> js/app.js (the single script index.html loads).
//
// Obfuscation is opt-in via `npm run build:obf`. The default output is a plain esbuild
// bundle because three commits (10d4282, 6597906, d8f060c) had to revert an obfuscated
// bundle because control-flow flattening + dead-code injection wedged the page. Keeping
// the obfuscated path available but non-default stops that regression from recurring.
//
// The bundle is committed, not built by Vercel, so it must be rebuilt and committed for
// any src/ change to reach production.

const fs = require('fs');
const path = require('path');

const OBFUSCATE = process.argv.includes('--obf');

function bundle() {
  const esbuild = require('esbuild');
  console.log('1. Bundling modular ES code from src/main.js...');
  const out = esbuild.buildSync({
    entryPoints: ['src/main.js'],
    bundle: true,
    write: false,
    format: 'iife',
    target: ['es2018'],
    logLevel: 'warning'
  });
  return out.outputFiles[0].text;
}

function obfuscate(code) {
  const JavaScriptObfuscator = require('javascript-obfuscator');
  console.log('2. Applying anti-tamper obfuscation...');
  return JavaScriptObfuscator
    .obfuscate(code, {
      compact: true,
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
      // WHY: selfDefending re-parses the bundle at runtime and, in this bundle shape,
      // sends the page into an unbounded recursion loop that freezes the tab.
      selfDefending: false
    })
    .getObfuscatedCode();
}

function write(code, target) {
  const dir = path.dirname(target);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(target, code, 'utf8');
  console.log(`   -> ${path.relative(__dirname, target)} (${code.length} bytes)`);
}

function main() {
  const raw = bundle();
  console.log(`   bundled: ${raw.length} bytes`);
  const final = OBFUSCATE ? obfuscate(raw) : raw;

  write(final, path.join(__dirname, 'js', 'app.js'));
  write(final, path.join(__dirname, 'new', 'js', 'app.js'));
  if (!OBFUSCATE) console.log('   (clean output — run `npm run build:obf` to obfuscate)');
}

main();