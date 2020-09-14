let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const outboundSchema = mongoose.Schema({
    code : String,
    socode: String,
    item : String,
    qty : Number,
    unit : String,
    cost : String,
    status: {
        type: String,
        default: "MỚI"
    },
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

outboundSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Outbound Rule' });
outboundSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
outboundSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("outbound", outboundSchema, "outbound");