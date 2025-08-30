const readline = require("readline");

function askUserToChoose(packages) {
  return new Promise((resolve) => {
    console.log("\n📦 Multiple matches found:");
    packages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.name}@${pkg.version} - ${pkg.description}`);
    });

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("\n👉 Enter the number of the package you want to select: ", (answer) => {
      const choice = parseInt(answer, 10);
      rl.close();

      if (isNaN(choice) || choice < 1 || choice > packages.length) {
        console.log("❌ Invalid choice, using first package by default.");
        resolve(packages[0]);
      } else {
        resolve(packages[choice - 1]);
      }
    });
  });
}

module.exports = { askUserToChoose };
