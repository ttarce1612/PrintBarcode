let mongoose = require("mongoose");
// let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const serialPrintSchema = mongoose.Schema({
    client : String,
    sku : String,
    qty : Number,
    user : String,
    serial: String,
    lastmodified: {
        type: Date,
        default: Date.now()
    },
    isdeleted: {
        type: Number,
        default: 0
    }
});

// inboundSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Inbound Rule' });
serialPrintSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
serialPrintSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("serialPrint", serialPrintSchema, "serialPrint");