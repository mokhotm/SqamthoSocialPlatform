import 'multer'; // Ensures Multer's own type augmentations are loaded.

declare global {
  namespace Express {
    interface Request {
      // Attempt to reference Multer.File as defined within the Express namespace by @types/multer
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

export {}; // Makes this file a module.
