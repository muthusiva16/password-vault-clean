# Password Vault MVP 
A simple password generator and vault app built with Next.js and MongoDB.

## Live Demo
https://password-vault-clean.vercel.app/

## Tech Stack
- Frontend: Next.js + TypeScript
- Backend: Next.js API Routes
- Database: MongoDB
- Encryption: Web Crypto API (AES-GCM, client-side)

---

## Features
- Generate strong passwords
- User authentication (email + password)
- Save vault items: title, username, password, URL, notes
- Client-side encryption (no plaintext stored on server)
- Copy password to clipboard (auto-clears after 10-20 seconds)
- Search and filter items

---

## Setup Instructions

1. **Clone the repo**
```bash
git clone https://github.com/muthusiva16/password-vault-clean.git
cd password-vault-clean
