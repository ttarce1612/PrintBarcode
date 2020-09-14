let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const orderSchema = mongoose.Schema({
    socode: String,
    phone: String,
    item: String,
    unit: String,
    qty: Number,
    address: String,
    cost: Number,
    status: {
        type: String,
        default: 'MỚI'
    },
    lastmodified: {
        type: Date,
        default: Date.now()
    },
    isdeleted: {
        type: Number,
        default: 0
    }
});

orderSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Account Rule' });
orderSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
orderSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("orders", orderSchema);