const multer =require('multer'); // form-data multipart



const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).fields([{name:'filePhotograph',maxCount:1},{name:'imgSign',maxCount:1},{name:'parentSign',maxCount:1},{name:'fileTransactionID',maxCount:1},
{name:'file12th',maxCount:1},{name:'file10th',maxCount:1},{name:'fileKeam',maxCount:1},{name:'filePreview',maxCount:1}]);


const path=require('path')


module.exports=multerUploads;



