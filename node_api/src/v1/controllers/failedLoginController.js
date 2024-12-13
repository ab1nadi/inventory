const FailedLoginsModel = require('../models/failedLoginsModel')

/////////////////////////////////////
// getFailedLogins
// returns all failed logins for the current users email
exports.getFailedLogins = async(req,res)=>
{
    const email = req.email
    
    try {
    
        let results = await FailedLoginsModel.find({userEmail:email})
    
        res.status(200).json(results)
    }
    catch(e)
    {    
        
        res.status(500).json({ error: `Internal server error: ${e}`})
    }
}
  

/////////////////////////////////////
// clearFailedLogins
// clears all failed logins for the current users email
exports.clearFailedLogins = async(req,res)=>
    {
        const email = req.email
        
        try {
        
            let results = await FailedLoginsModel.deleteMany({userEmail:email})
        
            res.status(200).json(results)
        }
        catch(e)
        {    
            res.status(500).json({ error: `Internal server error: ${e}`})
        }
    }
      