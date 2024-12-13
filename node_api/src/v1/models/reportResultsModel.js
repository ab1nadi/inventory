const mongoose = require('mongoose');


const ReportResultsSchema = new mongoose.Schema({

    reportName: {type:String, required: true},

    headers: {type:[String]},

    rows: { type: [[String]] }, // Array of arrays of numbers
    
    status: {type: String}, // "running", "failed", "complete"

    errorMessage: String,// an error message if the report failed

    userEmail: String
  }, { timestamps: true });


  const ReportResultsModel = mongoose.model('ReportResults', ReportResultsSchema);

ReportResultsModel.init()
module.exports = ReportResultsModel;


