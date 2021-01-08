import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

export const connect = async () => {
    const uri = await mongod.getUri();
    const mongooseOpts = {
        useNewUrlParser: true,
        poolSize: 10,
        bufferMaxEntries: 0,
        useUnifiedTopology: true,
    };
    return await mongoose.connect(uri, mongooseOpts);
};

export const closeDatabase = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

export const clearDatabase = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        if (Object.prototype.hasOwnProperty.call(collections, key)) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    }
};
