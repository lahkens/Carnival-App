# Blaize Carnival — Next.js App (Converted)

Converted the provided single-file React app into a modern Next.js (app-router) structure.
Each React component has its own `.module.css`.

To run locally:

1. Install dependencies
   ```bash
   npm install
   ```
2. Run development server
   ```bash
   npm run dev
   ```

Notes:
- API URL is kept as provided. Update `lib/api.js` if you want a different endpoint.
- All UI components are client components (`'use client'`) and have separate CSS modules.
