const multer = require("multer");
import { resizer } from "src/ImageConverter/resizer";

const multerStorage = multer.memoryStorage();

// Filter files with multer
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
    
  } else {
    cb("Format non supporté", false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

// *****  Multer .fields() *****
export const uploadProductImages = upload.fields([
  { name: "avatar", maxCount: 1 },
  { name: "images", maxCount: 3 },
]);

export const resizerImages = async (req, res, next) => {

  const filename = {
    avatar: `avatar`,
    images: `produits`,
  };

  const sizes = [
    {
      path: "original",
      width: null,
      height: null,
    },
    {
      path: "hd",
      width: 720,
      height: 480,
    },
    {
      path: "large",
      width: 360,
      height: 480,
    },
    {
      path: "miniature",
      width: 180,
      height: 240,
    },
  ];
  
  const uploadPath = `uploads`;

  // sharp options
  const sharpOptions = {
    fit: "inside"
  };

  // create a new instance of MulterSharpResizer and pass params
  const resizeObj = new resizer(
    req,
    filename,
    sizes,
    uploadPath,
    sharpOptions
  );

  // call resize method for resizing files
  await resizeObj.resize();
  const getDataUploaded = resizeObj.getData();

  // Get details of uploaded files: Used by multer fields
  req.body.images = getDataUploaded.images;
  req.body.avatar = getDataUploaded.avatar;

  next();
};