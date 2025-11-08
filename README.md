# CU-Connect

A real-time video conferencing application built with Next.js and WebRTC.

## Features

- 🎥 HD Video & Audio - Crystal-clear video quality
- 🎤 Audio Controls - Mute/unmute and device selection
- 🖥️ Screen Share - Share your screen for presentations
- 🚪 Easy Rooms - Create or join rooms instantly with a simple code

## Getting Started

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:9002](http://localhost:9002)

### Deployment

#### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy"

Or use Vercel CLI:
```bash
npm install -g vercel
vercel
```

## Tech Stack

- Next.js 15 with Turbopack
- React 18
- TypeScript
- Tailwind CSS
- WebRTC for peer-to-peer video/audio
- Radix UI components

## Project Structure

```
Cu-Connect/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── room/         # Room pages
│   │   ├── layout.tsx    # Root layout
│   │   └── page.tsx      # Home page
│   ├── components/       # React components
│   │   ├── ui/           # UI components
│   │   ├── room-controls.tsx
│   │   └── video-player.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── use-milan.ts  # WebRTC logic
│   │   └── use-toast.ts
│   └── lib/              # Utility functions
├── public/               # Static assets
└── package.json
```

## License

MIT
