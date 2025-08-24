const fs = require("fs");
const path = require("path");

function isReactApp() {
  const packageJsonPath = path.join(process.cwd(), "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    return deps.hasOwnProperty("react") && deps.hasOwnProperty("react-dom");
  } catch (err) {
    return false;
  }
}

module.exports = isReactApp;
