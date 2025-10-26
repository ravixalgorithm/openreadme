<div align="center">
  <br />
  <a href="#" target="_blank">
    <img src="./public/openreadme-banner.png" alt="OpenReadme Banner" />
  </a>

  <br />
  © Open Dev Society. This project is licensed under AGPL-3.0; if you modify, redistribute, or deploy it (including as a web service), you must release your source code under the same license and cre[...]
  <br/>

  <div>
    <img src="https://img.shields.io/badge/-Next.js-black?style=for-the-badge&logoColor=white&logo=next.js&color=000000" alt="Next.js badge" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6"/>
    <img src="https://img.shields.io/badge/-Tailwind%20CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=38B2AC"/>
    <img src="https://img.shields.io/badge/-Puppeteer-black?style=for-the-badge&logoColor=white&logo=puppeteer&color=40E0D0"/>
    <img src="https://img.shields.io/badge/-GitHub%20Actions-black?style=for-the-badge&logoColor=white&logo=githubactions&color=2088FF"/>
    <img src="https://img.shields.io/badge/-Chromium-black?style=for-the-badge&logoColor=white&logo=googlechrome&color=4285F4"/>
    <img src="https://img.shields.io/badge/-ReadMe-black?style=for-the-badge&logoColor=white&logo=ReadMe&color=000"/>
  </div>
</div>

# OpenReadme

OpenReadme is a modern, open-source GitHub profile README generator that creates beautiful, customizable bento-style grids. Built with Next.js and serverless technology, it generates stunning profile images that **automatically update daily** with your latest GitHub stats.

> **✨ New**: Automated daily updates are now live! Your profile image refreshes automatically every day at midnight UTC with your latest GitHub statistics.

---

## 📋 Table of Contents

1. ✨ [Introduction](#introduction)
2. 🌍 [Open Dev Society Manifesto](#manifesto)
3. ⚙️ [Tech Stack](#tech-stack)
4. 🔋 [Features](#features)
5. 🤸 [Quick Start](#quick-start)
6. 🐳 [Docker Setup](#docker-setup)
7. 🔐 [Environment Variables](#environment-variables)
8. 🧱 [Project Structure](#project-structure)
9. 📡 [API & Integrations](#api--integrations)
10. 🧪 [Scripts & Tooling](#scripts--tooling)
11. 🤝 [Contributing](#contributing)
12. 🛡️ [Security](#security)
13. 📜 [License](#license)
14. 🙏 [Acknowledgements](#acknowledgements)

---

## ✨ Introduction

OpenReadme is a cutting-edge GitHub profile README generator powered by Next.js (App Router), Tailwind CSS, and serverless Chromium for dynamic image generation. Create stunning profile banners for your GitHub README that **automatically update daily** with your latest stats.

**How It Works:**
1. 🎨 Fill in your profile information on the dashboard
2. 💾 Save your data (stored securely in the repository)
3. 🤖 Our automated workflow generates your image daily at midnight UTC
4. 🔗 Get a static URL that always shows your latest stats
5. ✨ Embed it in your README and forget about it!

---

## 🔋 Features

- **🎨 Beautiful Profile Generation**
    - Multiple customizable themes
    - Bento-style grid layouts
    - Real-time GitHub stats (contributions, stars, PRs, issues)
    - Social media integration (GitHub, Twitter, LinkedIn)
    - Custom profile pictures and portfolio links

- **🔄 Automated Daily Updates** ✨
    - Automatic image regeneration every day at midnight UTC
    - GitHub Actions workflow handles everything
    - Static URLs that always stay current
    - No manual intervention required
    - Your stats are always fresh

- **⚡ Simple Setup**
    - Fill in your profile once on the dashboard
    - Save your data (commits to repository)
    - Get your permanent image URL
    - Embed in your README
    - Done! Updates happen automatically

- **🌐 API-First Design**
    - RESTful image generation API
    - Query parameter customization
    - Serverless architecture
    - Optimized image delivery

- **📱 Modern UI**
    - Responsive design
    - Dark theme optimized
    - Smooth animations
    - Intuitive user experience

- **🔧 Developer Experience**
    - TypeScript support
    - ESLint configuration
    - Hot reload development
    - Production-ready builds

---

## 🤸 Quick Start

**Prerequisites**
- Node.js 18+
- Git for version control

**Clone and Install**
```bash
git clone https://github.com/Open-Dev-Society/openreadme.git
cd openreadme

# Choose your package manager
npm install
# or
yarn install
# or
pnpm install
```

**Configure Environment**
- Create a `.env.local` file (see [Environment Variables](#environment-variables))

**Run Development**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**Build & Start (Production)**
```bash
npm run build && npm start
# or
yarn build && yarn start
# or
pnpm build && pnpm start
```

Open http://localhost:3000 to start creating your OpenReadme!

---

## 🔐 Environment Variables

Create `.env.local` at the project root:

```env
# Core Configuration
NODE_ENV=development

# GitHub Integration (Required for automated workflow)
GITHUB_TOKEN=ghp_your_personal_access_token_here
GITHUB_TOKEN_IMAGES=ghp_your_token_for_image_storage  # Optional, falls back to GITHUB_TOKEN

# Optional: Local Development
CHROME_EXECUTABLE_PATH=  # Optional for local Chromium path
```

**GitHub Token Permissions Required:**
- `repo` - Full control of private repositories (for updating user data files)
- `workflow` - Update GitHub Action workflows

**Security Notes**
- Keep private tokens server-side when possible
- Use environment-specific configurations
- Never commit sensitive credentials to version control
- Consider using secure environment management tools
- For production deployment (Vercel), add tokens to environment variables

---

## 📜 License

OpenReadme is and will remain free and open for everyone. This project is licensed under the AGPL-3.0 License - see the LICENSE file for details.

---

## 🙏 Acknowledgements

Special thanks to:
- **[OpBento by EdgeX HQ](https://opbento.edgexhq.tech)** - The original inspiration for this project
- The open-source community and all contributors who make OpenReadme possible
- Everyone using OpenReadme to showcase their work beautifully

Your support drives us forward! ⭐

---

<div align="center">
  <p>Built with ❤️ by <a href="https://opendevsociety.com">Open Dev Society</a></p>
  <p>
    <a href="https://github.com/Open-Dev-Society">
      <img src="https://img.shields.io/badge/Open%20Dev%20Society-GitHub-black?style=for-the-badge&logo=github" alt="Open Dev Society" />
    </a>
  </p>
</div>
