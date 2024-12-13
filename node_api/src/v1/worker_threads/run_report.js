const { workerData } = require('worker_threads');
// import models to be used
const InventoryItemModel = require('../models/inventoryItemModel')
const InventoryItemTypeModel = require('../models/inventoryItemTypeModel')
const ReportResultsModel = require('../models/reportResultsModel')
const ReportModel = require('../models/reportModel')
// connect mongoose
const mongoose = require('mongoose');
mongoose.connect('mongodb://inventory:27017/inventory')

// import variables
let {runResultId, report} = workerData
report = JSON.parse(report)
runResultId = JSON.parse(runResultId)
let { code, name} = report


// the header and rows that the report needs to modify 
const header = []
const rows = []

// test the report for nefarious code
const regex = /(require\([\d\S\s]+\))|environ\.[\w\S]+/;

run()

// writes to the custom logs on report
function log(logText)
{
    
    (async ()=> 
    {
        try 
        {
            const report = await ReportModel.findOne({name:name})

            report.custom_logs.push(logText)
        
            await report.save()
        }
        catch(e)
        {
            console.log(e)
        }
    })()

}


async function run()
{
    try 
    {
            if(regex.test(code))
                throw "Cannot use require() or environ.* in reports."

            // Runs the report code
            async function scopedEval(code, variables) {
                const keys = Object.keys(variables);
                const values = Object.values(variables);
            
                // Create a new function with the variables as local scope
                return new Function(...keys, `return eval(${JSON.stringify(code)});`)(...values);
            }
        
            await scopedEval(code, {inventoryModel: InventoryItemModel, inventoryTypeModel: InventoryItemTypeModel, header:header, rows:rows, log:log})

            await ReportResultsModel.updateOne({_id:runResultId},
                {
                    "headers": header,
                    "rows": rows,
                    "status": "complete",
                }
            )
        }   
        catch(e)
        {
            await ReportResultsModel.updateOne({_id:runResultId},
                {
                    "status": "failed",
                    errorMessage: e
                }
            )
        }
}