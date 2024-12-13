const express = require('express');
const {verify} = require('../middleware/authMiddleware')

const inventoryType = require('../controllers/inventoryItemTypeController')
const inventoryItem = require('../controllers/inventoryItemController')
const report = require('../controllers/reportController')
const failedLogins = require('../controllers/failedLoginController')
const router = express.Router();

// verify checks if the current request has a valid bearer token header
router.use(verify)


// Inventory Item Type Routes
//////////////////////////////////////////////
router.get('/itemType',
    inventoryType.validateGetInventoryTypes, 
    inventoryType.checkValidation,
    inventoryType.getInventoryTypes
)

router.get('/itemType/:name',
    inventoryType.validateGetInventoryType, 
    inventoryType.checkValidation,
    inventoryType.getInventoryType
)

router.post('/itemType',
    inventoryType.validateCreateInventoryType, 
    inventoryType.checkValidation,
    inventoryType.createInventoryType
)

router.put('/itemType/:name',
    inventoryType.validateUpdateInventoryType, 
    inventoryType.checkValidation,
    inventoryType.updateInventoryType
)

router.put('/itemType/extended/:name',
    inventoryType.validateUpdateInventoryTypeExtended, 
    inventoryType.checkValidation,
    inventoryType.updateInventoryTypeExtended
)

router.delete('/itemType/:name',
    inventoryType.validateDeleteInventoryType, 
    inventoryType.checkValidation,
    inventoryType.deleteInventoryType
)
       

// Inventory Item Routes
///////////////////////////////////////
router.post('/item', 
    inventoryItem.validateCreateItem,
    inventoryItem.checkValidation,
    inventoryItem.checkAttributes,
    inventoryItem.createItem
)


router.put('/item/:_id', 
    inventoryItem.validateUpdateItem,
    inventoryItem.checkValidation,
    inventoryItem.checkAttributes,
    inventoryItem.updateItem
)

router.get('/item', 
    inventoryItem.validateGetItems,
    inventoryItem.checkValidation,
    inventoryItem.getItems
)

router.get('/item/:_id',
    inventoryItem.validateGetItem,
    inventoryItem.checkValidation,
    inventoryItem.getItem
)

router.delete('/item/:_id',
    inventoryItem.validateDeleteItem,
    inventoryItem.checkValidation,
    inventoryItem.deleteItem
)

router.get('/item/count/:_typeName',
    inventoryItem.validateCountItems,
    inventoryItem.checkValidation,
    inventoryItem.countItems
)


// Basic report routes 
/////////////////////////////////
router.post('/report', 
    report.validateCreateReport,
    report.checkValidation,
    report.createReport
)

router.get('/report', 
    report.validateGetReports,
    report.checkValidation,
    report.getReports
)

router.get('/report/:name',
    report.validateGetReport,
    report.checkValidation,
    report.getReport
)

router.put('/report/:name',
    report.validateUpdateReport,
    report.checkValidation,
    report.updateReport
)

router.delete('/report/:name',
    report.validateDeleteReport,
    report.checkValidation,
    report.deleteReport
)


// Run report and report results routes 
//////////////////////////////////////
router.post('/runreport/:name', 
    report.validateRunReport,
    report.checkValidation,
    report.runReport
)

router.delete('/clearReportLogs/:name', 
    report.validateClearReportLogs,
    report.checkValidation,
    report.clearReportLogs
)

router.get('/reportResults', 
    report.validateGetReportResults,
    report.checkValidation,
    report.getReportResults
)

router.get('/reportResult/:_id', 
    report.validateGetReportResult,
    report.checkValidation,
    report.getReportResult
)

router.delete('/reportResult/:_id', 
    report.validateDeleteReportStatus,
    report.checkValidation,
    report.deleteReportStatus
)


router.get('/failedLogins', failedLogins.getFailedLogins)


router.delete('/failedLogins', failedLogins.clearFailedLogins)

module.exports = router