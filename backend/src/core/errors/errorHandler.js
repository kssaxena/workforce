import ApiError from "./ApiError.js";

const errorHandler = (err, req, res, next) => {
  let error = err;

  const statusCode = error?.statusCode || error?.status || 500;

  console.error("\n");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("❌ BACKEND ERROR");
  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("METHOD :", req.method);
  console.error("URL    :", req.originalUrl);
  console.error("STATUS :", statusCode);
  console.error("MESSAGE:", error?.message);

  if (error?.errors?.length) {
    console.error("ERRORS :", error.errors);
  }

  if (process.env.NODE_ENV === "development") {
    console.error("STACK  :");
    console.error(error?.stack);
  }

  console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.error("\n");

  if (!(error instanceof ApiError)) {
    error = new ApiError(
      statusCode,
      error?.message || "Internal Server Error",
      error?.errors || [],
      error?.stack,
    );
  }

  const response = {
    success: false,
    message: error.message,
    errors: error.errors,
  };

  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  return res.status(error.statusCode).json(response);
};

export default errorHandler;
