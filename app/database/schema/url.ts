import { Schema, model, Document } from 'mongoose';

// Define interface for URL document
export interface IUrl extends Document {
    urlSlug: string;
    originalUrl: string;
    shortUrl: string;
    clickCount: number;
}

// Define schema with proper typing for Mongoose 8
const urlSchema = new Schema<IUrl>({
    urlSlug: {
        type: String,
        required: true,
        unique: true,
    },
    originalUrl: {
        type: String,
        required: true,
    },
    shortUrl: {
        type: String,
        required: true,
    },
    clickCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Export model with proper typing
export const URLModel = model<IUrl>('url', urlSchema);
