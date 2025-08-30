const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const readline = require("readline");

const isReactApp = require("../../utils/isReactApp.js");
const isNextApp = require("../../utils/isNextApp.js");

// ---------- helpers ----------
function askYesNo(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close();
      const v = ans.trim().toLowerCase();
      resolve(v === "y" || v === "yes");
    })
  );
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, "utf-8");
  } catch {
    return null;
  }
}

function writeFileSafe(p, content) {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content, "utf-8");
}

function appendEnvVar(envContent, key, val) {
  if (!envContent.includes(`${key}=`)) {
    envContent += `\n${key}=${val}`;
  }
  return envContent;
}

function fileHas(content, needle) {
  return content && content.includes(needle);
}

function detectNextRouter(cwd) {
  // returns "app" if app dir exists, "pages" if pages dir exists, null otherwise
  if (fs.existsSync(path.join(cwd, "app"))) return "app";
  if (fs.existsSync(path.join(cwd, "pages"))) return "pages";
  return null;
}

// ---------- main ----------
async function setupFirebase() {
  console.log("🔥 Starting Firebase setup...");

  const cwd = process.cwd();
  const isReact = isReactApp();
  const isNext = isNextApp();
  if (!isReact && !isNext) {
    console.error("❌ This is not a React or Next.js project. Aborting...");
    process.exit(1);
  }
  if (isReact) console.log("✅ React project detected!");
  if (isNext) console.log("✅ Next.js project detected!");

  // ---- Phase 2: Dependencies + user choices ----
  console.log("➡️ Installing firebase...");
  execSync("npm install firebase", { stdio: "inherit" });
  console.log("✅ Firebase installed!");

  const useAuth = await askYesNo("Do you want Firebase Auth? (y/n): ") || '';
  const useFirestore = await askYesNo("Do you want Firestore? (y/n): ") || '';
  const useStorage = await askYesNo("Do you want Storage? (y/n): ") || '';
  const useFunctions = await askYesNo("Do you want Cloud Functions setup (just note, no scaffold here)? (y/n): ") || '';
  const useHosting = await askYesNo("Do you want Hosting setup (just note, no scaffold here)? (y/n): ") || '';

  // ---- Phase 3: Env placeholders (React vs Next) ----
  const envPrefix = isReact ? "REACT_APP" : "NEXT_PUBLIC";
  const envExamplePath = path.join(cwd, ".env.example");
  let envContent = readFileSafe(envExamplePath) || "";

  envContent = appendEnvVar(envContent, `${envPrefix}_FIREBASE_API_KEY`, "YOUR_API_KEY");
  // Auth domain needed if Auth picked (and generally safe to include)
  if (useAuth) {
    envContent = appendEnvVar(envContent, `${envPrefix}_FIREBASE_AUTH_DOMAIN`, "YOUR_PROJECT.firebaseapp.com");
  }
  // Firestore uses projectId
  if (useFirestore) {
    envContent = appendEnvVar(envContent, `${envPrefix}_FIREBASE_PROJECT_ID`, "YOUR_PROJECT_ID");
  }
  if (useStorage) {
    envContent = appendEnvVar(envContent, `${envPrefix}_FIREBASE_STORAGE_BUCKET`, "YOUR_PROJECT.appspot.com");
  }
  // Messaging + appId are common in many setups; include to keep config complete
  envContent = appendEnvVar(envContent, `${envPrefix}_FIREBASE_MESSAGING_SENDER_ID`, "YOUR_SENDER_ID");
  envContent = appendEnvVar(envContent, `${envPrefix}_FIREBASE_APP_ID`, "YOUR_APP_ID");

  writeFileSafe(envExamplePath, envContent.trim() + "\n");
  console.log("✅ .env.example updated with Firebase placeholders!");

  // ---- Create firebase config module ----
  const configDir = isReact ? path.join(cwd, "src") : path.join(cwd, "lib");
  const firebasePath = path.join(configDir, "firebase.js");

  if (!fs.existsSync(firebasePath)) {
    console.log(`➡️ Creating firebase.js in ${isReact ? "src/" : "lib/"}...`);

    let imports = `import { initializeApp } from "firebase/app";\n`;
    let exports = "";

    if (useAuth) {
      imports += `import { getAuth } from "firebase/auth";\n`;
      exports += `export const auth = getAuth(app); // added by boilr\n`;
    }
    if (useFirestore) {
      imports += `import { getFirestore } from "firebase/firestore";\n`;
      exports += `export const db = getFirestore(app); // added by boilr\n`;
    }
    if (useStorage) {
      imports += `import { getStorage } from "firebase/storage";\n`;
      exports += `export const storage = getStorage(app); // added by boilr\n`;
    }

    const configLines = [
      `apiKey: process.env.${envPrefix}_FIREBASE_API_KEY,`,
      useAuth ? `authDomain: process.env.${envPrefix}_FIREBASE_AUTH_DOMAIN,` : null,
      (useFirestore || useAuth) ? `projectId: process.env.${envPrefix}_FIREBASE_PROJECT_ID,` : null,
      useStorage ? `storageBucket: process.env.${envPrefix}_FIREBASE_STORAGE_BUCKET,` : null,
      `messagingSenderId: process.env.${envPrefix}_FIREBASE_MESSAGING_SENDER_ID,`,
      `appId: process.env.${envPrefix}_FIREBASE_APP_ID,`,
    ].filter(Boolean);

    const firebaseCode = `// firebase.js created by boilr
${imports}
const firebaseConfig = {
  ${configLines.join("\n  ")}
};

const app = initializeApp(firebaseConfig);
${exports}export default app; // added by boilr
`;
    writeFileSafe(firebasePath, firebaseCode);
    console.log("✅ firebase.js created!");
  } else {
    console.log("⚠️ firebase.js already exists. Skipping.");
  }

  // ---- Phase 4: App integration (optional for each framework) ----
  const doIntegrate = await askYesNo("\nDo you want me to integrate Firebase into your app entry now? (y/n): ");
  if (!doIntegrate) {
    console.log("ℹ️ Skipping app integration step by user choice.");
    const selectedServices = [];
    if (useAuth) selectedServices.push("auth");
    if (useFirestore) selectedServices.push("firestore");
    if (useStorage) selectedServices.push("storage");
    if (useFunctions) selectedServices.push("functions");
    if (useHosting) selectedServices.push("hosting");
    logClosingNotes(useFunctions, useHosting);
    printNextSteps(isReact ? "react" : "next", selectedServices);
    return;
  }

  if (isReact) {
    await integrateReactApp(cwd, useAuth);
  }

  if (isNext) {
    const router = detectNextRouter(cwd); // "app" | "pages" | null
    if (!router) {
      console.log("⚠️ Could not detect Next router (no app/ or pages/). Skipping Next integration.");
    } else if (router === "pages") {
      await integrateNextPages(cwd, useAuth);
    } else if (router === "app") {
      await integrateNextAppRouter(cwd, useAuth);
    }
  }

  const selectedServices = [];
  if (useAuth) selectedServices.push("auth");
  if (useFirestore) selectedServices.push("firestore");
  if (useStorage) selectedServices.push("storage");

  logClosingNotes(useFunctions, useHosting);
  printNextSteps(isReact ? "react" : "next", selectedServices);

  console.log("🎉 Firebase setup completed successfully!");
}

