const { exec } = require("child_process");

function searchNpmPackage(pkgName) {
  return new Promise((resolve, reject) => {
    exec(`npm search ${pkgName} --json`, { maxBuffer: 1024 * 500 }, (error, stdout, stderr) => {
      if (error) {
        return reject(`❌ Error searching npm: ${stderr || error.message}`);
      }

      try {
        const results = JSON.parse(stdout);

        if (!results || results.length === 0) {
          return resolve({ found: false, results: [] });
        }

        // Simplify the response (only show relevant info)
        const simplified = results.map(pkg => ({
          name: pkg.name,
          version: pkg.version,
          description: pkg.description,
        }));

        resolve({ found: true, results: simplified });
      } catch (err) {
        reject(`❌ Failed to parse npm search result: ${err.message}`);
      }
    });
  });
}

module.exports = { searchNpmPackage };
