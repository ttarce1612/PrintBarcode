/**
 * Copyright (c) 2019 OVTeam
 * Modified by: Duy Huynh
 * Modified date: 2019/11/11
 */
var fs = require("fs");

function xmlElement(root, obj) {
	var attrPattern = /^@/i,
		content = "";
	var attrs = "";

	for (var i in obj) {
		if (attrPattern.test(i)) {
			attrs += i.replace('@', "") + '="' + obj[i] + '" ';
		} else if (typeof obj[i] == "string") {
			content += "\n<" + i + ">" + obj[i] + "</" + i + ">";
		} else if (Object.prototype.toString.call(obj[i]) == "[object Array]") {
            for (var j in obj[i]) {
                content += xmlElement(i, obj[i][j]) + "\n";
            }
        }
	}
	var result = "<" + root + "{0}>{1}</" + root + ">";
	result = result.replace("{0}", (attrs?(" " + attrs.trim()):"")); //Attribute
	result = result.replace("{1}", content);
	return result;
}

//Write XML File
function writeXMLStream(filepath, obj) {
    try {
        var stream = "<?xml version=\"1.0\" ?>\n";
        
        for (var i in obj) {
            if (typeof obj == 'object') {
                stream += xmlElement(i, obj[i]);
            }
        }
        
        fs.writeFile(filepath, stream);
        
        return true;
    } catch(e) {
        return false;
    }
}

module.exports = writeXMLStream;