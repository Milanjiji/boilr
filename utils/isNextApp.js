const fs = require("fs");
const path = require("path");

function isNextApp() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    // Check if "next" is listed in dependencies
    if (deps.hasOwnProperty("next")) {
      return true;
    }

    // Extra safety: look for Next.js-specific files or dirs
    const cwd = process.cwd();
    if (
      fs.existsSync(path.join(cwd, "next.config.js")) ||
      fs.existsSync(path.join(cwd, "pages")) ||
      fs.existsSync(path.join(cwd, "app"))
    ) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

module.exports = isNextApp;
