import multer from "multer";

// Use memoryStorage instead of diskStorage
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Optional: Limit size to 5MB
  },
});

export default upload;
