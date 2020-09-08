// import { Injectable, NestMiddleware } from "@nestjs/common";
// import { uploadProductImages, resizerImages} from "src/ImageConverter/ImageStorage";
// @Injectable()
// export class ImageMiddleware implements NestMiddleware {
//     async use(req, res, next){
        
//         await new Promise((resolve, reject) => {
//             uploadProductImages(req, res, err => err ? reject(err) : resolve());
//         });

//         await new Promise((resolve, reject) => {
//             resizerImages(req, res, err => err ? reject(err) : resolve());
//         });
//         return next();
//     }

// }