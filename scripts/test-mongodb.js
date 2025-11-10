// Test MongoDB connection
const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://user_4447zrz99:p4447zrz99@bytexldb.com:5050/db_4447zrz99';

async function testConnection() {
  console.log('Testing MongoDB connection...\n');
  
  try {
    const client = await MongoClient.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ Successfully connected to MongoDB!');
    
    const db = client.db('db_4447zrz99');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📁 Collections:', collections.map(c => c.name).join(', ') || 'None yet');
    
    // Test insert
    const testRoom = {
      roomId: 'test-' + Date.now(),
      peers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await db.collection('rooms').insertOne(testRoom);
    console.log('\n✅ Test room created:', testRoom.roomId);
    
    // Test query
    const found = await db.collection('rooms').findOne({ roomId: testRoom.roomId });
    console.log('✅ Test room retrieved:', found ? 'Success' : 'Failed');
    
    // Cleanup
    await db.collection('rooms').deleteOne({ roomId: testRoom.roomId });
    console.log('✅ Test room deleted');
    
    await client.close();
    console.log('\n✅ Connection closed successfully');
    console.log('\n🎉 MongoDB is ready to use!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Check if MongoDB server is running');
    console.error('2. Verify credentials are correct');
    console.error('3. Check network/firewall settings');
    process.exit(1);
  }
}

testConnection();
