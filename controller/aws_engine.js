

var mongoose = require('mongoose');
var multer = require('multer');
var path = require('path');
var mime = require('mime');
// var request = require('request');
var download = require('download-file')
var fs = require('fs');
var http = require('http');
var https = require('https');
var UserDB = mongoose.model('UserDB');
var AWS =  require('aws-sdk');
AWS.config.loadFromPath('./aws_config.json');
/////////////General Configration
var bucketName = 'iosweddrtest';
var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: bucketName}
});
////////////User management api//////////////
var elastictranscoder = new AWS.ElasticTranscoder({apiVersion: '2012-09-25'});
exports.elastictranscoder = function(req, res)
{
  var videoname = req.body.videoname;
  var shootcode = req.body.shootcode;
  var username = req.body.username;
  var params = {
    PipelineId: '1488268599904-bdbk0a',
    Inputs: [
      {
        AspectRatio: 'auto',
        Container: 'auto',
        FrameRate: 'auto',
        Interlaced: 'auto',
        Key: shootcode +'/'+ username +'/Input/'+videoname+'.mp4',
        Resolution: 'auto',
      }
    ],
    OutputKeyPrefix: shootcode+'/Output/',
    Outputs: [
      {
        Key: 'Video/'+videoname+'.mp4',
        PresetId: '1488061623936-v9huad',
        Rotate: 'auto',
        ThumbnailPattern: 'Thumb/'+videoname+'-{count}',
      }
    ],
    UserMetadata: {
      'contentType': 'video/mp4'
    }
  };
  elastictranscoder.createJob(params, function(err, data) {
    if (err){
       console.log(err, err.stack);
       res.json({'status' : 'error'});
    } else
    {
      console.log(data);
      res.json({'status':'success'});
    }                // successful response
  });
}

exports.index = function(req,res)
{
  console.log('Start');
  res.render('index');
}
exports.register = function(req,res)
{
  console.log('register');
  res.render('register');
}
exports.forget_password = function(req,res)
{
  console.log('forget_password');
  res.render('forget_password');
}
exports.resetpassword = function(req,res){

}
exports.postresetpassword = function(req,res){

}
exports.post_register = function(req,res){
    var name = req.body.name;
    var email = req.body.email;
    var phone = req.body.phone;
    var password = req.body.password;
    var userModel = new UserDB({
        name : name,
        email:email,
        phone:phone,
        password:password
    });
    UserDB.findOne({email : email},function(error,doc){
       if (error) {
          res.status(400).json({status:'error'});
       }else if(doc){
         res.status(200).json({status : 'exist'});
       }else{
         UserDB.create(userModel,function(error){
            if (error){
              res.status(400).json({status:'error'});
            }else{
              res.status(201).json({status:'success'});
            }
         });
       }
    });
}
exports.post_registerwithphoto = function(req,res){
  console.log('Post user starting');
  var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./public/uploadImages/userphotos");
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
      }
  });
  var upload = multer({ storage: Storage }).single("userphoto");
  upload(req, res, function (err) {
    if (err) {
        console.log('Post user fileupload error');
        res.status(400).json({status:'error'});
    }else{
        console.log('Post user fileupload success');
        var photo = '/uploadImages/userphotos/' + req.file.originalname;
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var password = req.body.password;
        var userModel = new UserDB({
            name : name,
            email:email,
            phone:phone,
            password:password,
            photo : photo
        });
        UserDB.findOne({email : email},function(error,doc){
           if (error) {
              console.log('Post user create error');
              res.status(400).json({status:'error'});
           }else if(doc){
             console.log('Post user create exist');
             res.status(200).json({status : 'exist'});
           }else{
             UserDB.create(userModel,function(error){
                if (error){
                  console.log('Post user created error');
                  res.status(400).json({status:'error'});
                }else{
                  console.log('Post user created success');
                  res.status(201).json({status:'success'});
                }
             });
           }
        });
      }
    });

}

exports.checkuser = function(req,res){
    var email = req.body.email;
    var password = req.body.password;
    UserDB.findOne({email:email},function(err,doc){
       if (err)
       {
            res.status(400).json({status : 'error'});
       }else if(doc == null){
            res.status(404).json({status : 'not exist'});
       }else if(doc.password === password){
            req.session.user = doc;
            res.status(200).json({status : 'success'});
       }else{
            res.status(200).json({status : 'wrong password'});
       }
    });
}

