const { body, query, validationResult, param } = require('express-validator');
const InventoryItemModel = require('../models/inventoryItemModel')
const ItemTypeModel = require('../models/inventoryItemTypeModel')


// can be used to check errors for anything in here
exports.checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  };


// checkAttributes
// checks if the attributes include a typeName
// if so then the attributes definition name must exist, 
// and the attributes must match the attributes definition.
exports.checkAttributes = async (req,res,next) =>
    {
        let {typeName, attributes } = req.body;
    
        // Check if that attribute definition actually exists 

        console.log(typeName, attributes)
        
        let typeDef = await ItemTypeModel.findOne({ name: typeName }); // Use `find` instead of `findOne`

        if(typeDef == null)
            return res.status(400).json({ "error": `ItemType: ${typeName} does not exist.` });


    
        // Validating attributes against typeDefs
        for (let d of typeDef.attributes) {
            let found = false;
    
            for (let a of attributes) {

                if (d.attributeName === a.name) {

                    if (d.dataType.toLowerCase() !== typeof(a.value))
                        return res.status(400).json({ "error": `Received: ${typeof(a.value)} but expected: ${d.dataType.toLowerCase()} for ${d.attributeName} in '${attributesDefinitionName}'` });
                    
                    found = true;
                    break; // Exit the inner loop if a match is found
                }
            }
    
            if (!found) {
                return res.status(400).json({ "error": `Couldn't find required attribute: ${d.attributeName}` });
            }
        }
        
    
        next()
    }



/////////////////////////////////////
// createItem
exports.validateCreateItem = [
    body('description').isString().trim().withMessage('description is required'),

    body('cost').isNumeric().withMessage('cost is required'),

    body('typeName').notEmpty().isString().trim().withMessage('typeName, must point at a valid itemType'),

    body('attributes').isArray().withMessage('attributes, must be an array, and match the attributesDefinition if a valid one was provided'),

    body('attributes.*.name').notEmpty().withMessage('attribute name must be included'),

    body('attributes.*.value').notEmpty().withMessage('attribute value must be included')
    
];
exports.createItem = async (req, res) => {
    let { cost, description, typeName, attributes } = req.body;

    let storedAttributes = {}

    for (let a of attributes)
        storedAttributes[a.name] = a.value

    
    // Initializing and responding
    const newInventoryItemModel = new InventoryItemModel({
        typeName: typeName,
        description: description,
        cost: cost,
        attributes: storedAttributes
    })

    let result = await newInventoryItemModel.save()

    res.status(200).json({status: 'Success', _id: result._id})


};



/////////////////////////////////////
// updateItem
exports.validateUpdateItem = [
    param('_id').notEmpty().withMessage('_id required to modify inventory attributes'),

    body('description').isString().trim().withMessage('description is required'),

    body('cost').isNumeric().withMessage('cost is required'),

    body('typeName').notEmpty().isString().trim().withMessage('typeName, must point at a valid itemType'),

    body('attributes').isArray().withMessage('attributes, must be an array, and match the attributesDefinition if a valid one was provided'),

    body('attributes.*.name').notEmpty().withMessage('attribute name must be included'),

    body('attributes.*.value').notEmpty().withMessage('attribute value must be included')
  
];
exports.updateItem = async (req, res) => {

    let _id = req.params._id
    
    let { description, cost, typeName, attributes } = req.body;

    let storedAttributes = {}

    for (let a of attributes)
        storedAttributes[a.name] = a.value

    
    // Initializing and responding
    InventoryItemModel.init().then(async () => {
        const result = await InventoryItemModel.updateOne({_id:_id}, 
        {typeName:typeName,
         description: description,
         cost:cost,
         attributes: storedAttributes
        })

        res.status(200).json({status: 'Success', result: result})

    });
};


/////////////////////////////////////
// getItems
exports.validateGetItems = [
  query('page').notEmpty().isString().trim().withMessage('Page query parameter is required. It starts at 1.'),
  query('limit').notEmpty().isString().trim().withMessage('Limit query parameter is required.'),
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
    .withMessage('Sort must be a valid JSON object with the parameters for sorting.'),
    query('combineCost')
    .optional()
    .isBoolean().withMessage('combineCost must be a boolean true or false.'),


];

