import mongoose from "mongoose";
import "dotenv/config";

const connectionString = process.env.CONNECTION_STRING;
if (typeof connectionString !== "string") {
  process.exit(1);
}

export const connectDB = async () => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected");
  } catch (error) {
    console.error(error.message);
  }
};
