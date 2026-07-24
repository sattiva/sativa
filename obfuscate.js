const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

function processFile(filename) {
    const srcPath = path.join(srcDir, filename);
    const distPath = path.join(distDir, filename);
    
    if (fs.existsSync(srcPath)) {
        const code = fs.readFileSync(srcPath, 'utf8');
        const obfsResult = JavaScriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            controlFlowFlatteningThreshold: 0.75,
            numbersToExpressions: true,
            simplify: true,
            stringArrayShuffle: true,
            splitStrings: true,
            stringArrayThreshold: 0.75
        });
        fs.writeFileSync(distPath, obfsResult.getObfuscatedCode(), 'utf8');
        console.log(`Obfuscated: ${filename}`);
    } else {
        console.log(`Not found: ${srcPath}`);
    }
}

processFile('mapData.js');
processFile('ascii.js');
processFile('script.js');
