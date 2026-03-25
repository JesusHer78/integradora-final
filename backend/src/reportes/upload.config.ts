import { diskStorage } from "multer";
import { extname } from "path";
import path from "path";

export const multerConfig = {
  storage: diskStorage({
    destination: (_, __, cb) => {
      cb(null, path.join(process.cwd(), "uploads"));
    },
    filename: (_, file, cb) => {
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname).toLowerCase();
      cb(null, `${timestamp}-${random}${ext}`);
    },
  }),
};