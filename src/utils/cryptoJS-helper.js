import CryptoJS from "crypto-js"

const KEY = "4h!@w$rng,i#$@x1%)5^3(7*5P31/Ee0";//32位
const IV = "xz.node.admin_hh"; //32位

//AES 加密
export function encrypt(encryptString) {
  var key = CryptoJS.enc.Utf8.parse(KEY);
  var iv = CryptoJS.enc.Utf8.parse(IV);
  var encrypted = '';
  var srcs = CryptoJS.enc.Utf8.parse(encryptString);
  encrypted = CryptoJS.AES.encrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  return encrypted.ciphertext.toString();
}

// AES 解密
export function decrypt(encryptString) {
  var key = CryptoJS.enc.Utf8.parse(KEY);
  var iv = CryptoJS.enc.Utf8.parse(IV);
  var encryptedHexStr = CryptoJS.enc.Hex.parse(encryptString);
  var srcs = CryptoJS.enc.Base64.stringify(encryptedHexStr);
  var decrypt = CryptoJS.AES.decrypt(srcs, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}
