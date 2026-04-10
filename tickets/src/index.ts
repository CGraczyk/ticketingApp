import { app } from "./app";
import mongoose from "mongoose";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY is undefined!");
  }
  
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is undefined!");
  }
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDb")
  } catch (err) {
    console.error(err);
  }
}

app.listen(3000, () => {
  console.log("Listening on port 3000!!!!");
});

start();