# SolSwap — Solana Decentralized Exchange

A fast, professional DEX interface built on Solana.

## Deploy to Vercel (Recommended)

The easiest way to get this running — no local setup needed:

### Step 1: Go to your GitHub repo
Visit **https://github.com/finishstrong23/solana_dex**

### Step 2: Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import **finishstrong23/solana_dex**
4. Vercel auto-detects Next.js — just click **"Deploy"**
5. Wait ~60 seconds and you'll get a live URL like `solana-dex.vercel.app`

That's it. Done.

---

## Run Locally (Optional)

If you want to run it on your own machine:

```bash
# 1. Clone the repo
git clone https://github.com/finishstrong23/solana_dex.git

# 2. Enter the project folder
cd solana_dex

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev
```

Then open **http://localhost:3000** in your browser.

> **Common mistake:** Make sure you `cd solana_dex` first!
> Running `npm run dev` from the wrong folder will give an ENOENT error.

## Tech Stack

- **Next.js 16** + TypeScript
- **Tailwind CSS v4**
- **Solana Wallet Adapter** (Phantom, Solflare)
- **Lucide React** icons
