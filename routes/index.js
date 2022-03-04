var express = require('express');
var router = express.Router();

const async = require('async');
const AWS = require('aws-sdk');
const zlib = require('zlib');
const CombinedStream = require('combined-stream');

const s3 = new AWS.S3({
  'accessKeyId': '',
  'secretAccessKey': ''
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('indx', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Express' });
});

router.post('/download',function (req,res,next){
  //다운로드 새로운 방식에 대한 연구

  const combinedStream = CombinedStream.create();

  for(let i =0;i < 514; i++){
    let params = {
      Bucket: "big-data-upload-for-raccoon",
      Key: `5g-file.mov/${i}`
    }
  }

})

function getStream(params,callback){
  s3.getObject(params,function (err,newData){
    zlib.gunzip(newData.Body,function (err,buffer){
      callback(null,fs.createReadStream(buffer));
    })
  })
}

module.exports = router;