async function integrateReactApp(cwd, useAuth) {
  // Import firebase once so tree-shaking-friendly side-effects ensure initialized
  const appPath = path.join(cwd, "src", "App.js");
  if (!fs.existsSync(appPath)) {
    console.log("❌ src/App.js not found. Skipping React App integration.");
    return;
  }

  let appContent = readFileSafe(appPath);
  let modified = false;

  if (!fileHas(appContent, `import "./firebase"`)) {
    appContent = `import "./firebase"; // added by boilr\n` + appContent;
    modified = true;
  }

  if (useAuth) {
    // Create AuthProvider and wrap <App /> return content with it
    const contextPath = path.join(cwd, "src", "context", "AuthProvider.jsx");
    if (!fs.existsSync(contextPath)) {
      const providerCode = `// AuthProvider.jsx created by boilr
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) { // added by boilr
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
`;
      writeFileSafe(contextPath, providerCode);
      console.log("✅ AuthProvider.jsx created!");
    } else {
      console.log("⚠️ AuthProvider.jsx already exists. Skipping.");
    }

    if (!fileHas(appContent, `import { AuthProvider } from "./context/AuthProvider"`)) {
      appContent = `import { AuthProvider } from "./context/AuthProvider"; // added by boilr\n` + appContent;
      modified = true;
    }

    // Wrap App's top-level JSX with <AuthProvider> if not present
    if (!fileHas(appContent, "<AuthProvider>")) {
      // naive but safe-ish wrap: replace first occurrence of 'return (' with wrapper
      appContent = appContent.replace(
        /return\s*\(\s*<(\w+)/,
        (match, tag) => `return (\n    <AuthProvider> {/* added by boilr */}\n      <${tag}`
      );
      // and inject closing before final closing parenthesis + semicolon
      appContent = appContent.replace(/\)\s*;\s*$/, `\n    </AuthProvider> {/* added by boilr */}\n  );\n`);
      modified = true;
    }
  }

  if (modified) {
    writeFileSafe(appPath, appContent);
    console.log("✅ React App.js integrated with Firebase (and Auth provider if selected).");
  } else {
    console.log("⚠️ App.js already appears integrated. Skipping.");
  }
}

