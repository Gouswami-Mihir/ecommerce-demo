var CryptoJS = require('crypto-js');
var jwt = require('jsonwebtoken');
var responseManager = require('../utilities/responseManager');
exports.PasswordEncryptor = async (password) => {
  try {
    let Layer1 = CryptoJS.AES.encrypt(password, process.env.PASSWORD_ENCRYPITION_SECRET).toString();
    let Layer2 = CryptoJS.DES.encrypt(Layer1, process.env.PASSWORD_ENCRYPITION_SECRET).toString();
    let Layer3 = CryptoJS.TripleDES.encrypt(Layer2, process.env.PASSWORD_ENCRYPITION_SECRET).toString();
    return Layer3;
  } catch (error) {
    throw error;
  }
}
exports.PasswordDecryptor = async (password) => {
    try {
        let Layer1 = CryptoJS.TripleDES.decrypt(password, process.env.PASSWORD_ENCRYPITION_SECRET);
        let text1 = Layer1.toString(CryptoJS.enc.Utf8);
        let Layer2 = CryptoJS.DES.decrypt(text1, process.env.PASSWORD_ENCRYPITION_SECRET);
        let text2 = Layer2.toString(CryptoJS.enc.Utf8);
        let Layer3 = CryptoJS.AES.decrypt(text2, process.env.PASSWORD_ENCRYPITION_SECRET);
        let text3 = Layer3.toString(CryptoJS.enc.Utf8);
        return text3;
    } catch (error) {
        throw error;
    }
}

exports.authenticateToken = async (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
      const bearer = bearerHeader.split(' ');
      const token = bearer[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, auth) => {
          if (err) {
              return responseManager.unauthorisedRequest(res);
          } else {
              req.token = auth;
          }
      });
      next();
  } else {
      return responseManager.unauthorisedRequest(res);
  }
};
