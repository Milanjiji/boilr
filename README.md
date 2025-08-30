# 🚀 Boilr

A CLI tool for generating boilerplate code to speed up your development workflow.

## 📦 Installation

### Global Installation (Recommended)
```bash
npm install -g boilr
```

### Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd boilr

# Install dependencies
npm install

# Link globally for testing
npm link
```

## 🚀 Usage

### Basic Usage
```bash
boilr
```
Shows the welcome message and available commands.

### Available Commands

#### React Router Setup
Set up React Router boilerplate in your React application:

```bash
boilr react-router-dom
```

**What it does:**
- ✅ Checks if you're in a React project
- 📦 Installs `react-router-dom` package
- 🔧 Wraps your `<App/>` component with `<BrowserRouter>` in `src/index.js`
- 📄 Creates `src/routes.jsx` with sample route configuration
- 📁 Creates `src/pages/` directory with sample `Home.jsx` and `About.jsx` components
- 🔗 Updates `src/App.js` with navigation links and route integration

## 📋 Requirements

### For React Router Setup
- Must be run in a React project directory
- Requires `react` and `react-dom` in your `package.json`
- Standard React project structure with `src/` directory

## 🛠️ Example Workflow

1. **Create a new React app:**
   ```bash
   npx create-react-app my-app
   cd my-app
   ```

2. **Set up React Router:**
   ```bash
   boilr react-router-dom
   ```

3. **Start your development server:**
   ```bash
   npm start
   ```

Your app will now have:
- Navigation between Home and About pages
- Proper React Router setup
- Clean, organized routing structure

## 📁 Generated Structure

After running `boilr react-router-dom`, your project will have:

```
src/
├── index.js          # Updated with BrowserRouter wrapper
├── App.js             # Updated with navigation and AppRoutes
├── routes.jsx         # Route configuration (new)
└── pages/             # New directory
    ├── Home.jsx       # Sample Home page
    └── About.jsx      # Sample About page
```

## 🔍 What Gets Modified

### `src/index.js`
- Adds `BrowserRouter` import
- Wraps `<App />` with `<BrowserRouter>`

### `src/App.js`
- Adds `Link` and `AppRoutes` imports
- Adds navigation menu with Home and About links
- Includes `<AppRoutes />` component

### New Files Created
- `src/routes.jsx` - Route definitions
- `src/pages/Home.jsx` - Sample Home page component
- `src/pages/About.jsx` - Sample About page component

## ⚠️ Safety Features

- **Project Detection**: Only runs in valid React projects
- **Duplicate Prevention**: Skips modifications if already present
- **Clear Feedback**: Shows detailed progress and warnings
- **Non-destructive**: Won't overwrite existing files

## 🧩 Extensibility

Boilr is designed to be easily extensible. To add new boilerplate generators:

1. Create a new directory in `boilrs/`
2. Add your generator logic
3. Register the command in `index.js`

## 🐛 Troubleshooting

### "This is not a React project" Error
- Ensure you're in a React project directory
- Check that `package.json` contains `react` and `react-dom` dependencies

### Files Not Being Created
- Verify you have write permissions in the project directory
- Check that the `src/` directory exists

### Already Exists Warnings
- These are normal and indicate the tool is preventing duplicates
- No action needed - your existing code is preserved

## 📄 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 🔧 Development

```bash
# Clone the repo
git clone <your-repo-url>
cd boilr

# Install dependencies
npm install

# Test locally
npm link
boilr react-router-dom

# Unlink when done
npm unlink
```

---

*Built with ❤️ for faster React development*
