import mongoose from 'mongoose';
import 'dotenv/config';

const connectionString = process.env.CONNECTION_STRING;
if (typeof connectionString !== 'string') {
    process.exit(1);
}

export const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(connectionString);
        console.log('MongoDB connected successfully');
    } catch (error) {
        if (error instanceof Error) {
            console.error('MongoDB connection error:', error.message);
        } else {
            console.error('MongoDB connection error:', error);
        }
        process.exit(1);
    }
};
