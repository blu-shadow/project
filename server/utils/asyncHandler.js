// ===================================
// utils/asyncHandler.js - Error Handling Utility
// ===================================

// Higher-order function that handles asynchronous function execution
// and catches any errors, passing them to Express's error handler.
const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
