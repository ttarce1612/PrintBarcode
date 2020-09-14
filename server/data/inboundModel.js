let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const inboundSchema = mongoose.Schema({
    code : String,
    item : String,
    qty : Number,
    unit : String,
    cost : String,
    modifiedby: String,
    lastmodified: {
        type: Date,
        default: Date.now()
    },
    isdeleted: {
        type: Number,
        default: 0
    }
});

inboundSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Inbound Rule' });
inboundSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
inboundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("inbound", inboundSchema, "inbound");