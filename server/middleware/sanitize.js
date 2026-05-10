import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";

// Two layers of input sanitisation applied globally before any route handler.
//
// 1. mongoSanitize — strips keys containing `$` or `.` from req.body/query/params
//    which prevents NoSQL injection attacks like:
//    { "cvText": { "$gt": "" } } → stripped to {}
//
// 2. hpp — HTTP Parameter Pollution protection.
//    Prevents ?sort=asc&sort=desc&sort=DROP being passed as an array
//    when your code expects a string.

export const sanitizeMongo = mongoSanitize({
  allowDots: false,
  replaceWith: "_",
  onSanitizeError: (req, _res, error) => {
    console.warn("[sanitize] Mongo injection attempt blocked:", error.message);
  },
});

export const sanitizeHpp = hpp();
