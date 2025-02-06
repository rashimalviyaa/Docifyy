# Next.js Project (Deployed on- [Docifyy](https://rashisdocify.netlify.app))

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 🚀 Features

- **Authentication**: User authentication is handled by Clerk.
- **Real-time Collaboration**: Liveblocks enables real-time collaboration.
- **Rich Text Editing**: Lexical provides an enhanced text editing experience.
- **Notifications**: Users receive alerts for mentions and document access changes.

---

## 📂 Project Structure

```
.
├── .env.local
├── .eslintrc.json
├── .gitignore
├── .next/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/page.tsx
│   │   ├── sign-up/
│   │   │   └── [[...sign-up]]/page.tsx
│   ├── (root)/
│   │   ├── documents/
│   │   │   └── [id]/page.tsx
│   │   └── page.tsx
│   ├── api/
│   │   ├── liveblocks-auth/route.ts
│   │   └── sentry-example-api/route.ts
│   ├── global-error.tsx
│   ├── globals.css
│   ├── Provider.tsx
│   └── sentry-example-page/page.tsx
├── components/
│   ├── editor/
│   │   ├── Editor.tsx
│   │   └── plugins/
│   │       ├── FloatingToolbarPlugin.tsx
│   │       ├── Theme.ts
│   │       └── ToolbarPlugin.tsx
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── popover.tsx
├── lib/
├── public/
├── styles/
│   ├── dark-theme.css
│   └── light-theme.css
├── tailwind.config.ts
├── tsconfig.json
├── README.md
└── package.json
```

---

## 🛠 Setup & Installation

### 1️⃣ Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### 2️⃣ Set Up Environment Variables
Create a `.env.local` file in the root directory and add:
```ini
NEXT_PUBLIC_CLERK_FRONTEND_API=<your-clerk-frontend-api>
CLERK_API_KEY=<your-clerk-api-key>
LIVEBLOCKS_SECRET_KEY=<your-liveblocks-secret-key>
NEXT_PUBLIC_SENTRY_DSN=<your-sentry-dsn>
```

### 3️⃣ Run the Development Server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) to view the app.

### 4️⃣ Build & Start in Production
```bash
npm run build && npm start
# or
yarn build && yarn start
# or
pnpm build && pnpm start
# or
bun build && bun start
```

---

## 📡 API Routes

### 1. **Liveblocks Authentication**
- **Route**: `/api/liveblocks-auth`
- **Method**: `POST`
- **Description**: Authenticates the user with Liveblocks.

### 2. **Sentry Example API**
- **Route**: `/api/sentry-example-api`
- **Method**: `GET`
- **Description**: A faulty API route to test Sentry's error monitoring.

---

## 📚 Learn More

To explore Next.js, check out the following resources:

- 📖 [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API.
- 📚 [Learn Next.js](https://nextjs.org/learn) - Interactive Next.js tutorial.

---

### 💡 Contributing

Feel free to contribute! Fork the repository, create a new branch, and submit a PR.

---

### 📜 License

This project is licensed under the MIT License.
