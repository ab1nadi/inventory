const { body, query, validationResult, param } = require('express-validator');

const ReportModel =  require('../models/reportModel');


const ReportResultsModel = require('../models/reportResultsModel')


const { Worker } = require('worker_threads');


// Handle validation results in the controller
exports.checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); // If no errors, move to the next middleware
  };



//////////////////////////////////////////////
// createReport
// Creates a single report
exports.validateCreateReport = [
    body('name').isString().trim().withMessage('name is required'),

    body('description').isString().withMessage('description is required'),

    body('code').notEmpty().isString().withMessage('code is required, and must be in javascript')
];

exports.createReport = async (req, res) => {
  let { name, description, code} = req.body;

  try 
  {
      const newReport = new ReportModel({
        name: name,
        description: description,
        code: code
    })


    let result = await newReport.save()


    res.status(200).json({status: 'Success', _id: result._id})

  }
  catch(e)
  {
    if(e.code == 11000)
      return res.status(400).json({error: `Report with name "${name}" already exists`})

    res.status(500).json({error: `Internal server error: ${e}`})
  }
}



//////////////////////////////////////////////
// updateReport
// Updates a single report
exports.validateUpdateReport = [
  param('name').isString().trim().withMessage('name is required'),

  body('description').isString().withMessage('description is required'),

  body('code').notEmpty().isString().withMessage('code is required, and must be in javascript')
];

exports.updateReport = async (req, res) => {
  let {name} = req.params;
  let {description, code} = req.body;

  try 
  {
    let result = await ReportModel.updateOne({name:name}, 
      { description:description,
        code: code
      })


    res.status(200).json({status: 'Success', result: result})

  }
  catch(e)
  {
    res.status(500).json({error: `Internal server error: ${e}`})
  }
}




//////////////////////////////////////////////
// deleteReport
// Deletes a single report
exports.validateDeleteReport = [
  param('name').isString().trim().withMessage('name is required')
];

exports.deleteReport = async (req, res) => {
  let {name} = req.params;
  console.log(name)
  try 
  {
    let result = await ReportModel.deleteOne({name:name})


    res.status(200).json({status: 'Success', result: result})

  }
  catch(e)
  {
    res.status(500).json({error: `Internal server error: ${e}`})
  }
}


//////////////////////////////////////////////
// getReport
// Gets a single report
exports.validateGetReport = [
  param('name').isString().trim().withMessage('name is required')
];

exports.getReport = async (req, res) => {
  let {name} = req.params;
  try 
  {
    let result = await ReportModel.findOne({name:name})

    res.status(200).json(result)

  }
  catch(e)
  {
    res.status(500).json({error: `Internal server error: ${e}`})
  }
}

//////////////////////////////////////////////
// getReports
// Grabs a paginated list of reports, with also the option to filter and sort.
exports.validateGetReports= [
  // Validate 'name' as a non-empty string
  query('page').notEmpty().isString().trim().withMessage('page query parameter is required. It starts at 1.'),
  query('limit').notEmpty().isString().trim().withMessage('limit query parameter is required'),
  query('filter')
  .optional()
  .custom((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (err) {
      console.error('Invalid JSON in filter:', err); // Log the error for debugging
      return false; // Return false to trigger validation failure
    }
  })
  .withMessage('Filter must be a valid JSON object with the parameters you wish to filter on.'),
query('orderBy')
  .optional()
  .custom((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (err) {
      console.error('Invalid JSON in orderBy:', err); // Log the error for debugging
      return false; // Return false to trigger validation failure
    }
  })
];

exports.getReports = async(req,res)=>
{
  const { page, limit, filter, orderBy } = req.query;

  const filterObj = filter ? JSON.parse(filter) : {}; // Initialize filterObj
  const sortObj = orderBy ? JSON.parse(orderBy) : { createdAt: -1 }; // Sort by `createdAt` by default

  const orConditions = [];

  // Iterate over the keys of the filter object
  Object.keys(filterObj).forEach(key => {
    // Create a regex for each field
    orConditions.push({ [key]: { $regex: filterObj[key], $options: 'i' } });
  });

  // If there are any orConditions, add them to filterObj with $or
  if(orConditions.length == 0)
  {
    orConditions.push({})
  }


  console.log(filterObj)

  try {

      const skip = (page - 1) * limit;

      let result = await ReportModel.find({$or:  orConditions})
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

      const total = await ReportModel.countDocuments({$or:  orConditions});
      const totalPages = Math.ceil(total / limit);

      let returned = 
      {
          result, 
          total,
          totalPages,
          page
      }

      returned.page = parseInt(page)


      res.status(200).json(returned)
  }
  catch(e)
  {    
      
      res.status(500).json({ error: `Internal server error: ${e}`})
  }
}



//////////////////////////////////////////////
// runReport
// Runs a report by passing it to a worker_thread and saving the results in a reportResults document. 
// Reports are stored with user email so that report results can be scoped to users. 
exports.validateRunReport = [
  param('name').isString().trim().withMessage('name is required')
];

