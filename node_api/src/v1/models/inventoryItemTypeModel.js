const mongoose = require('mongoose');

// AttributeSchema defines what attributes are allowed for each item type
const itemTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,  // Ensure the item type name is always provided
    trim: true,
    index: { unique: true } // Ensure unique index on name
  },
  attributes: [{
    attributeName: {
      type: String,
      required: true,  // Ensure the attribute name is always provided
      trim: true
    },
    dataType: {
      type: String,
      enum: ['String', 'Number', 'Boolean', 'Date', 'Array'], // Specify allowed data types
      required: true // Make data type required
    }
  }]
}, { timestamps: true }); // Automatically manage createdAt and updatedAt timestamps

const ItemTypeModel = mongoose.model('ItemType', itemTypeSchema);

ItemTypeModel.init()


module.exports = ItemTypeModel;
