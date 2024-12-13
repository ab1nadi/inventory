const mongoose = require('mongoose');

const InventoryItemSchema = new mongoose.Schema({
    cost: Number,  // cost of the item
    description: String,
    typeName: String,  // Relates an item to an inventoryItemType

    // attributes at the very least need to have the attributes in type
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed, // Dynamic key-value pair storage
    },
    
  }, { timestamps: true });


  const InventoryItemModel = mongoose.model('InventoryItem', InventoryItemSchema);

InventoryItemModel.init()
module.exports = InventoryItemModel;


