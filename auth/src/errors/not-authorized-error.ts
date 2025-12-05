import { CustomError } from "./custom-error.js";

export class NotAuthorizedError extends CustomError {
  statusCode= 401;
  
  constructor() {
    super("Not authorized");

    // Only because extending built-in Class
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  };

  serializeErrors() {
    return [{message: "Not authorized"}];
  }
}