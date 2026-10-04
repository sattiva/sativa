const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');
const JavaScriptObfuscator = require('javascript-obfuscator');

function buildAndObfuscate() {
  console.log('1. Bundling modular ES code from src/main.js...');
  const bundled = esbuild.buildSync({
    entryPoints: ['src/main.js'],
    bundle: true,
    write: false,
    format: 'iife',
    target: ['es2018']
  });

  const bundledCode = bundled.outputFiles[0].text;
  console.log(`Bundled size: ${bundledCode.length} bytes`);

  console.log('2. Applying high-grade anti-tamper obfuscation...');
  const obfs = JavaScriptObfuscator.obfuscate(bundledCode, {
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
    selfDefending: false // Must stay false to prevent infinite recursion loop in browser
  });

  const finalCode = obfs.getObfuscatedCode();
  const targetDir = path.join(__dirname, 'js');
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const targetPath = path.join(targetDir, 'app.js');
  fs.writeFileSync(targetPath, finalCode, 'utf8');
  console.log(`Saved obfuscated production bundle to ${targetPath} (${finalCode.length} bytes)`);

  const newTargetDir = path.join(__dirname, 'new', 'js');
  if (fs.existsSync(path.join(__dirname, 'new'))) {
    if (!fs.existsSync(newTargetDir)) fs.mkdirSync(newTargetDir, { recursive: true });
    fs.writeFileSync(path.join(newTargetDir, 'app.js'), finalCode, 'utf8');
    console.log(`Mirrored to new/js/app.js`);
  }
}

buildAndObfuscate();
