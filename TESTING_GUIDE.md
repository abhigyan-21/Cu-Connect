# Video Connection Testing Guide

## Critical Changes Made

### 1. **Forced TURN Relay Mode**
Changed `iceTransportPolicy` from `'all'` to `'relay'` to force all connections through TURN servers, bypassing NAT/firewall issues.

### 2. **Staggered Peer Calls**
Added delays between calling multiple peers to prevent connection race conditions.

### 3. **Better Error Handling**
Improved logging and error messages for debugging.

## Why Videos Aren't Showing

The issue you're experiencing is **ICE connection failure**, which happens when:

1. **Both users are behind restrictive NATs** (routers/firewalls)
2. **Corporate/University networks** block peer-to-peer connections
3. **Same WiFi network** with client isolation enabled
4. **TURN server credentials expired** or rate-limited

## Testing Scenarios (Success Rate)

### ✅ HIGH SUCCESS (90%+)
1. **Both on Mobile Data (4G/5G)**
   - Open app on phone 1 (mobile data)
   - Open app on phone 2 (mobile data)
   - Create room on phone 1
   - Join from phone 2

2. **One Mobile Data + One WiFi**
   - User 1: Mobile data
   - User 2: Home WiFi
   - Should work reliably

### ⚠️ MEDIUM SUCCESS (50-70%)
1. **Both on Different Home WiFi Networks**
   - Depends on router configuration
   - May need port forwarding

2. **One on Home WiFi + One on Public WiFi**
   - Public WiFi often has restrictions

### ❌ LOW SUCCESS (10-30%)
1. **Both on Same WiFi Network**
   - Router may block peer-to-peer
   - Try enabling UPnP on router

2. **Corporate/University Networks**
   - Usually blocked by firewall
   - VPN may help (or make it worse)

3. **Behind CGNAT (Carrier-Grade NAT)**
   - Some mobile carriers use CGNAT
   - TURN relay should help

## How to Test

### Step 1: Clear Everything
```bash
# Clear browser cache
Ctrl+Shift+Delete (Chrome/Edge)
Cmd+Shift+Delete (Mac)

# Or use Incognito/Private mode
```

### Step 2: Test Locally First
1. Open `http://localhost:9002` in Chrome
2. Create a room
3. Copy room ID
4. Open `http://localhost:9002` in Edge (or another browser)
5. Join with room ID
6. **Expected:** Should see both videos (same device = no NAT issues)

### Step 3: Test on Different Networks
1. **Device 1:** Open on mobile data
2. **Device 2:** Open on WiFi
3. Create room on Device 1
4. Join from Device 2
5. **Check console logs** (F12)

## Console Logs to Check

### ✅ Good Signs
```
✅ Peer opened with ID: ...
✅ Joined room, existing peers: [...]
📞 Calling peer: ...
📺 Received stream from: ...
✅ ICE connection established successfully!
Connection Stable
```

### ❌ Bad Signs
```
❌ ICE connection failed
❌ Peer connection failed completely
❌ Connection state: failed
ERROR PeerJS: Could not connect to peer
```

## Troubleshooting

### Issue: "ICE connection disconnected"
**Solution:**
- Switch to mobile data
- Try different network
- Check if TURN servers are working

### Issue: "Peer connection failed completely"
**Solution:**
- One user should be on mobile data
- Disable VPN if using
- Check firewall settings

### Issue: "No video track" or "Camera is off"
**Solution:**
- Allow camera/microphone permissions
- Check if camera is being used by another app
- Restart browser

### Issue: Videos show but freeze
**Solution:**
- Poor network connection
- Try lower quality (will add setting)
- Close other tabs/apps

## Production Recommendations

### For Reliable Connections:
1. **Use a Media Server (SFU)**
   - Mediasoup
   - Janus
   - Jitsi

2. **Use Managed Service**
   - Daily.co
   - Agora
   - Twilio Video

3. **Deploy Your Own TURN Server**
   - Coturn on AWS/DigitalOcean
   - More reliable than free TURN servers

### Current Limitations:
- Free TURN servers have rate limits
- Peer-to-peer doesn't scale beyond 4-5 users
- Network restrictions can't always be bypassed

## Quick Test Commands

### Test MongoDB Connection
```bash
npm run test:db
```

### Test Local Development
```bash
npm run dev
# Open http://localhost:9002
```

### Check Vercel Deployment
```bash
# Visit your Vercel URL
https://your-app.vercel.app/api/health
```

## Expected Behavior After Fix

1. **Forced TURN relay** means connections will ALWAYS go through TURN server
2. **Slower initial connection** (1-3 seconds) but more reliable
3. **Higher bandwidth usage** (data goes through relay server)
4. **Better success rate** on restrictive networks

## If Still Not Working

### Try This:
1. **Both users use mobile data** (not WiFi)
2. **Clear browser cache completely**
3. **Use Chrome or Edge** (best WebRTC support)
4. **Check console for specific errors**
5. **Try at different time** (TURN server may be rate-limited)

### Report Issues With:
- Browser and version
- Network type (WiFi/Mobile data)
- Console error messages
- Screenshot of console logs

---

**Note:** The `iceTransportPolicy: 'relay'` setting is for testing. Change back to `'all'` for production to allow direct connections when possible.