exports.runReport = async(req,res) =>
{
  const {name} = req.params

  try 
  {
    // grab the report 
    let result = await ReportModel.findOne({name:name})

    // create a reportResulstsObject 
      const newRunReportResults = new ReportResultsModel({
        reportName: name,
        status:"running",
        userEmail: req.email
    })

    let newRunResults = await newRunReportResults.save()

    // run the report in a worker thread
    const worker = new Worker('./src/v1/worker_threads/run_report.js', { workerData: {email:req.email, report: JSON.stringify(result), runResultId: JSON.stringify(newRunResults._id)}});

    res.status(200).send("Report worker thread started.")
  }
  catch(e)
  {
    res.status(500).json({error: `Internal server error: ${e}`})
  }
}


exports.validateClearReportLogs = [
  param('name').isString().trim().withMessage('name is required')
];

exports.clearReportLogs = async(req,res) =>
{
  const {name} = req.params

  try 
  {
    await ReportModel.updateOne({name:name}, 
      {custom_logs: []}
    )
    res.status(200).send("Successfully cleared logs.")
  }
  catch(e)
  {
    res.status(500).json({error: `Internal server error: ${e}`})
  }
}



//////////////////////////////////////////////
// getReportResults
// Grabs a paginated list of report results, for the current users email. 
exports.validateGetReportResults= [
  // Validate 'name' as a non-empty string
  query('page').notEmpty().isString().trim().withMessage('page query parameter is required. It starts at 1.'),
  query('limit').notEmpty().isString().trim().withMessage('limit query parameter is required'),
  query('reportName').optional().isString().trim().withMessage('reportName must be a valid report'),
  query('filter')
  .optional()
  .custom((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (err) {
      console.error('Invalid JSON in filter:', err); // Log the error for debugging
      return false; // Return false to trigger validation failure
    }
  })
  .withMessage('Filter must be a valid JSON object with the parameters you wish to filter on.'),
query('orderBy')
  .optional()
  .custom((value) => {
    try {
      JSON.parse(value);
      return true;
    } catch (err) {
      console.error('Invalid JSON in orderBy:', err); // Log the error for debugging
      return false; // Return false to trigger validation failure
    }
  })
];

exports.getReportResults = async(req,res)=>
  {
    const { page, limit, filter, orderBy , reportName} = req.query;
    
    const {email} = req

    console.log(email, "THIS IS THE EMAIL")
  
    const filterObj = filter ? JSON.parse(filter) : {}; // Initialize filterObj
    const sortObj = orderBy ? JSON.parse(orderBy) : { createdAt: -1 }; // Sort by `createdAt` by default
  
    const orConditions = [];
  
    // Iterate over the keys of the filter object
    Object.keys(filterObj).forEach(key => {
      // Create a regex for each field
      orConditions.push({ [key]: { $regex: filterObj[key], $options: 'i' } });
    });
  
    // If there are any orConditions, add them to filterObj with $or
    if(orConditions.length == 0)
    {
      orConditions.push({})
    }
  
    
    try {
  
        const skip = (page - 1) * limit;

        let and = {$and: [{userEmail:email}, {$or:  orConditions}]}

        if(reportName)
          and.$and.push({reportName: reportName})
  
        let result = await ReportResultsModel.find(and,
          {reportName: 1, status: 1, errorMessage: 1, createdAt: 1, _id: 1}
        )
        .sort(sortObj)
        .skip(skip)
        .limit(limit);
  
        const total = await ReportResultsModel.countDocuments(and);
        const totalPages = Math.ceil(total / limit);
  
        let returned = 
        {
            result, 
            total,
            totalPages,
            page
        }

  
        returned.page = parseInt(page)
  
  
        res.status(200).json(returned)
    }
    catch(e)
    {    
        
        res.status(500).json({ error: `Internal server error: ${e}`})
    }
  }



//////////////////////////////////////////////
// getReportResult
// Returns the columns and rows for a report results, given an id and that the user emails match. 
exports.validateGetReportResult = [
  param('_id').isString().trim().withMessage('_id is required'),
]

exports.getReportResult = async (req, res) => {

    const {_id} = req.params
    const {email} = req
    try 
    {
        // Initializing and responding
  
        // probably not a safe way to do this but oh well
        let result = await ReportResultsModel.findOne({userEmail:email, _id:_id})

        res.status(200).json(result)

    }
    catch(e)
    {
        res.status(500).json({error: `Internal Server error: ${JSON.stringify(e)}`})
    }

};



//////////////////////////////////////////////
// deleteReportStatus
// Deletes a reportResults by _id, but also takes into account current user email. 
exports.validateDeleteReportStatus = [
  param('_id').isString().trim().withMessage('_id is required')
];

exports.deleteReportStatus = async (req, res) => {
  let {_id} = req.params;
  const {email} = req
  try 
  {
    let result = await ReportResultsModel.deleteOne({userEmail: email, _id:_id})

    res.status(200).json({status: 'Success', result: result})

  }
  catch(e)
  {
    res.status(500).json({error: `Internal server error: ${e}`})
  }
}
