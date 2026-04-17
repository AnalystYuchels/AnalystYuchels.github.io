# Supabase Setup Guide — Testimonials

This guide matches the **current Supabase dashboard (2025/2026 redesign)**
including the new API key system where keys start with `sb_publishable_...`
and `sb_secret_...` instead of the old JWT format.

Estimated time: **15–20 minutes**.
Cost: **Free forever**.

---

## What changed in the new Supabase key system

| Old name         | New name             | Format                    | Where it goes       |
|------------------|----------------------|---------------------------|---------------------|
| `anon` key       | **Publishable key**  | `sb_publishable_...`      | Frontend code ✅    |
| `service_role`   | **Secret key**       | `sb_secret_...`           | Never in code ❌    |

The Supabase JS client accepts the new format identically to the old one.
In your code, `SUPABASE_PUBLISHABLE_KEY` is the new name for what was
previously called `SUPABASE_ANON_KEY`. Nothing else changed.

---

## What you're setting up

A PostgreSQL table called `testimonials` with these columns:

| Column       | Type        | Description                              |
|--------------|-------------|------------------------------------------|
| `id`         | uuid        | Auto-generated unique ID per row         |
| `name`       | text        | Submitter's full name                    |
| `role`       | text        | Their job title / relationship to you    |
| `message`    | text        | The testimonial text                     |
| `status`     | text        | `'pending'` (new) or `'approved'` (live) |
| `created_at` | timestamptz | Auto-set to the submission time          |

---

## Step 1 — Your project

Your screenshot shows a project called **portfolio** already exists under
the **AnalystYuchels** organisation. You're already past this step.

Your **Project ID** is visible in your screenshot: `ljawamabjuakbykldxid`
This means your **Project URL** is:
```
https://ljawamabjuakbykldxid.supabase.co
```

---

## Step 2 — Create the testimonials table

Navigation in the new UI uses icons on the far-left edge of the screen.
Hover each icon to see its label.

1. Click the **Table Editor** icon (looks like a grid, near the top)
2. Click **New table**
3. Set **Name** to `testimonials`
4. Toggle **Enable Row Level Security (RLS)** to **ON**
5. Add these columns using **Add column**:

   | Name         | Type        | Default value | Notes              |
   |--------------|-------------|---------------|--------------------|
   | `name`       | text        | *(none)*      | Uncheck "nullable" |
   | `role`       | text        | *(none)*      | Uncheck "nullable" |
   | `message`    | text        | *(none)*      | Uncheck "nullable" |
   | `status`     | text        | `pending`     | Type `pending`     |
   | `created_at` | timestamptz | `now()`       | May already exist  |

   > `id` is created automatically — do not add it manually.

6. Click **Save**

---

## Step 3 — Set Row Level Security (RLS) policies

1. Click the **Authentication** icon in the far-left icon bar
2. Click **Policies** in the sub-menu
3. Find the `testimonials` table and click **New policy**

### Policy 1 — Let visitors read approved testimonials

1. Click **New policy** → **Create policy**
2. Fill in:
   - **Policy name**: `Allow public to read approved testimonials`
   - **Policy command**: `SELECT`
   - **Target roles**: tick `anon`
   - **USING expression**:
     ```sql
     status = 'approved'
     ```
3. Click **Save policy**

### Policy 2 — Let visitors submit a testimonial

1. Click **New policy** → **Create policy**
2. Fill in:
   - **Policy name**: `Allow public to submit testimonials`
   - **Policy command**: `INSERT`
   - **Target roles**: tick `anon`
   - **WITH CHECK expression**:
     ```sql
     status = 'pending'
     ```
3. Click **Save policy**

---

## Step 4 — Get your API credentials (new key system)

1. In the Settings sidebar, click **API Keys**
2. You will see two sections:

   **Publishable key** (this is what goes in your code)
   - Starts with `sb_publishable_...`
   - Click the copy icon next to the key value
   - This is safe to use in frontend code

   **Secret key** (this NEVER goes in your code)
   - Starts with `sb_secret_...`
   - Only used server-side or in Supabase's own dashboard
   - Never paste this anywhere in your portfolio files

---

## Step 5 — Rotating a compromised key (new workflow)

The old "Rotate" button is gone. The new system uses **create and revoke**:

1. In **Settings → API Keys**, click **+ New publishable key**
2. Give it a name like `Production April 2026`
3. Copy the new `sb_publishable_...` value
4. Update `config.js` on your computer with the new key
5. Test locally — make sure testimonials still load and submit
6. Once confirmed working, go back to **Settings → API Keys**
7. Find the old key, click the **three dots (⋮)** on its row
8. Click **Delete API key** — the old key is now dead

This zero-downtime approach means your site keeps working on the old
key while you switch over, rather than breaking the moment you rotate.

---

## Step 6 — Add credentials to config.js

On your computer, open your portfolio folder. Copy `config.example.js`
and rename the copy to `config.js`. Open it in VS Code and fill in:

```javascript
window.APP_CONFIG = {
  SUPABASE_URL: 'https://ljawamabjuakbykldxid.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_...', // your full key here
};
```

Press **Ctrl+S** to save. This file is in `.gitignore` — it will never
be committed to GitHub.

---

## Step 7 — Test it locally

1. Double-click `index.html` to open in your browser
2. Open DevTools (F12) → Console tab
3. There should be no red errors about Supabase credentials
4. Scroll to the Testimonials section — skeletons should resolve
5. Submit a test testimonial using the form
6. Go to **Supabase → Table Editor → testimonials**
7. You should see your test row with `status = pending`

---

## Step 8 — Approve a testimonial

When a real testimonial comes in:

1. Go to **Supabase → Table Editor → testimonials**
2. Click the row with `status = pending`
3. Click the `status` cell → change `pending` to `approved`
4. Click **Save**
5. Reload your portfolio — the card appears in the carousel

> Tip: use the **Filter** button above the table, set `status = pending`,
> to see only unreviewed submissions.

---

## Deploying to GitHub Pages

Because `config.js` is gitignored, GitHub Pages won't have it automatically.
After pushing all other files, add `config.js` directly on GitHub:

1. Go to your repo on GitHub
2. Click **Add file → Create new file**
3. Name it `config.js`
4. Paste the contents with your real keys
5. Commit directly on GitHub (this bypasses your local git)

> Note: this means `config.js` will be visible in your GitHub repo.
> For a portfolio using only the Publishable key (protected by RLS),
> this is acceptable. Never do this with a Secret key.

---

## Commit message

```bash
git add .gitignore config.example.js script.js index.html
git commit -m "fix: move Supabase credentials to gitignored config.js"
```

---

## Security notes

- The **Publishable key** (`sb_publishable_...`) is designed to be public.
  Your RLS policies are what limit what it can do — not secrecy.
- The **Secret key** (`sb_secret_...`) has full unrestricted database access.
  It must **never** appear in any frontend file or be committed to GitHub.
- If you accidentally commit either key, treat it as compromised immediately:
  create a new key and delete the old one using the steps in Step 5 above.