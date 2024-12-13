const { body, query, validationResult, param } = require('express-validator');
const ItemTypeModel = require('../models/inventoryItemTypeModel')
const InventoryItemModel = require('../models/inventoryItemModel')

// can be used to check errors for anything in here
exports.checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next(); 
  };



//////////////////////////////////////////////
// createInventoryType
// creates a single inventory attribute definition, checking that the passed attributes have types that exist. 

const validTypes = ['String', 'Number', 'Boolean', 'Array', 'Date'];
exports.validateCreateInventoryType= [
    // Validate 'name' as a non-empty string
    body('name').notEmpty().isString().trim().withMessage('Name must be a string'),

    // Validate 'attributes' as an array
    body('attributes').isArray().withMessage('Attributes must be an array of {name:string, type:string, required:boolean}'),

    // Validate each 'name' in the attributes array as a string
    body('attributes.*.attributeName').isString().withMessage('Each attribute must have a valid name as a string'),

    // Validate each 'type' in the attributes array, ensuring it matches one of the valid types
    body('attributes.*.dataType').isString().withMessage('Type must be a string')
    .custom((value) => {
        if (!validTypes.includes(value)) {
            throw new Error(`Invalid type: ${value}. Valid types are: ${validTypes.join(', ')}`);
        }
        return true;
    }),

];


exports.createInventoryType=  async (req,res)=> 
{
    let {name, attributes} = req.body   
    
   try
    {
        const newInventoryAttributes = new ItemTypeModel({
            name: name,
            attributes: attributes
        })

        let result = await newInventoryAttributes.save()


        res.status(200).json({status: 'Success', _id: result._id})
    }
    catch(e){

        if(e.code == 11000)
            return res.status(400).json({error: `Inventory Type with name "${name}" already exists`})

        res.status(500).json({ error: `Cannot create new inventory attributes type: ${e}`})
    }
}

//////////////////////////////////////////////
// updateInventoryType
// Updates a single inventory attribute definition by name parameter

exports.validateUpdateInventoryType = [
    // Validate 'name' as a non-empty string
    param('name').notEmpty().isString().trim().withMessage('Name parameter is required'),

    // Validate 'attributes' as an array
    body('attributes').isArray().withMessage('Attributes must be an array of {name:string, type:string, required:boolean}'),

    // Validate each 'name' in the attributes array as a string
    body('attributes.*.attributeName').isString().withMessage('Each attribute must have a valid name as a string'),

    // Validate each 'type' in the attributes array, ensuring it matches one of the valid types
    body('attributes.*.dataType').isString().withMessage('Type must be a string')
    .custom((value) => {
        if (!validTypes.includes(value)) {
            throw new Error(`Invalid type: ${value}. Valid types are: ${validTypes.join(', ')}`);
        }
        return true;
    }),

];

exports.updateInventoryType =  async (req,res)=> 
{
    let name = req.params.name
    let attributes = req.body.attributes

    try
    {
        let result = await ItemTypeModel.updateOne({name:name}, {attributes:attributes})
        
        
            
        res.status(200).json(result)
    }
    catch(e)
    {

        res.status(500).json({ error: `Cannot update inventory attributes type: ${e}`})
    }
}


//////////////////////////////////////////////
// validateUpdateInventoryTypeExtended
// Updates attributes of inventory items, used for when type attributes get modified
exports.validateUpdateInventoryTypeExtended = [
    // Validate 'name' as a non-empty string in the body
    body('name').notEmpty().isString().trim().withMessage('Name parameter is required'),

    // Validate 'attributes' as an array
    body('attributes').isArray().withMessage('Attributes must be an array of objects with name, type, and required properties'),

    // Validate each 'new' field in the attributes array as an optional object
    body('attributes.*.new').optional()
    .custom((value) => value === null || typeof value === 'object')
    .withMessage('new field in attribute must be an object'),

    // Validate each 'old' field in the attributes array as an optional non-null object
    body('attributes.*.old')
        .optional()
        .custom((value) => value === null || typeof value === 'object')
        .withMessage('old field in attribute must be an object'),

    // Validate each 'attributeName' within 'old' only if 'old' exists as a non-null object
    body('attributes.*.old.attributeName')
        .if(body('attributes.*.old').exists().custom((value) => value !== null))
        .isString()
        .withMessage('Each old attribute must have a valid name as a string'),

    // Validate each 'dataType' within 'old' only if 'old' exists as a non-null object and matches a valid type
    body('attributes.*.old.dataType')
        .if(body('attributes.*.old').exists().custom((value) => value !== null))
        .isString()
        .withMessage('Old dataType must be a string')
        .custom((value) => {
            if (!validTypes.includes(value)) {
                throw new Error(`Invalid old type: ${value}. Valid types are: ${validTypes.join(', ')}`);
            }
            return true;
        }),

    // (Similarly for the 'new' object, if needed)
    body('attributes.*.new.attributeName')
        .if(body('attributes.*.new').exists().custom((value) => value !== null))
        .isString()
        .withMessage('Each new attribute must have a valid name as a string'),

    body('attributes.*.new.dataType')
    .if(body('attributes.*.new').exists().custom((value) => value !== null))
        .isString()
        .withMessage('New dataType must be a string')
        .custom((value) => {
            if (!validTypes.includes(value)) {
                throw new Error(`Invalid new type: ${value}. Valid types are: ${validTypes.join(', ')}`);
            }
            return true;
        }),
];

