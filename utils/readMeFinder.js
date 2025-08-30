const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function installPackage(pkgName) {
  try {
    console.log(`\n📦 Installing ${pkgName}...`);
    execSync(`npm install ${pkgName}`, { stdio: "inherit" });
    console.log(`✅ Installed ${pkgName}`);
  } catch (err) {
    console.error(`❌ Failed to install ${pkgName}:`, err.message);
    return null;
  }
  return path.join(process.cwd(), "node_modules", pkgName);
}

function findReadmeFiles(dir) {
  let readmeFiles = [];

  function searchRecursive(folder) {
    const files = fs.readdirSync(folder, { withFileTypes: true });

    for (const file of files) {
      const filePath = path.join(folder, file.name);

      if (file.isDirectory()) {
        searchRecursive(filePath);
      } else if (/^readme(\..+)?$/i.test(file.name)) {
        readmeFiles.push(filePath);
      }
    }
  }

  if (fs.existsSync(dir)) {
    searchRecursive(dir);
  }

  return readmeFiles;
}

function showReadmes(pkgName) {
  const pkgPath = installPackage(pkgName);
  if (!pkgPath) return;

  const readmeFiles = findReadmeFiles(pkgPath);

  if (readmeFiles.length === 0) {
    console.log("⚠️ No README files found in this package.");
    return;
  }

  console.log(`\n📖 Found ${readmeFiles.length} README file(s):\n`);
  readmeFiles.forEach((file, i) => {
    console.log(`--- [${i + 1}] ${file} ---\n`);
    const content = fs.readFileSync(file, "utf-8");
    console.log(content.substring(0, 1000)); // only show first 1000 chars
    console.log("\n...\n");
  });
}

module.exports = { showReadmes };
