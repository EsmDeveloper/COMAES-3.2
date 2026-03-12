const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;

            // Substituir formato `'http://localhost:3000...'` e `"http://localhost:3000..."`
            content = content.replace(/['"]http:\/\/localhost:3000([^'"]*)['"]/g, "`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}$1`");

            // Substituir formato backtick `http://localhost:3000...` e preservar a interpolação interna
            content = content.replace(/`http:\/\/localhost:3000([^`]*)`/g, "`${import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:3000`}$1`");

            if (original !== content) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated: ' + fullPath);
            }
        }
    });
}

processDir('c:/Users/HP PROBOOK 440 G5/Desktop/COMAES-2.1/FrontEnd/src');
