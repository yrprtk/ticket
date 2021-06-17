const mkdirp = require('mkdirp');
const multer  = require("multer");
const md5 = require('md5');
const logger = require('../utils/logger');

const storage = multer.diskStorage({
    destination: async function (req, file, cb) {
        let hesh = md5(file.originalname);
        let dir = `${__dirname}\\..\\uploads\\${hesh.substr(0, 2)}\\${hesh.substr(2, 2)}\\`;
        mkdirp(dir).then(made => cb(null, dir))
    },
    filename: function (req, file, cb) {
        let ext = file.originalname.substring(file.originalname.lastIndexOf('.'), file.originalname.length);
        let hesh = md5(file.originalname);
        cb(null, hesh+ext);
    }
  })
const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/png"|| file.mimetype === "image/jpg"|| file.mimetype === "image/jpeg"){ 
        cb(null, true);
    }else{ 
        cb(new Error('Unsupported file type'))
    }
}
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
}
const upload = multer({storage, fileFilter, limits}).array('files', 10)
module.exports = async (req, res, next) => {
    upload(req, res, function (error) {
        if (error) {
            logger.error(`Error in upload.middleware: ${error}`);
            res.status(500).send({error});
        } else {
            next();
        }
    })
};