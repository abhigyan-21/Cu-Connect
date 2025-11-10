import { getDatabase } from './mongodb';

export interface Room {
  roomId: string;
  peers: string[];
  createdAt: Date;
  updatedAt: Date;
}

const COLLECTION_NAME = 'rooms';

export async function createRoom(roomId: string): Promise<Room> {
  const db = await getDatabase();
  const collection = db.collection<Room>(COLLECTION_NAME);

  const existingRoom = await collection.findOne({ roomId });
  if (existingRoom) {
    throw new Error('Room already exists');
  }

  const room: Room = {
    roomId,
    peers: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await collection.insertOne(room);
  return room;
}

export async function getRoom(roomId: string): Promise<Room | null> {
  const db = await getDatabase();
  const collection = db.collection<Room>(COLLECTION_NAME);
  return await collection.findOne({ roomId });
}

export async function addPeerToRoom(roomId: string, peerId: string): Promise<string[]> {
  const db = await getDatabase();
  const collection = db.collection<Room>(COLLECTION_NAME);

  const room = await collection.findOne({ roomId });
  if (!room) {
    throw new Error('Room not found');
  }

  const existingPeers = room.peers || [];
  
  // Don't add if already exists
  if (existingPeers.includes(peerId)) {
    return existingPeers;
  }

  await collection.updateOne(
    { roomId },
    {
      $addToSet: { peers: peerId },
      $set: { updatedAt: new Date() },
    }
  );

  return existingPeers;
}

export async function removePeerFromRoom(roomId: string, peerId: string): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Room>(COLLECTION_NAME);

  await collection.updateOne(
    { roomId },
    {
      $pull: { peers: peerId },
      $set: { updatedAt: new Date() },
    }
  );

  // Clean up empty rooms
  const room = await collection.findOne({ roomId });
  if (room && room.peers.length === 0) {
    await collection.deleteOne({ roomId });
    console.log(`Cleaned up empty room: ${roomId}`);
  }
}

export async function getRoomPeers(roomId: string): Promise<string[]> {
  const room = await getRoom(roomId);
  return room?.peers || [];
}

export async function cleanupOldRooms(): Promise<void> {
  const db = await getDatabase();
  const collection = db.collection<Room>(COLLECTION_NAME);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

  const result = await collection.deleteMany({
    updatedAt: { $lt: oneHourAgo },
    peers: { $size: 0 },
  });

  if (result.deletedCount > 0) {
    console.log(`Cleaned up ${result.deletedCount} old rooms`);
  }
}
