const multer =require('multer'); // form-data multipart



const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).fields([{name:'filePhotograph',maxCount:1},{name:'fileSign',maxCount:1},{name:'fileTransactionID',maxCount:1}]);


const path=require('path')


module.exports=multerUploads;