async function integrateNextPages(cwd, useAuth) {
  const libImport = `import "../lib/firebase"; // added by boilr`;
  const pagesDir = path.join(cwd, "pages");
  const appFileJs = path.join(pagesDir, "_app.js");
  const appFileTs = path.join(pagesDir, "_app.tsx");

  let target = fs.existsSync(appFileJs) ? appFileJs : fs.existsSync(appFileTs) ? appFileTs : null;
  if (!target) {
    // create a minimal _app.js if missing
    const minimal = `// _app.js created by boilr
${libImport}
function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
export default MyApp;
`;
    writeFileSafe(appFileJs, minimal);
    console.log("✅ pages/_app.js created and firebase imported.");
    target = appFileJs;
  } else {
    let content = readFileSafe(target);
    let modified = false;

    if (!fileHas(content, `lib/firebase`)) {
      content = `${libImport}\n${content}`;
      modified = true;
    }

    if (useAuth) {
      // Create provider if not exists
      const providerPath = path.join(cwd, "lib", "AuthProvider.jsx");
      if (!fs.existsSync(providerPath)) {
        const code = `// lib/AuthProvider.jsx created by boilr
"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
`;
        writeFileSafe(providerPath, code);
        console.log("✅ lib/AuthProvider.jsx created!");
      } else {
        console.log("⚠️ lib/AuthProvider.jsx already exists. Skipping.");
      }

      if (!fileHas(content, `AuthProvider`)) {
        content = `import { AuthProvider } from "../lib/AuthProvider"; // added by boilr\n` + content;
        // Wrap <Component ... />
        content = content.replace(
          /return\s*\(\s*<Component/,
          `return (\n    <AuthProvider> {/* added by boilr */}\n      <Component`
        );
        content = content.replace(/\)\s*;\s*$/, `\n    </AuthProvider> {/* added by boilr */}\n  );\n`);
        modified = true;
      }
    }

    if (modified) {
      writeFileSafe(target, content);
      console.log("✅ Next (pages router) integrated with Firebase (and Auth provider if selected).");
    } else {
      console.log("⚠️ Next (pages router) _app already appears integrated. Skipping.");
    }
  }
}

