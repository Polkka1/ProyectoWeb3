## Vercel Deployment

This project is configured for deployment on [Vercel](https://vercel.com/):

- Uses `vercel.json` for custom server routing.
- Main entry: `app.js` (Node.js/Express)
- All API endpoints are available under `/api` after deployment.

### Steps
1. Push your code to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel dashboard.
3. Set environment variables in Vercel project settings.
4. Deploy and test your endpoints at `https://your-app.vercel.app/api/...`

### Continuous Deployment via GitHub
1. Initialize Git (if not already):
	```bash
	git init
	git add -A
	git commit -m "chore: initial vercel setup"
	```
2. Create a GitHub repo and set remote `origin`:
	```bash
	# Replace with your GitHub URL
	git remote add origin https://github.com/<your-username>/<your-repo>.git
	git branch -M main
	git push -u origin main
	```
3. In Vercel: New Project → Import Git Repository → select your repo.
4. Set environment variables in Vercel → Settings → Environment Variables
	- `MONGODB_URI` (MongoDB Atlas connection string)
	- `NODE_ENV` = `production`
	- any others used in code
5. Configure:
	- Production Branch: `main`
	- Automatically Deploy: On `git push`
	- Preview Deployments: For pull requests
6. Verify health endpoint:
	- `GET https://<your-project>.vercel.app/api/health`