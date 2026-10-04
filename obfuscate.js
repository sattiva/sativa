const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

function obfuscateFile(inputPath, outputPath) {
  if (!fs.existsSync(inputPath)) {
    console.log(`Input file not found: ${inputPath}`);
    return;
  }
  const code = fs.readFileSync(inputPath, 'utf8');
  console.log(`Obfuscating ${inputPath} (${code.length} bytes)...`);

  const obfs = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.8,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.25,
    numbersToExpressions: true,
    simplify: true,
    stringArray: true,
    stringArrayEncoding: ['base64', 'rc4'],
    stringArrayThreshold: 0.85,
    stringArrayShuffle: true,
    splitStrings: true,
    splitStringsChunkLength: 5,
    transformObjectKeys: true,
    selfDefending: true
  });

  fs.writeFileSync(outputPath, obfs.getObfuscatedCode(), 'utf8');
  console.log(`Saved obfuscated code to ${outputPath} (${obfs.getObfuscatedCode().length} bytes)`);
}

const jsApp = path.join(__dirname, 'js', 'app.js');
if (fs.existsSync(jsApp)) {
  obfuscateFile(jsApp, jsApp);
}
