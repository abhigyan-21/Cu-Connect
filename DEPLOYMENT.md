# Deployment Guide for CU-Connect

## Quick Deploy to Vercel (Recommended - 5 minutes)

Vercel is the easiest way to deploy Next.js applications and provides the best performance.

### Option 1: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click "Deploy"
   - Your app will be live in ~2 minutes!

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow the prompts
# Your app will be deployed and you'll get a URL
```

## Deploy to Netlify

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

## Deploy to Railway

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Railway**
   - Go to [railway.app](https://railway.app)
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy

## Important Notes

### WebRTC Considerations

- **HTTPS Required**: WebRTC requires HTTPS in production. All the platforms above provide free SSL certificates.
- **STUN/TURN Servers**: For production use with users behind NATs/firewalls, you may need to configure TURN servers.
- **Peer-to-Peer**: Current implementation uses peer-to-peer connections. For more than 2-3 users, consider implementing a media server (SFU).

### Environment Variables

This project doesn't require any environment variables for basic functionality.

### Custom Domain

All platforms support custom domains:
- **Vercel**: Project Settings → Domains
- **Netlify**: Site Settings → Domain Management
- **Railway**: Project Settings → Domains

## Testing Your Deployment

1. Open your deployed URL
2. Click "Create a New Room"
3. Copy the room URL
4. Open it in another browser/device
5. Allow camera/microphone permissions
6. You should see both video streams!

## Troubleshooting

### Camera/Microphone Not Working
- Ensure HTTPS is enabled (required for WebRTC)
- Check browser permissions
- Try a different browser (Chrome/Edge recommended)

### Can't Connect to Other Users
- Check if both users are on HTTPS
- Firewall/NAT issues may require TURN server configuration
- Try from different networks

### Build Fails
- Run `npm run build` locally first
- Check for TypeScript errors
- Ensure all dependencies are installed

## Support

For issues or questions, please open an issue on GitHub.
