var express = require('express');
var router = express.Router();

const async = require('async');
const AWS = require('aws-sdk');
const zlib = require('zlib');
const fs = require('fs');
const CombinedStream = require('combined-stream');

const s3 = new AWS.S3({
  'accessKeyId': '',
  'secretAccessKey': ''
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/test', function(req, res, next) {
  res.render('test', { title: 'Express' });
});

router.post('/download',function (req,res,next){
  //다운로드 새로운 방식에 대한 연구

  const combinedStream = CombinedStream.create({pauseStreams: false});
  let func = [];

  for(let i = 0;i < 514; i++){
    func.push((json,callback) => {getStream(json,callback)})
  }

  const file_count = 0;

  async.waterfall([(callback) => {
      callback(null, { file_count: file_count, combinedStream: combinedStream });
  },...func],function (err,result){
    console.log('waterfall: ',result);
    result.pipe(res);
  })

})

function getStream(json,callback){
  let { file_count, combinedStream } = json;
  let params = {
    Bucket: "big-data-upload-for-raccoon",
    Key: `5g-file.mov/${file_count}`
  }
  file_count += 1;
  combinedStream.append(s3.getObject(params).createReadStream());
  callback(null,{ file_count: file_count, combinedStream: combinedStream });
  // s3.getObject(params,function (err,newData){
  //   zlib.gunzip(newData.Body,function (err,buffer){
  //     file_count += 1;
  //     console.log(buffer);
  //     combinedStream.append(fs.createReadStream(new Uint8Array(buffer)));
  //     callback(null,{ file_count: file_count, combinedStream: combinedStream });
  //     // callback(null,fs.createReadStream(buffer));
  //   })
  // })
}

module.exports = router;