async function integrateNextAppRouter(cwd, useAuth) {
  const appDir = path.join(cwd, "app");
  const layoutJs = path.join(appDir, "layout.js");
  const layoutTs = path.join(appDir, "layout.tsx");
  const layout = fs.existsSync(layoutJs) ? layoutJs : fs.existsSync(layoutTs) ? layoutTs : null;
  if (!layout) {
    console.log("❌ app/layout.(js|tsx) not found. Skipping Next (app router) integration.");
    return;
  }

  // Ensure firebase import somewhere client-side — typically in providers
  const providersPath = path.join(appDir, "providers.jsx");
  if (!fs.existsSync(providersPath)) {
    const providerCode = `// app/providers.jsx created by boilr
"use client";
import "../lib/firebase"; // added by boilr
${useAuth ? `import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext(null);

export function useAuth() { return useContext(AuthContext); }` : ""}

export default function Providers({ children }) {
  ${useAuth ? `const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u || null); setLoading(false); });
    return () => unsub();
  }, []);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);
  return (
    <${"AuthContext.Provider"} value={{ user, loading, login, logout }}>
      {children}
    </${"AuthContext.Provider"}>
  );` : `return children;`}
}
`;
    writeFileSafe(providersPath, providerCode);
    console.log("✅ app/providers.jsx created!");
  } else {
    console.log("⚠️ app/providers.jsx already exists. Skipping creation.");
  }

  let layoutContent = readFileSafe(layout);
  let modified = false;

  if (!fileHas(layoutContent, "import Providers from \"./providers\"")) {
    layoutContent = `import Providers from "./providers"; // added by boilr\n` + layoutContent;
    modified = true;
  }

  // Wrap children with <Providers>
  if (!fileHas(layoutContent, "<Providers>")) {
    // Try to wrap the standard structure in app router layouts
    // Replace `<body>...{children}...</body>` with Providers around children
    layoutContent = layoutContent.replace(
      /\{children\}/,
      `<Providers>{children}</Providers> {/* added by boilr */}`
    );
    modified = true;
  }

  if (modified) {
    writeFileSafe(layout, layoutContent);
    console.log("✅ Next (app router) layout integrated with Providers (and Firebase/Auth if selected).");
  } else {
    console.log("⚠️ Next (app router) layout already appears integrated. Skipping.");
  }
}

function logClosingNotes(useFunctions, useHosting) {
  if (useFunctions) {
    console.log("⚡ Note: For Cloud Functions, install firebase-tools and run `npx firebase init functions` in your project.");
  }
  if (useHosting) {
    console.log("🌐 Note: For Hosting, run `npx firebase init hosting` and set your build output as the public directory.");
  }
}

function printNextSteps(framework, selectedServices) {
    console.log("\n✅ Boilerplate setup complete!\n");
  
    console.log("👉 Next steps you need to do manually:\n");
  
    // Step 1: Env setup
    console.log("1. Open the `.env.example` file that was created.");
    console.log("   - Copy it into a new file named `.env.local` in your project root.");
    if (framework === "react") {
      console.log("   - Fill in your Firebase project credentials (with REACT_APP_ prefix).");
    } else if (framework === "next") {
      console.log("   - Fill in your Firebase project credentials (with NEXT_PUBLIC_ prefix).");
    }
  
    // Step 2: Firebase Console
    console.log("\n2. Go to your Firebase Console:");
    console.log("   - Create a new project (if not done already).");
    console.log("   - Enable the services you selected:");
  
    if (selectedServices.includes("auth")) {
      console.log("     🔑 Enable Authentication (Email/Password, Google, etc.)");
    }
    if (selectedServices.includes("firestore")) {
      console.log("     📂 Enable Firestore Database.");
    }
    if (selectedServices.includes("storage")) {
      console.log("     🗂️ Enable Cloud Storage.");
    }
    if (selectedServices.includes("functions")) {
      console.log("     ⚡ Set up Cloud Functions.");
    }
  
    // Step 3: Start the app
    if (framework === "react") {
      console.log("\n3. Run your React app:");
      console.log("   npm start   # or yarn start");
    } else if (framework === "next") {
      console.log("\n3. Run your Next.js app:");
      console.log("   npm run dev   # or yarn dev");
    }
  
    console.log("\n🚀 That’s it! Your Firebase boilerplate is ready to use.\n");
  }

module.exports = setupFirebase;
