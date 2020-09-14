const codeModel = require("./../data/codeModel");

/**
 * Generate code
 */
exports.generateCode = async (name, len = 8) => {
    let currentObject = await codeModel.findOneAndUpdate({ name: name }, { $inc: { nextindex: 1 } }).exec();
    let code = currentObject['prefix'] + "00000000000000000".substr(0, len);
    return code.substring(0, code.length - (currentObject['nextindex'] + "").length) + currentObject['nextindex'];
}