exports.getanuser = function(req,res){
    console.log('Get an user started');
    console.log(req.session.user);
    var id = req.session.user._id;
    UserDB.findOne({_id:id},function(err,doc){
       if (err)
       {
            console.log('Get an user error');
            res.status(400).json({status : 'error'});
       }else if(doc == null){
            console.log('Get an user not exist');
            res.status(404).json({status : 'not exist'});
       }else{
            console.log('Get an user not success');
            res.status(200).json({status : 'success',data : doc});
       }
    });
}
exports.updateuserwithfile = function(req,res){
    var Storage = multer.diskStorage({
        destination: function (req, file, callback) {
            callback(null, "./public/uploadImages/userphotos");
        },
        filename: function (req, file, callback) {
            callback(null, file.originalname);
        }
    });
    var upload = multer({ storage: Storage }).single("userphoto");
    upload(req, res, function (err) {
          if (err) {
              res.json(status,"error");
          }else{
            var id = req.body.userid;
            var photo = '/uploadImages/userphotos/' + req.file.originalname;
            var name = req.body.name;
            var email = req.body.email;
            var phone = req.body.phone;
            var fullname = req.body.fullname;
            var address = req.body.address;
            var position = req.body.position;
            UserDB.update({'_id':id},{$set :{
              name : name,
              email:email,
              phone:phone,
              photo : photo,
              fullname : fullname,
              address : address,
              position : position
            }},function(err,doc,status){
                if(err){
                    res.json({'status':'error'});
                }else{
                  console.log(doc);
                  res.json({'status':'success'});
                }
            });
          }
    });
}
exports.updateuser = function(req,res){
      var id = req.body.userid;
      var photo = req.body.photo;
      var name = req.body.name;
      var email = req.body.email;
      var phone = req.body.phone;
      var fullname = req.body.fullname;
      var address = req.body.address;
      var position = req.body.position;
      UserDB.update({'_id':id},{$set :{
            name : name,
            email:email,
            phone:phone,
            photo : photo,
            fullname : fullname,
            address : address,
            position : position
      }},function(err,doc,status){
            if(err){
                res.json({'status':'error'});
            }else{
                res.json({'status':'success'});
            }

      });
}

exports.getshootcodelist = function(req,res)
{
  var shootcode = req.body.shootcode;
  console.log('post shootcode '+ shootcode);
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      console.log(err);
      res.status(404).json({'status' : 'failed'});
    } else {
      res.status(200).json({'status' : 'success','data':data.CommonPrefixes});
    }
  });
}

exports.getlistObjectsWithShootcode = function(req,res)
{
  var shootcode = req.body.shootcode;
  console.log('post shootcode '+ shootcode);
  var prefix = shootcode+'/Output/Video/';
  console.log('Prefix ' + prefix);
  s3.listObjects({Prefix:prefix,Delimiter: '/'}, function(err, data) {
    if (err) {
      console.log(err);
      res.status(404).json({'status' : 'failed'});
    } else {
      console.log(data.Contents);
      res.status(200).json({'status' : 'success','data':data.Contents});
    }
  });
}

exports.uploadvideo = function(req,res)
{
  var file = req.files.file;

  fs.readFile(file.path, function (err, data) {
      if (err) throw err; // Something went wrong!
      var shootcode = req.body.shootcode;
      var params = {
          Key: shootcode + '/Output/Video/' + file.originalFilename,
          Body: data
      };
      s3bucket.upload(params, function (err, data) {
          fs.unlink(file.path, function (err) {
              if (err) {
                  console.error(err);
                  res.status(500).json({status:'can not read file'});
              }
              console.log('Temp File Delete');
          });
          console.log("PRINT FILE:", file);
          if (err) {
              console.log('ERROR MSG: ', err);
              res.status(500).json({status:'error'});
          } else {
              console.log('Successfully uploaded data');
              res.status(200).json({status : 'success'});
          }
      });

  });
}

exports.downloadfile = function(req,res){
  //  var url = req.body.url;
   var url = "http://i.imgur.com/G9bDaPH.jpg"

  var options = {
      directory: "./image",
      filename: "cat.gif"
  }
  download(url, options, function(err){
      if (err) throw err
      res.status(200).json({
        status : 'success'
      });
  })
  //  var destArr = url.split('/');
  //  var dest = destArr[destArr.length - 1];
  //  var file = fs.createWriteStream(dest);
  //  var request = https.get(url,function(response){
  //     response.pipe(file);
  //     file.on('finish',function(){
  //       res.status(200).json({
  //         status : 'success'
  //       });
  //     });
  //  }).on('error',function(err){
  //     fs.unlink(dest);
  //     res.status(400).json({
  //       status : 'error'
  //     });
  //  });


}
