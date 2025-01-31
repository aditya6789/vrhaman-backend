import multer, { Multer, FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import mime from "mime-types";

// Configure storage
const storage = multer.diskStorage({
  destination: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) {
    cb(null, "public/uploads/"); // Specify the destination directory for file uploads
  },
  filename: function (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) {
    const ext = mime.extension(file.mimetype);
    cb(null, file.fieldname + "-" + Date.now() + "." + ext);
  },
});

// File filter for validating file types
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// Initialize multer with the storage and file filter
const upload: Multer = multer({
  storage: storage,
  fileFilter: fileFilter,
});

export default upload;
