# Architecture Showcase Website

An architecture case showcase website built with Next.js 15, React 18, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Quick Start

### Installation
\`\`\`bash
npm install
\`\`\`

### Development
\`\`\`bash
npm run dev
\`\`\`

### Build
\`\`\`bash
npm run build
\`\`\`

### Production
\`\`\`bash
npm run build
npm start
\`\`\`

## 📋 Project Structure

\`\`\`
architecture-showcase/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── cases/
│   │   │   ├── search/
│   │   │   ├── auth/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── case-card.tsx
│   ├── lib/
│   ├── types/
│   └── data/
├── public/
│   ├── data/
│   │   └── cases.json
│   └── images/
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── postcss.config.js
├── .eslintrc.json
├── .gitignore
└── README.md
\`\`\`

## 🎨 Features

- ✅ Responsive design (Mobile, Tablet, Desktop)
- ✅ Dark mode support
- ✅ TypeScript with strict mode
- ✅ ESLint configuration
- ✅ Tailwind CSS v3.3
- ✅ Case listing and details
- ✅ Search and filtering
- ✅ User authentication (UI ready)
- ✅ Admin dashboard (UI ready)
- ✅ Optimized images (AVIF, WebP)

## 📊 Data

- 20 architecture cases
- 78 images
- 12 structured fields per case
- 57.9% extraction rate

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open http://localhost:3000

---

Built with ❤️ using Next.js 15
