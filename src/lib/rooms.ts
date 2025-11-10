/**
 * @deprecated This file is no longer used. The application now uses MongoDB for room storage.
 * See src/lib/rooms-db.ts for the new implementation.
 * 
 * This file is kept for reference only and can be safely deleted.
 */

// Legacy in-memory room storage (DEPRECATED - DO NOT USE)
// Replaced with MongoDB implementation in rooms-db.ts
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
