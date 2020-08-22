const fs = require("fs-extra");
const sharp = require("sharp");

export class resizer{
    /**
   * Constructor method
   * @param  {object} req
   * @param  {string || object} filename
   * @param  {array} sizes
   * @param  {string} uploadPath
   * @param  {Object} sharpOptions
   */

    req;
    filename;
    sizes;
    uploadPath;
    fileUrl;
    sharpOptions;
    filesUploaded;
    imageExt;
    imageFilename;
    imageUploadPath;
    data;
    tmpOriginalname;
    tmpField;


  constructor(req, filename, sizes, uploadPath, sharpOptions){
    this.req = req;
    this.filename = filename;
    this.sizes = sizes;
    this.uploadPath = uploadPath;
    this.sharpOptions = sharpOptions || {};
    this.filesUploaded = [];
    this.imageExt = null;
    this.imageFilename = null;
    this.imageUploadPath = null;
    this.data = [];
    this.tmpOriginalname = null;
  }

  /**
   * Resize files method
   */
  async resize() {
    if (this.req.files) {
      if (!this.req.files.map) {
        for (const prop in this.req.files) {
          await Promise.all(
            this.req.files[prop].map(async (file, i) => {
              await this.promiseAllResize(
                file,
                i,
                prop,
                typeof this.filename === "object"
                  ? this.filename[prop]
                  : this.filename
              );
            })
          );
        }
        return;
      }
    }

    // Promise.all() multiple files for resizing
    await Promise.all(
      this.req.files.map(async (file, i) => {
        await this.promiseAllResize(file, i);
      })
    );
  }

  /**
   * Get Data method
   * Data transform, preparation and return
   */
  getData() {
    // Check multiple files
    // Categorize files by size
    if (this.req.files) {
      if (!this.req.files.map) {
        return this.removeProp(this.getDataWithFields(), "field");
      } else {
        for (let i = 0; i < this.req.files.length - 1; i++) {
          this.data.push({
            ...this.filesUploaded.splice(0, this.sizes.length),
          });
        }
      }
    }

    this.data.push(this.filesUploaded);

    return this.data.map((file) =>
      this.renameKeys({ ...this.sizes.map((size, i) => size.path) }, file)
    );
  }

  /**
   * Change keys name method
   * @param  {object} keysMap
   * @param  {object} obj
   */
  renameKeys(keysMap, obj) {
    return Object.keys(obj).reduce((acc, key) => {
      this.tmpOriginalname = obj[key].originalname;
      this.tmpField = obj[key].field;
      delete obj[key].originalname;
      delete obj[key].field;
      return {
        ...acc,
        originalname: this.tmpOriginalname,
        field: this.tmpField,
        ...{ [keysMap[key] || key]: obj[key] },
      };
    }, {});
  }

  /**
   * Promise.all() for resize files method
   * @param  {object} file
   * @param  {number} i
   */
  promiseAllResize(file, i, prop = "", filenameParam = this.filename) {
    const name = filenameParam.split('.')[0];
    const randomName = Array(10)
    .fill(null)
    .map(() => Math.round(Math.random() * 16).toString(16))
    .join('');
    Promise.all(
      this.sizes.map((size) => {
        this.imageExt = file.mimetype.split("/")[1];
        this.imageFilename = `${randomName}-${size.path}.${this.imageExt}`;
        this.imageUploadPath = `${this.uploadPath}/${filenameParam}`;
        this.filesUploaded.push({
          originalname: file.originalname,
          ...(prop && { field: prop }),
          filename: this.imageFilename,
          path: `${this.imageUploadPath}/${this.imageFilename}`,
        });
        return sharp(file.buffer)
          .resize(size.width, size.height, this.sharpOptions)
          .toFile(`${this.imageUploadPath}/${this.imageFilename}`);
      })
    );
  }

  /**
   * Grouping data by field
   * Return Data that send with multer fields method
   */
  getDataWithFields() {
    for (const prop in this.req.files) {
      for (let i = 0; i < this.req.files[prop].length; i++) {
        this.data.push({
          ...this.filesUploaded.splice(0, this.sizes.length),
        });
      }
    }

    return this.groupByFields(
      this.data.map((file) =>
        this.renameKeys({ ...this.sizes.map((size, i) => size.path) }, file)
      ),
      "field"
    );
  }

  /**
   * Grouping data by specific property method
   * @param  {array} array
   * @param  {property} prop
   */
  groupByFields(array, prop) {
    return array.reduce(function (r, a) {
      r[a[prop]] = r[a[prop]] || [];
      r[a[prop]].push(a);
      return r;
    }, Object.create(null));
  }

  /**
   * Remove specific property method
   * @param  {object} obj
   * @param  {string} propToDelete
   */
  removeProp(obj, propToDelete) {
    for (var property in obj) {
      if (typeof obj[property] == "object") {
        delete obj.property;
        let newJsonData = this.removeProp(obj[property], propToDelete);
        obj[property] = newJsonData;
      } else {
        if (property === propToDelete) {
          delete obj[property];
        }
      }
    }
    return obj;
  }
}