exports.getItems = async (req, res) => {
    const { page, limit, filter, orderBy, combineCost} = req.query;

    try {
        let total = 0;
        let totalPages = 0;
        let result;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const filterObj = filter ? JSON.parse(filter) : {}; // Initialize filterObj
        const sortObj = orderBy ? JSON.parse(orderBy) : { createdAt: -1 }; // Sort by `createdAt` by default



        if (combineCost === "true") {
            // Aggregation to group by `cost` and `typename` and count items in each group
            result = await InventoryItemModel.aggregate([
                {
                    $project: {
                        cost: 1, 
                        typeName: 1,
                        // Convert the attributes map to an array of key-value pairs
                        attributes: { $objectToArray: "$attributes" }
                    }
                },
                {
                    $group: {
                        _id: { 
                            typeName: "$typeName" 
                        },  
                        totalItems: { $sum: 1 },                         // Count the number of items in each group
                        totalCost: { $sum: "$cost" },                    // Sum the cost for each group
                        attributes: { $addToSet: "$attributes.k" }       // Collect unique attribute keys into an array
                    }
                },
                {
                    $unwind: "$attributes" // Unwind the attributes array to separate documents for each key-value pair
                },
                {
                    $project: {
                        totalItems: {$toString: "$totalItems"}, // Include totalItems from the group
                        totalCost: {$toString: "$totalCost"}, // Include totalCost from the group
                        attributes: 1
                    }
                    
                },
                { $match: filterObj
                }, // Apply initial filter
                { $sort: sortObj },                                  // Apply sorting
                { $skip: skip },
                { $limit: parseInt(limit) }
            ]);

            // Get total count of unique `cost` and `typename` groups
            const totalGroups = await InventoryItemModel.aggregate([
                {
                    $group: {
                        _id: { 
                            typeName: "$typeName" 
                        }
                    }
                },
                { $match: filterObj },
                { $count: "totalGroups" }
            ]);

            total = totalGroups.length ? totalGroups[0].totalGroups : 0;
            totalPages = Math.ceil(total / parseInt(limit));
        } else {
            // Regular query if `combineCost` is not enabled
            result = await InventoryItemModel.find(filterObj)
                .sort(sortObj)
                .skip(skip)
                .limit(parseInt(limit));

            total = await InventoryItemModel.countDocuments(filterObj);
            totalPages = Math.ceil(total / parseInt(limit));
        }

        res.status(200).json({
            result,
            total,
            totalPages,
            page: parseInt(page)
        });
    } catch (e) {
        console.error("Error fetching items:", e);
        res.status(500).json({ "error": 'Internal server error.' });
    }
};





/////////////////////////////////////
// getItem
exports.validateGetItem = [
    param('_id')
        .notEmpty()
        .isString()
        .trim()
        .isMongoId()
        .withMessage('_id must be a valid MongoDB ObjectId to fetch a single inventory item.')
];
exports.getItem = async (req, res) => {

    const {_id} = req.params
    
    try 
    {
        // Initializing and responding
        InventoryItemModel.init().then(async () => {
            // probably not a safe way to do this but oh well
            let result = await InventoryItemModel.findById(_id)

            res.status(200).json(result)
        });
    }
    catch(e)
    {
        res.status(500).json({error: `Internal Server error: ${JSON.stringify(e)}`})
    }

};



/////////////////////////////////////
// deleteItem
exports.validateDeleteItem = [
    param('_id').notEmpty().isString().trim().withMessage('_id is required to delete an inventory item.')
];
exports.deleteItem = async (req, res) => {

    const {_id} = req.params
    
    // Initializing and responding
    InventoryItemModel.init().then(async () => {
        // probably not a safe way to do this but oh well
        let result = await InventoryItemModel.findByIdAndDelete(_id)
        res.status(200).json(result)
    });
};


exports.validateCountItems = [
    param('_typeName').notEmpty().isString().trim().withMessage('typeName param is required')
];

exports.countItems = async (req, res) => {
    
    let {_typeName} = req.params
    console.log(_typeName)
    let result = await InventoryItemModel.countDocuments({typeName:_typeName})
    res.status(200).json(result)

};