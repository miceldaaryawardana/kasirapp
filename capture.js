const fs = require('fs');
const { execSync } = require('child_process');

const edgePaths = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
];

let browserPath = edgePaths.find(p => fs.existsSync(p));
console.log('Browser found:', browserPath);

if (browserPath) {
  try {
    const tempProfile = 'C:\\Users\\micel\\AppData\\Local\\Temp\\edge_profile_' + Date.now();
    const desktopPng = 'c:\\Users\\micel\\visual desktop project\\pointofsaleapp\\desktop_1440.png';
    const mobilePng = 'c:\\Users\\micel\\visual desktop project\\pointofsaleapp\\mobile_375.png';

    console.log('Taking desktop screenshot (1440x960)...');
    execSync(`"${browserPath}" --headless --disable-gpu --user-data-dir="${tempProfile}" --screenshot="${desktopPng}" --window-size=1440,960 http://localhost:8080`, { stdio: 'inherit' });

    console.log('Taking mobile screenshot (375x812)...');
    execSync(`"${browserPath}" --headless --disable-gpu --user-data-dir="${tempProfile}" --screenshot="${mobilePng}" --window-size=375,812 http://localhost:8080`, { stdio: 'inherit' });

    console.log('Done!');
  } catch (err) {
    console.error('Error capturing screenshot:', err);
  }
} else {
  console.log('No browser executable found at standard paths.');
}
