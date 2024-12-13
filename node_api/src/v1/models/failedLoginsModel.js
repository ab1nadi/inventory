const mongoose = require('mongoose');


const FailedLoginSchema = new mongoose.Schema({
    userEmail: String,
  }, { timestamps: true });


  const FailedLoginsModel = mongoose.model('FailedLogins', FailedLoginSchema);

  FailedLoginsModel.init()
module.exports = FailedLoginsModel;


