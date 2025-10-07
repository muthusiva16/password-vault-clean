# Password Vault (MVP)

Tech: Next.js (TypeScript) + MongoDB. Client-side encryption (Web Crypto API).

## Features
- Generate strong passwords (custom length, characters, exclude look-alike chars).
- Sign up / log in (email + password).
- Vault CRUD (title, username, password, URL, notes).
- Client-side AES-GCM encryption of entries (server stores only encrypted blobs).
- Copy to clipboard with auto-clear.
- Basic search.

## Run locally
1. Clone / unzip and cd into the project:
   ```bash
   cd password-vault
   ```

2. Install:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and fill:
   ```
   MONGODB_URI=...
   JWT_SECRET=...
   NODE_ENV=development
   ```

4. Start dev server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Crypto note
Client derives a vault key from the user password using PBKDF2 (200k iterations) and uses AES-GCM to encrypt vault entries on the client. This keeps plaintext out of the server; the server stores salts and encrypted blobs only.

