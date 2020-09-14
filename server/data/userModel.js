let mongoose = require("mongoose");
let uniqueValidator = require('mongoose-unique-validator');
let  mongoosePaginate = require('mongoose-paginate');
const beautifyUnique = require('mongoose-beautiful-unique-validation');

let accountSchema = mongoose.Schema({
    id: Number,
    name: {
        type: String,
        required: [true, 'Name required.']
    },
    password: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[\S]{8,}$/.test(v);
            },
            message: 'Password must be contain at least 8 character and none whitespace character.'
        },
        required: [true, 'Password required.']
    },
    email: {
        type: String,
        lowercase: true,
        validate: {
            validator: function (v) {
                return /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/.test(v);
                // return /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(v);
                // return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Your email is not valid.'
        },
        required: [true, 'Email required.']
    },
    loginname: {
        type: String,
        unique: true,
        validate: {
            validator: function (v) {
                return /^[a-zA-Z0-9\_]+$/.test(v);
            },
            message: 'The {VALUE} is an invalid Login name.'
        },
        required: [true, 'Login name required.']
    },
    fa2mode: {
        mail: Boolean,
        sms: Boolean,
        gauth: Boolean
    },
    countrycode: {
        type: String,
        default: '1'
    },
    phone: {
        type: String,
        validate: {
            validator: function (v) {
                return /^[0-9\.\s\-\(\)\_\+]{0,}$/gm.test(v);
                // return /^[\d{10,}\.\-\_\+]$/gm.test(v);
                // return /^[0-9]{1,4}[0-9]{10,}$/.test(v);
                // return /^[+]{0,2}[0-9]{0,1}[-\s\.]{0,1}[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{0,44}$/.test(v);
            },
            message: 'Your phone number is not valid.'
        }
        //, required: [true, 'Phone required.']
    },
    locked: Boolean,
    is2fa: Boolean,
    isresetpsw: Boolean,
    level: String,
    sites: {
        type: Object,
        required: [true, 'Please select at least one Access Site to continue the process.']
    },
    secrettoken: String,
    lastmodified: {
        type: Date,
        default: Date.now()
    },
    role: mongoose.Schema.Types.Mixed,
    modifiedby: String,
    isdeleted: {
        type: Number,
        default: 0
    },
    // This field mean is how many time user request to reset psw
    requesttime: {
        type: Number,
        default: 0
    },
    signature: String,
    timezone: mongoose.Schema.Types.Mixed,
    staff: mongoose.Schema.Types.Mixed,
    customer: mongoose.Schema.Types.Mixed,
    isadmin: Boolean,
    otptoken: String,
    languages: mongoose.Schema.Types.Mixed
});
mongoosePaginate.paginate.options = { 
    lean:  false,
    leanWithId: false
};

accountSchema.plugin(beautifyUnique); // Format error message for DEMO 2 - Huy Nghiem 12/11/2019
accountSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in Account list.' });
accountSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("users", accountSchema, "users");