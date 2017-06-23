var aws_controller = require('../controller/aws_engine.js');
module.exports = function(app) {
  app.get('/index',aws_controller.index);
  app.get('/register',aws_controller.register);
  app.get('/forget_password',aws_controller.forget_password);
  app.get('/resetpassword/:token',aws_controller.resetpassword);
  app.post('/postresetpassword',aws_controller.postresetpassword);

  app.post('/registerwithphoto',aws_controller.post_registerwithphoto);
  app.post('/register',aws_controller.post_register);
  app.post('/login',aws_controller.checkuser);
  app.get('/getanuser',aws_controller.getanuser);
  app.post('/updateuser',aws_controller.updateuser);
  app.post('/updateuserwithfile',aws_controller.updateuserwithfile);

  app.get('/getshootcodelist',aws_controller.getshootcodelist);
  app.post('/getlistObjectsWithShootcode',aws_controller.getlistObjectsWithShootcode);
  app.post('/uploadvideo',aws_controller.uploadvideo);
  app.post('/downloadfile',aws_controller.downloadfile);

};
