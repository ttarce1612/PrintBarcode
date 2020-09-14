var mongoose = require("mongoose")
var uniqueValidator = require('mongoose-unique-validator')
var authenticatorSchema = mongoose.Schema({
	name: {
            type: String,
            required: [true, 'Name required.']
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
			message: '{VALUE} is not a valid Account email!'
		},
		required: [true, 'Email required']
	},
	rulecode: String,
	loginname: String,
	password: {
            type: String,
            required: [true, 'Password required']
        },
	newpassword: {
            type: String,
            validate: [
                {
                    validator: function (v) {
                        return /^[\S]{8,}$/.test(v);
                    },
                    message: 'The new password must be contain at least 8 character and none whitespace character.'
                },
                {
                    validator: function (v) {
                        if (v != '___NONE___')
                            return this.password && this.newpassword !== this.password;
                    },
                    message: 'The new password must be different with old password.'
                }
            ],
            required: [true, 'New Password required']
	},
	confirmpassword: {
            type: String,
            required: [true, 'Confirm Password required']
	},
	token: String,
	authenticated: Boolean,
	source: String,
	message: String,
	is2fa: Boolean,
        usersignature: {
            type: String,
            required: [true, 'User Signature required.'],
            default: ''
        },
        printname: {
            type: String,
            default: ''
        },
        engineerid: {
            type: String,
            // required: [true, 'Engineer Id required.'], // Temporary unset required Engineer ID - Huy Nghiem 12/11/2019
            default: ''
        }
})


authenticatorSchema.path('confirmpassword').validate(function (value) {
	return value == this.newpassword;
}, 'New password and confirm password don\'t match')

authenticatorSchema.plugin(uniqueValidator, { message: 'The {VALUE} must be unique in list Account' })

module.exports = mongoose.model("authenticatorSchema", authenticatorSchema, "authenticatorSchema")