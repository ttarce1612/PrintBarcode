let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

const accruleSchema = mongoose.Schema({
    id: Number,
    rolename: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z\_\ ]+$/.test(v);
            },
            message: 'Only accept letters, underline and whitespace for Name [{VALUE}]'
        },
        required: [true, 'Name required']
    },
    description: String,
    sites: {
        type: Array,
        required: [true, 'Site required']
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

accruleSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Account Rule' });
accruleSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
accruleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("userroles", accruleSchema);