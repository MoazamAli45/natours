class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : error;
    // console.log(this.status);

    // Operational error if we are making error in our code
    this.isOperational = true;
    // inorder to not include when line about in this class that pollute teh statement a lot to find it error come
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