exports.updateInventoryTypeExtended =  async (req,res)=> 
    {
        let name = req.params.name
        let attributes = req.body.attributes


        let set = {attributes:{}}

        let unset = []


        let updatedAttributes = []

        try
        {


            for(let attrib of attributes)
            {
                if (attrib.old != null && attrib.new != null && attrib.old.attributeName == attrib.new.attributeName)
                {
                    updatedAttributes.push(attrib.new)
                }

                // creating a new attribute
                else if(attrib.old == null && attrib.new != null)
                {

                    if(attrib.new.dataType == "Number")
                        set.attributes[attrib.new.attributeName] = 0
                    else 
                        set.attributes[attrib.new.attributeName] = ""


                    updatedAttributes.push(attrib.new)
                }
                // updating old attribute
                else if(attrib.old != null && attrib.new != null)
                {
                    // set the new one
                    set.attributes[attrib.new.attributeName] = `$attributes.${attrib.old.attributeName}`

                    // remove the old one 
                    unset.push(`attributes.${attrib.old.attributeName}`)

                
                    updatedAttributes.push(attrib.new)
                }
                // removing old attribute
                else if(attrib.old != null && attrib.new == null)
                {
                    unset.push(`attributes.${attrib.old.attributeName}`)
                }

            }


            //return res.status(200).json({$unset: unset})

            let pipeline = []

           
            if(Object.keys(set.attributes).length > 0)
                pipeline.push({"$set":set})

            if(unset.length> 0)
                pipeline.push({"$unset":unset})




            // modify in bulk any inventory types that use this stuff
            let inventoryResult = await InventoryItemModel.updateMany(
                { typeName: name },
                pipeline
              )            

        
            let typeResult = await ItemTypeModel.updateOne({name:name}, {attributes:updatedAttributes})
            
                
            res.status(200).json({inventoryResult: inventoryResult, typeResult:typeResult})
        }
        catch(e)
        {

            console.log(e)
    
            res.status(500).json({ error: `Cannot update inventory attributes type: ${e}`})
        }
    }


//////////////////////////////////////////////
// deleteInventoryType
// deletes a single attribute def by name

exports.validateDeleteInventoryType = [
    // Validate 'name' as a non-empty string
    param('name').notEmpty().isString().trim().withMessage('Name parameter is required'),
];

exports.deleteInventoryType =  async (req,res)=> 
    {

        let name = req.params.name

        try {
            const InventoryCount = await InventoryItemModel.countDocuments({typeName:name})

            if (InventoryCount > 0)
                return res.status(400).json({error: `Cannot delete an Inventory Type used by ${InventoryCount} Inventory items.`})

                let result = await ItemTypeModel.deleteOne({name:name})
                res.status(200).json(result)
            
        }
        catch(e)
        {
                res.status(500).json({ error: `Internal server error: ${e}`})
        }
    }




//////////////////////////////////////////////
// getInventoryType
// gets a single inventory attribute def by name


exports.validateGetInventoryType = [
    // Validate 'name' as a non-empty string
    param('name').notEmpty().isString().trim().withMessage('Name parameter is required'),
];

// gets a single attributeDef by name
exports.getInventoryType = async (req,res)=>
{
    let name = req.params.name
    
    ItemTypeModel.init().then(async ()=> 
    {
        let result = await ItemTypeModel.findOne({name:name})
        res.status(200).json(result)
    })
    .catch(e => {
        res.status(500).json({ error: `Cannot create delete inventory attributes type: ${e}`})
    })
}


//////////////////////////////////////////////
// getInventoryTypes
// gets a paged list of attribute definitions using page and limit query parameters
exports.validateGetInventoryTypes = [
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

exports.getInventoryTypes = async(req,res)=>
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

    
    console.log(filterObj, orConditions)

    try {

        const skip = (page - 1) * limit;

        let result = await ItemTypeModel.find({$or:  orConditions})
        .sort(sortObj)
        .skip(skip)
        .limit(limit);

        const total = await ItemTypeModel.countDocuments({$or:  orConditions});
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


