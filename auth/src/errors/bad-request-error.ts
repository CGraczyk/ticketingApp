import { CustomError } from "./custom-error.js";

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);

    // Only because extending built-in Class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors(): { message: string; field?: string; }[] {
    return [{ message: ""}]
  }
}