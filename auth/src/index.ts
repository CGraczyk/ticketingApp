import express from "express";
import "express-async-errors";
import json from "body-parser";
import mongoose from "mongoose";


import { currentUserRouter } from "./routes/current-user.js";
import { signinRouter } from "./routes/signin.js";
import { signoutRouter } from "./routes/signout.js";
import { signupRouter } from "./routes/signup.js";
import { errorHandler } from "./middlewares/error-handler.js"
import { NotFoundError } from "./errors/not-found-error.js";

const app = express();
app.use(json());

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth");
    console.log("Connected to MongoDb")
  } catch (err) {
    console.error(err);
  }
}

app.listen(3000, () => {
  console.log("Listening on port 3000!!!!");
});

start();