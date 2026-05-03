import "express-async-errors";

import { currentUser, errorHandler, NotFoundError } from "@ccgtickets/common";
import json from "body-parser";
import cookieSession from "cookie-session";
import express from "express";

import { indexOrderRouter } from "./routes/index";
import { deleteOrderRouter } from "./routes/delete";
import { newOrderRouter } from "./routes/new";
import { showOrderRouter } from "./routes/show";

const app = express();

app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test", // See src/routes/__test__/signup.test.ts
  }),
);

app.use(currentUser); // set after CookieSession so req.session is set properly
// first.

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
