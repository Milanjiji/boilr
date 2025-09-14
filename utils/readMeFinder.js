const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

function isPackageInPackageJson(pkgName) {
  const pkgJsonPath = path.join(process.cwd(), "package.json");
  if (!fs.existsSync(pkgJsonPath)) return false;
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));
  const deps = pkgJson.dependencies || {};
  const devDeps = pkgJson.devDependencies || {};
  return deps[pkgName] || devDeps[pkgName];
}

function askUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function installPackage(pkgName) {
  if (isPackageInPackageJson(pkgName)) {
    console.log(`\n✅ ${pkgName} is already listed in package.json.`);
    const answer = await askUser(`Do you want to reinstall ${pkgName}? (y/N): `);
    if (answer !== "y" && answer !== "yes") {
      return path.join(process.cwd(), "node_modules", pkgName);
    }
  }
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

async function showReadmes(pkgName) {
  const pkgPath = await installPackage(pkgName);
  if (!pkgPath) return;

  const readmeFiles = findReadmeFiles(pkgPath);

  if (readmeFiles.length === 0) {
    console.log("⚠️ No README files found in this package.");
    return;
  }

  const readmes = readmeFiles.map((file, i) => {
    const content = fs.readFileSync(file, "utf-8");
    return {
      file,
      content, // full README content
    };
  });

  return readmes;
}

module.exports = { showReadmes };
