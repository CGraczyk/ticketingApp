import express from "express";
import jwt from "jsonwebtoken";

import type {Request, Response } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { BadRequestError } from "../errors/bad-request-error";
import { User } from "../models/user";
import { Password } from "../services/password";

const router = express.Router();

router.post("/api/users/signin", [
    body('email')
      .isEmail()
      .withMessage("Email must be valid"),
    body("password")
      .trim()
      .notEmpty()
      .withMessage("You must supply a password")
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      throw new BadRequestError("failed");
    }

    const passwordsMatch = await Password.compare(existingUser.password, password);
    if (!passwordsMatch) {
      throw new BadRequestError("Invalid Credentials");
    }

        // Generate JWT
        const userJwt = jwt.sign({
            id: existingUser._id,
            email: existingUser.email
          }, 
          process.env.JWT_KEY!
        );
    
        // Store it on session object
        req.session = {
          jwt: userJwt,
        };
    
        console.log("User logged in...");
        res.status(200).send(existingUser);
  });

export { router as signinRouter };