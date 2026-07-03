const { TextEncoder, TextDecoder } = require('util');
const fs = require('fs');
const path = require('path');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const frontendDir = path.join(process.cwd(), 'frontend');
if (fs.existsSync(path.join(frontendDir, 'templates'))) {
    process.chdir(frontendDir);
}
