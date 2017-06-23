var mongoose = require('mongoose');

var userschema = new mongoose.Schema({
    name : String,
    email: String,
    phone : String,
    password : String,
    position : {
      type : String,
      default : 'Designer'
    },
    token :{
      type : String,
      default : 'weddr'
    },
    photo : {
      type : String,
      default : '/assets/images/avtar.png'
    },
    address :{
      type : String,
      default : 'United Kingdom'
    },
    fullname :{
      type : String,
      default : 'Full name'
    }
});

mongoose.model('UserDB',userschema);
