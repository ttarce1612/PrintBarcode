let mongoose = require("mongoose");
// let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const StoreSchema = mongoose.Schema({
    client : String,
    barcode : String,
    name : String,
    SKU : String,
    qty: Number,
    unit:String,
    unit_per_case: String,
    updated_date: {
        type: Date,
        default: Date.now()
    },
    created_date: {
        type: Date,
        default: Date.now()
    }
});

// inboundSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Inbound Rule' });
StoreSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
StoreSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("EBT.Store", StoreSchema, "EBT.Store");