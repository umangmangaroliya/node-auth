class ApiError extends Error {
  constructor(code, message = "Something went wrong", error = undefined) {
    super(message);
    this.code = code;
    this.message = message;
    this.success = false;
    this.error = error;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
