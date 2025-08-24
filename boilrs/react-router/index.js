const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const checkReactApp = require("../../utils/isReactApp.js");

// Main function
function setupReactRouter() {
  console.log("🚀 Starting React Router setup...");

  // STEP 0: Check if this is a React app
  if (!checkReactApp()) {
    console.error("❌ This is not a React project. Aborting...");
    process.exit(1);
  }
  console.log("✅ React project detected!");

  // STEP 1: Install react-router-dom
  console.log("➡️ Installing react-router-dom...");
  execSync("npm install react-router-dom", { stdio: "inherit" });
  console.log("✅ react-router-dom installed!");

  // STEP 2: Modify index.js to wrap <App/> with <BrowserRouter>
  const indexPath = path.join(process.cwd(), "src", "index.js");
  if (fs.existsSync(indexPath)) {
    let indexContent = fs.readFileSync(indexPath, "utf-8");

    if (!indexContent.includes("BrowserRouter")) {
      console.log("➡️ Updating index.js with BrowserRouter...");
      indexContent = `import { BrowserRouter } from "react-router-dom"; // added by boilr\n${indexContent}`;

      indexContent = indexContent.replace(
        /<App\s*\/>/,
        `<BrowserRouter> {/* wrapped by boilr */}\n    <App />\n  </BrowserRouter>`
      );

      fs.writeFileSync(indexPath, indexContent, "utf-8");
      console.log("✅ index.js updated with BrowserRouter!");
    } else {
      console.log("⚠️ index.js already contains BrowserRouter. Skipping.");
    }
  } else {
    console.error("❌ src/index.js not found. Skipping step 2.");
  }

  // STEP 3: Create src/routes.jsx with sample routes
  const routesPath = path.join(process.cwd(), "src", "routes.jsx");
  if (!fs.existsSync(routesPath)) {
    console.log("➡️ Creating routes.jsx...");
    const routesCode = `// routes.jsx created by boilr
import { Routes, Route } from "react-router-dom"; // added by boilr
import Home from "./pages/Home"; // added by boilr
import About from "./pages/About"; // added by boilr

export default function AppRoutes() { // added by boilr
  return (
    <Routes> {/* added by boilr */}
      <Route path="/" element={<Home />} /> {/* added by boilr */}
      <Route path="/about" element={<About />} /> {/* added by boilr */}
    </Routes>
  );
}
`;
    fs.writeFileSync(routesPath, routesCode, "utf-8");
    console.log("✅ routes.jsx created!");
  } else {
    console.log("⚠️ routes.jsx already exists. Skipping.");
  }

  // STEP 4: Create sample pages (Home, About)
  const pagesDir = path.join(process.cwd(), "src", "pages");
  if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir);
    console.log("➡️ Created src/pages directory.");
  }

  const samplePages = {
    Home: `// Home.jsx created by boilr
export default function Home() {
  return <h1>🏠 Home Page</h1>; // added by boilr
}
`,
    About: `// About.jsx created by boilr
export default function About() {
  return <h1>ℹ️ About Page</h1>; // added by boilr
}
`,
  };

  for (const [name, code] of Object.entries(samplePages)) {
    const filePath = path.join(pagesDir, `${name}.jsx`);
    if (!fs.existsSync(filePath)) {
      console.log(`➡️ Creating ${name}.jsx...`);
      fs.writeFileSync(filePath, code, "utf-8");
      console.log(`✅ Created ${name}.jsx.`);
    } else {
      console.log(`⚠️ ${name}.jsx already exists. Skipping.`);
    }
  }

  // STEP 5: Update App.js with nav + routes
  const appPath = path.join(process.cwd(), "src", "App.js");
  if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, "utf-8");

    let changed = false;

    // Ensure Link import
    if (!appContent.includes(`import { Link } from "react-router-dom";`)) {
      appContent = `import { Link } from "react-router-dom"; // added by boilr\n${appContent}`;
      changed = true;
    }

    // Ensure AppRoutes import
    if (!appContent.includes(`import AppRoutes from "./routes";`)) {
      appContent = `import AppRoutes from "./routes"; // added by boilr\n${appContent}`;
      changed = true;
    }

    // Add <nav> if missing
    if (!appContent.includes("<nav>")) {
      appContent = appContent.replace(
        /return\s*\(\s*<div>/,
        `return (\n    <div>\n      <nav> {/* added by boilr */}\n        <Link to="/">Home</Link> |{" "} {/* added by boilr */}\n        <Link to="/about">About</Link> {/* added by boilr */}\n      </nav>`
      );
      changed = true;
    }

    // Add <AppRoutes /> if missing
    if (!appContent.includes("<AppRoutes />")) {
      appContent = appContent.replace(
        /<\/div>/,
        `  <AppRoutes /> {/* added by boilr */}\n    </div>`
      );
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(appPath, appContent, "utf-8");
      console.log("✅ App.js updated with nav and AppRoutes!");
    } else {
      console.log("⚠️ App.js already contains AppRoutes setup. Skipping.");
    }
  } else {
    console.log("❌ App.js not found. Skipping.");
  }

  console.log("🎉 React Router setup completed successfully!");
}

module.exports = setupReactRouter;
