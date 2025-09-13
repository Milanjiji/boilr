const fs = require("fs");
const path = require("path");

// Ensure directory exists
function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Create file or fallback to alternative
function createFile(filePath, content, alternative) {
  ensureDir(filePath);

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Created file: ${filePath}`);
  } else {
    console.log(`⚠️ File already exists: ${filePath}, applying alternative...`);
    handleAlternative(filePath, alternative);
  }
}

// Append content
function appendToFile(filePath, content) {
  fs.appendFileSync(filePath, "\n" + content, "utf-8");
  console.log(`📌 Appended content to: ${filePath}`);
}

// Modify file with step instructions
function modifyFile(filePath, steps) {
  let content = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  steps.forEach(step => {
    let before = content;

    if (step.action === "find_and_replace") {
      if (content.includes(step.find)) {
        content = content.replace(step.find, step.replace);
        modified = true;
      } else if (step.alternative) {
        console.log(`⚠️ Could not find "${step.find}", applying step alternative...`);
        content = applyStepAlternative(filePath, content, step.alternative);
      }
    } else if (step.action === "insert_after") {
      if (content.includes(step.target)) {
        content = content.replace(
          step.target,
          `${step.target}\n${step.content}`
        );
        modified = true;
      } else if (step.alternative) {
        console.log(`⚠️ Target not found for insert_after, applying step alternative...`);
        content = applyStepAlternative(filePath, content, step.alternative);
      }
    } else if (step.action === "insert_before") {
      if (content.includes(step.target)) {
        content = content.replace(
          step.target,
          `${step.content}\n${step.target}`
        );
        modified = true;
      } else if (step.alternative) {
        console.log(`⚠️ Target not found for insert_before, applying step alternative...`);
        content = applyStepAlternative(filePath, content, step.alternative);
      }
    } else if (step.action === "append_content") {
      content += `\n${step.content}`;
      modified = true;
    }

    if (before !== content) {
      console.log(`✏️ Applied step: ${step.action}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`✅ Modified file: ${filePath}`);
  }
}

// Apply alternative for a single step
function applyStepAlternative(filePath, content, alternative) {
  if (Array.isArray(alternative)) {
    alternative.forEach(step => {
      content = applyStepAlternative(filePath, content, step);
    });
  } else if (alternative.action) {
    // Re-run as if it's another step
    return modifyFileContent(content, alternative);
  }
  return content;
}

// Directly modify content based on a step (helper for alternatives)
function modifyFileContent(content, step) {
  if (step.action === "insert_after" && content.includes(step.target)) {
    return content.replace(step.target, `${step.target}\n${step.content}`);
  }
  if (step.action === "insert_before" && content.includes(step.target)) {
    return content.replace(step.target, `${step.content}\n${step.target}`);
  }
  if (step.action === "append_content") {
    return content + `\n${step.content}`;
  }
  if (step.action === "find_and_replace" && content.includes(step.find)) {
    return content.replace(step.find, step.replace);
  }
  return content; // no change if still not found
}

// Handle alternative logic
function handleAlternative(filePath, alternative) {
  if (!alternative) return;

  if (Array.isArray(alternative)) {
    modifyFile(filePath, alternative);
  } else if (alternative.type === "modify_file") {
    modifyFile(filePath, alternative.steps);
  } else if (alternative.type === "append_content") {
    appendToFile(filePath, alternative.content);
  }
}

module.exports = {
  createFile,
  appendToFile,
  modifyFile,
  handleAlternative,
};
