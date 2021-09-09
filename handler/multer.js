const multer =require('multer'); // form-data multipart



const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).fields([{name:'imgPhotograph',maxCount:1},{name:'imgSign',maxCount:1}]);
// const multerUploads = multer({ storage }).single('imgPhotograph');

const path=require('path')


module.exports=multerUploads;



