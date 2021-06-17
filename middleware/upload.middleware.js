const mkdirp = require('mkdirp');
const multer = require('multer');
const md5 = require('md5');
const logger = require('../utils/logger');

const storage = multer.diskStorage({
  async destination(req, file, cb) {
    const hesh = md5(file.originalname);
    const dir = `${__dirname}\\..\\uploads\\${hesh.substr(0, 2)}\\${hesh.substr(
      2,
      2
    )}\\`;
    mkdirp(dir).then(() => cb(null, dir));
  },
  filename(req, file, cb) {
    const ext = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length
    );
    const hesh = md5(file.originalname);
    cb(null, hesh + ext);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};
const limits = {
  fieldNameSize: 100,
  fileSize: 10 * 1024 * 1024,
  // fieldNameSize	Максимальный размер имени файла	100 bytes
  // fieldSize	Максимальный размер значения поля	1MB
  // fields	Максимальное количество не-файловых полей	Не ограничено
  // fileSize	Максимальный размер файла в байтах для multipart-форм	Не ограничен
  // files	Максимальное количество полей с файлами для multipart-форм	Не ограничено
  // parts	Максимальное количество полей с файлами для multipart-форм (поля плюс файлы)	Не ограничено
  // headerPairs	Максимальное количество пар ключ-значение key=>value для multipart-форм, которое обрабатывается
};
const upload = multer({ storage, fileFilter, limits }).array('files', 10);
module.exports = async (req, res, next) => {
  upload(req, res, (error) => {
    if (error) {
      logger.error(`Error in upload.middleware: ${error}`);
      res.status(500).send({ error });
    } else {
      next();
    }
  });
};
