const fs = require('fs');

module.exports = {
  deletePropFromObj: (obj, array) => {
    for (let i = 0; i < array.length; i++) {
      delete obj[array[i]];
    }
  },
  checkFileExists: (file) =>
    fs.promises
      .access(file, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false),
};
