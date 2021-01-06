import mongoose from 'mongoose';
interface urlSchema extends mongoose.Document{
    urlSlug: string,
    originalUrl: string,
    shortUrl: string,
    clickCount: number,
};

const urlSchema = new mongoose.Schema({
    urlSlug: String,
    originalUrl: String,
    shortUrl: String,
    clickCount: Number,
});

export const URLModel = mongoose.model<urlSchema>('url', urlSchema);
