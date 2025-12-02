import type { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/custom-error.js";


export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(400).send({ errors: err.serializeErrors() });
  }
  res.status(400).send({
    errors: [{ message: "Something Went Wrong!!" }]
  });
};