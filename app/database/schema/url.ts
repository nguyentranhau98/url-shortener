import mongoose from 'mongoose';

const urlSchema = new mongoose.Schema({
    urlSlug: String,
    originalUrl: String,
    shortUrl: String,
    clickCount: Number,
});

export const URLModel = mongoose.model('url', urlSchema);
