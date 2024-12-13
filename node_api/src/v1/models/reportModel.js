const mongoose = require('mongoose');


const ReportSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,  // Ensure the item type name is always provided
      trim: true,
      index: { unique: true } // Ensure unique index on name
    },  // cost of the item
    
    description: String,

    custom_logs: [String],

    // attributes at the very least need to have the attributes in type
    code: String,
    
  }, { timestamps: true });


  const ReportModel = mongoose.model('Report', ReportSchema);

  ReportModel.init()
module.exports = ReportModel;