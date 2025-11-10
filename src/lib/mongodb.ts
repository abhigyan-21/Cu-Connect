import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://user_4447zrz99:p4447zrz99@bytexldb.com:5050/db_4447zrz99';
const DB_NAME = 'db_4447zrz99';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  console.log('Connected to MongoDB');

  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
