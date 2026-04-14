import "express-async-errors";

import { currentUser, errorHandler, NotFoundError } from "@ccgtickets/common";
import json from "body-parser";
import cookieSession from "cookie-session";
import express from "express";

import { createTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { indexTicketRouter } from "./routes/index";
import { updateTicketRouter } from "./routes/update";

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
app.use(createTicketRouter);
app.use(indexTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);

app.all("*", async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
