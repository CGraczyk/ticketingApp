import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  serialzeErrors(): { message: string; field?: string; }[] {
    throw new Error("Method not implemented.");
  }
  statusCode = 500;
  reason = "Error Connecting to Database."
  constructor() {
    super("Error Connecting to Database.");

    // Only because extending built-in Class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  serializeErrors() {
    return [
      { message: this.reason}
    ];
  }
}