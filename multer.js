import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        cb(null, `${file.originalname}`);
    },
});

function fileFilter(req, file, cb) {
    try {
        if (file.fieldname === "image") {
            const ext = path.extname(file.originalname).toLowerCase();
            if (![".jpg", ".jpeg", ".png"].includes(ext)) {
                cb(null, false);
            }
        }

        if (file.fieldname === "audio") {
            if (file.mimetype !== "audio/mpeg") {
                return cb(null, false);
            }
        }
        return cb(null, true);
    } catch (error) {
        return cb(error, false);
    }
}

export const upload = multer({ storage: storage, fileFilter: fileFilter });
