// Shared in-memory room storage
// In production, replace with Redis, Supabase, or Firebase
export const rooms = new Map<string, Set<string>>();

// Clean up old/empty rooms periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    rooms.forEach((peers, roomId) => {
      if (peers.size === 0) {
        rooms.delete(roomId);
        console.log(`Cleaned up empty room: ${roomId}`);
      }
    });
  }, 5 * 60 * 1000); // Every 5 minutes
}
