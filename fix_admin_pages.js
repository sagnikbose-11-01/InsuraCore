const fs = require('fs');
const path = require('path');

const adminDir = path.join(__dirname, 'app', 'admin');

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      traverseDir(fullPath);
    } else if (file === 'page.tsx') {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      if (content.includes('DashboardShell')) {
        // Remove import
        content = content.replace(/import\s+{\s*DashboardShell\s*}\s+from\s+['"]@\/components\/shared\/DashboardShell['"];?\n?/g, '');
        
        // Replace <DashboardShell> with <>
        content = content.replace(/<DashboardShell[^>]*>/g, '<>');
        
        // Replace </DashboardShell> with </>
        content = content.replace(/<\/DashboardShell>/g, '</>');
        
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

traverseDir(adminDir);
