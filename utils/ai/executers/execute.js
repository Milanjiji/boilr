// fs-utils.js
import { promises as fs } from "fs";
import path from "path";

/**
 * Create a folder (recursive).
 */
export async function createFolder(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    console.log(`📁 Folder created: ${dirPath}`);
  } catch (err) {
    console.error(`❌ Failed to create folder ${dirPath}:`, err.message);
  }
}

/**
 * Create a file with content.
 */
export async function createFile(filePath, content = "") {
  try {
    await fs.writeFile(filePath, content, "utf-8");
    console.log(`📝 File created: ${filePath}`);
  } catch (err) {
    console.error(`❌ Failed to create file ${filePath}:`, err.message);
  }
}

/**
 * Search for a file inside a directory (recursive).
 */
export async function findFile(dir, fileName) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = await findFile(fullPath, fileName);
        if (found) return found;
      } else if (entry.name === fileName) {
        return fullPath;
      }
    }
    return null;
  } catch (err) {
    console.error(`❌ Failed to search in ${dir}:`, err.message);
    return null;
  }
}

/**
 * Rewrite file with new content.
 */
export async function rewriteFile(filePath, newContent) {
  try {
    await fs.writeFile(filePath, newContent, "utf-8");
    console.log(`🔄 File rewritten: ${filePath}`);
  } catch (err) {
    console.error(`❌ Failed to rewrite file ${filePath}:`, err.message);
  }
}

/**
 * Append content to a file.
 */
export async function appendToFile(filePath, content) {
  try {
    await fs.appendFile(filePath, content, "utf-8");
    console.log(`➕ Content appended to: ${filePath}`);
  } catch (err) {
    console.error(`❌ Failed to append to file ${filePath}:`, err.message);
  }
}

/**
 * Delete file or folder (recursive).
 */
export async function deletePath(targetPath) {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
    console.log(`🗑️ Deleted: ${targetPath}`);
  } catch (err) {
    console.error(`❌ Failed to delete ${targetPath}:`, err.message);
  }
}

/**
 * Execute a list of AI-generated steps.
 * Each step should follow { action, path, content } format.
 */
export async function executeSteps(steps) {
  for (const step of steps) {
    switch (step.action) {
      case "create_folder":
        await createFolder(step.path);
        break;
      case "create_file":
        await createFile(step.path, step.content);
        break;
      case "rewrite_file":
        await rewriteFile(step.path, step.content);
        break;
      case "append_file":
        await appendToFile(step.path, step.content);
        break;
      case "delete":
        await deletePath(step.path);
        break;
      default:
        console.log(`⚠️ Unknown action: ${step.action}`);
    }
  }
}
