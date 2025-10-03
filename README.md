# shifa-kurdish-academic-hub

## Project info

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment Variables

This project uses several environment variables for configuration. Copy `.env.example` to `.env.local` and configure the values as needed.

### Required Variables

- `VITE_GEMINI_API_KEY`: Your Gemini AI API key
- `VITE_GEMINI_API_URL`: Gemini API endpoint URL

### Optional Variables

- `I18N_DEBUG`: Enable i18n debugging logs (default: `false` in production, `true` in development)
  - Set to `true` to enable detailed i18n debugging
  - Automatically enabled when `NODE_ENV` is not `production`
- `VITE_ENABLE_DEBUG`: General application debugging (default: `false`)
- `VITE_ENABLE_ANALYTICS`: Enable analytics tracking (default: `true`)
- `VITE_GA_TRACKING_ID`: Google Analytics tracking ID
- `VITE_SENTRY_DSN`: Sentry error tracking DSN

## How can I deploy this project?

## Can I connect a custom domain to this project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.
