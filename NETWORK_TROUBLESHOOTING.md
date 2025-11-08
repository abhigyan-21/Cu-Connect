# Network Connectivity Troubleshooting

## Issue: Friend Joined But No Video/Audio

This is a common WebRTC issue when users are on different networks. Here's what's happening and how to fix it:

## What Was Added

### 1. TURN Servers ✅
Added free TURN servers from Open Relay Project to help with NAT traversal:
- `turn:openrelay.metered.ca:80`
- `turn:openrelay.metered.ca:443`
- `turn:openrelay.metered.ca:443?transport=tcp`

### 2. Better Logging ✅
- Logs stream tracks before sending
- Logs received stream tracks
- Monitors ICE connection state
- Shows connection status

### 3. User Feedback ✅
- Toast notifications for connection events
- Error messages for connection issues
- Peer connected/disconnected alerts

## How to Debug

### Step 1: Check Browser Console (F12)

Both users should check their console for these messages:

**Good Signs ✅:**
```
My peer ID: 1234567890-abc123
Joined room, existing peers: ["0987654321-xyz789"]
Calling peer: 0987654321-xyz789
Calling with stream: ["video: true", "audio: true"]
Received stream from: 0987654321-xyz789
Remote stream tracks: ["video: true", "audio: true"]
ICE connection state: connected
```

**Bad Signs ❌:**
```
Remote stream has no tracks!
ICE connection state: failed
ICE connection state: disconnected
Cannot call peer: invalid stream
```

### Step 2: Verify Permissions

**Both users must:**
1. Allow camera access
2. Allow microphone access
3. Check browser address bar for permission icon
4. Refresh if permissions were just granted

### Step 3: Check Stream Status

In console, type:
```javascript
// Check if you have a local stream
document.querySelector('video').srcObject

// Should show MediaStream with tracks
```

### Step 4: Test ICE Connectivity

Open console and check ICE connection state:
```
ICE connection state: checking → connecting → connected ✅
ICE connection state: checking → failed ❌
```

## Common Issues & Solutions

### Issue 1: "Remote stream has no tracks"

**Cause:** Friend hasn't granted camera/mic permissions

**Solution:**
1. Friend should check browser permissions
2. Look for camera icon in address bar
3. Click and allow camera/microphone
4. Refresh the page

### Issue 2: "ICE connection failed"

**Cause:** Firewall/NAT blocking connection

**Solutions:**
1. **Try mobile data** instead of WiFi
2. **Try different network** (coffee shop, home, etc.)
3. **Disable VPN** if using one
4. **Check firewall settings**

### Issue 3: Can see video but no audio

**Cause:** Audio track disabled or not shared

**Solution:**
1. Check if microphone is muted (red mic icon)
2. Verify microphone permissions
3. Try different microphone in settings
4. Check system audio settings

### Issue 4: Can hear audio but no video

**Cause:** Video track disabled or camera not working

**Solution:**
1. Check if camera is off (red camera icon)
2. Verify camera permissions
3. Try different camera in settings
4. Check if another app is using camera

## Network Requirements

### Works Best On:
- ✅ Home WiFi (most cases)
- ✅ Mobile data (4G/5G)
- ✅ Public WiFi (coffee shops)
- ✅ University networks (usually)

### May Have Issues On:
- ⚠️ Corporate networks (strict firewalls)
- ⚠️ Some VPNs
- ⚠️ Symmetric NAT
- ⚠️ Very restrictive firewalls

### Ports Used:
- UDP: 3478 (STUN)
- TCP/UDP: 80, 443 (TURN)
- UDP: Random high ports for media

## Testing Checklist

### Before Calling Friend:

**You:**
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Can see your own video
- [ ] Console shows "My peer ID: ..."
- [ ] Console shows "Joined room..."

**Friend:**
- [ ] Camera permission granted
- [ ] Microphone permission granted
- [ ] Can see their own video
- [ ] Console shows "My peer ID: ..."
- [ ] Console shows "Joined room..."

### During Call:

**Both Users:**
- [ ] Console shows "Calling peer: ..."
- [ ] Console shows "Received stream from: ..."
- [ ] Console shows "ICE connection state: connected"
- [ ] Toast notification: "Peer Connected!"

## Advanced Debugging

### Check ICE Candidates

In console:
```javascript
// This will show what connection methods are being tried
// Look for "relay" candidates (TURN) if direct connection fails
```

### Check Media Tracks

```javascript
// Get local stream
const localVideo = document.querySelector('video');
const stream = localVideo.srcObject;

// Check tracks
stream.getTracks().forEach(track => {
  console.log(`${track.kind}: ${track.enabled}, ${track.readyState}`);
});

// Should show:
// video: true, live
// audio: true, live
```

### Monitor Connection Quality

```javascript
// Check stats (advanced)
const pc = /* get peer connection from call */;
pc.getStats().then(stats => {
  stats.forEach(stat => {
    if (stat.type === 'inbound-rtp') {
      console.log('Receiving:', stat);
    }
  });
});
```

## Quick Fixes

### Fix 1: Refresh Both Pages
Sometimes a simple refresh helps:
1. Both users refresh
2. Rejoin the room
3. Wait 5-10 seconds

### Fix 2: Try Different Browser
- Chrome/Edge (best compatibility)
- Firefox (good)
- Safari (may have issues)

### Fix 3: Use Mobile Hotspot
If on restrictive WiFi:
1. Enable mobile hotspot
2. Connect computer to hotspot
3. Try again

### Fix 4: Check System Settings

**Windows:**
1. Settings → Privacy → Camera/Microphone
2. Ensure browser has access

**Mac:**
1. System Preferences → Security & Privacy
2. Camera/Microphone tabs
3. Check browser is allowed

## What to Tell Your Friend

Send them this checklist:

```
1. Open the room link
2. Click "Allow" for camera and microphone
3. Wait for "Connected!" message
4. Check console (F12) for errors
5. Look for "Peer Connected!" notification
6. If no video after 10 seconds:
   - Refresh the page
   - Try different network
   - Check permissions again
```

## Still Not Working?

### Last Resort Options:

1. **Both use mobile data** (bypasses network restrictions)
2. **Try at different time** (network congestion)
3. **Use different devices** (phone vs computer)
4. **Check if ISP blocks WebRTC** (rare but possible)

### Report Issue:

If still not working, collect this info:
- Browser and version
- Operating system
- Network type (WiFi/mobile/corporate)
- Console errors
- ICE connection state

## Success Indicators

You'll know it's working when:
- ✅ Both see "Peer Connected!" toast
- ✅ Both see each other's video
- ✅ Both hear each other's audio
- ✅ Console shows "ICE connection state: connected"
- ✅ No error messages in console

## Prevention

For best results:
1. Use Chrome or Edge browser
2. Use home WiFi or mobile data
3. Grant permissions before joining
4. Close other apps using camera/mic
5. Have good internet connection (>1 Mbps)

---

**The TURN servers should help with most network issues. If still having problems, try mobile data!** 📱
