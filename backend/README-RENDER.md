# Deploying the backend to Render

This file describes a quick way to deploy the `backend/` service to Render (https://render.com).

Prerequisites
- A GitHub repository with this project pushed (Render connects to GitHub/GitLab).
- A Render account.

Steps

1) Push your code to GitHub

```bash
cd e:/portfo
git init            # if not already a repo
git add .
git commit -m "Add portfolio backend"
git remote add origin <your-github-repo-url>
git push -u origin main
```

2) Create a new Web Service on Render

- In Render dashboard click New -> Web Service.
- Connect your GitHub repo and select the repository and branch (`main`).
- For the Root Directory choose `/` (we'll use build/start commands below to point to `backend/`).
- Set the Build Command to:

```
cd backend && npm install
```

- Set the Start Command to:

```
cd backend && npm start
```

3) Set environment variables

- In the Render service dashboard, open the Environment tab and set these variables:

  - `EMAIL_USER` = your Gmail address (e.g. `you@example.com`)
  - `EMAIL_PASS` = your Gmail App Password (16 chars) OR your SendGrid API key if using SendGrid
  - `PORT` = `5000`

4) Deploy

- Click Deploy. Render will build and run your backend. The service URL will be shown in the dashboard.

5) Update frontend

- In your frontend code (`script.js`) set the POST target to the deployed URL, for example:

```js
fetch('https://portfolio-backend.onrender.com/send-email', {...})
```

Notes & best practices
- For production deliverability prefer a transactional email service (SendGrid, Mailgun) and store API keys as `EMAIL_PASS` or a dedicated key like `SENDGRID_API_KEY`.
- Add rate limiting and CAPTCHA to avoid spam abuse.
- Do not commit `.env` to source control.
