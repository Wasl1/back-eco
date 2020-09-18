import { extname } from 'path';
import * as sharp from 'sharp';
import { readFile } from 'fs';
import { promisify } from 'util';
const readFileAsyc = promisify(readFile);

let sizes = [{
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
}
];

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return callback(new Error('Only image files are allowed!'), false);
  }
  callback(null, true);
};

export const editFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const fileExtName = extname(file.originalname);
  const randomName = Array(10)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
  callback(null, `${randomName}${fileExtName}`);
};

export async function resizeImagesProduits (ext: string, files): Promise<void> {
  if (['jpeg', 'jpg', 'png','gif'].includes(ext)) {
      const [filename, ] = files.filename.split('.');
      sizes.map((size:any) => {
      // const [size] = s.split('X');
      readFileAsyc(files.path)
        .then((b: Buffer) => {
          return sharp(b)
            .resize(size.width, size.height)
            .toFile(
              `uploads/produits/${filename}-${size.path}.${ext}`,
            );
        })
        .catch(console.error);
    });
  }
}

export async function resizeImagesAvatar (ext: string, files): Promise<void> {
  if (['jpeg', 'jpg', 'png','gif'].includes(ext)) {
      const [filename, ] = files.filename.split('.');
      sizes.map((size:any) => {
      // const [size] = s.split('X');
      readFileAsyc(files.path)
        .then((b: Buffer) => {
          return sharp(b)
            .resize(size.width, size.height)
            .toFile(
              `uploads/avatars/${filename}-${size.path}.${ext}`,
            );
        })
        .catch(console.error);
    });
  }
}