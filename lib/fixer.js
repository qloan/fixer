
//
//  Fixer:
//  Utility functions for fixed format data.
//  Format: {
//      length: 12,      // required field describing the total length the fixed format data is
//      padding: "!",   // character the output string will be padded with
//      initialValue: "   -  -    ", // initial value the string will be initialized to
//      layout: {
//          first:  [0, 3, true],
//          second: [4, 2, true],
//          third:  [7, 4, true]
//       }
//  }
//  var a = new Fixer(format);
//  a.set("first", 111);
//  a.set("second", "22");
//  a.set("third', "6789");
//  a.output() -> "111-22-6789!"
//


// Should we add a {} with padding, justification etc per field?  [0, 4, false, {padding: "0", justified: "right"}]?, validation? mapping?

function Fixer(format, options, values) {
    this.options = options || {};
    this.todo = {};
    this.format = format;

    var a;
    //
    //  Mark required properties as such and verify that the layout is less than or
    //  equal to the specified length
    //
    var maxLength = 0;
    for (a in this.format.layout) {
        if (this.format.layout.hasOwnProperty(a)) {
            maxLength = Math.max(maxLength, this.format.layout[a][0] + this.format.layout[a][1]);
        }
    }

    if (!this.format.length) {
        throw new Error("format.length is a required field");
    }
    if (maxLength > this.format.length) {
        throw new Error("format.length must be greater than the largest field specified.");
    }

    this.buf = new Buffer(this.format.length);
    if (!format.padding) {
        format.padding = " ";
    }
    this.buf.fill(this.format.padding, 0, this.format.length);

    for (a in this.format.layout) {
        if (this.format.layout.hasOwnProperty(a)) {
            this.format.layout[a].push({});
            var opt = this.format.layout[a][2];
//            var opt = this.format.layout[a][2] || {};
            this.todo[a] = opt.required || false;
            if (opt.default) {
                this.set(a, opt.default);
            }
        }
    }

    if (this.options.defaultValue) {
        this.buf.write(options.defaultValue, 0);
    }
    else if (this.format.initialValue){
        this.buf.write(this.format.initialValue, 0);
    }

    if (values) {
        for (a in values) {
            if (values.hasOwnProperty(a)) {
                this.set(a, values[a]);
            }
        }
    }
}

Object.prototype.getKeyByValue = function( value ) {
    for( var prop in this ) {
        if( this.hasOwnProperty( prop ) ) {
             if( this[ prop ] === value )
                 return prop;
        }
    }
};

Fixer.prototype.set = function(section, value) {
    if (this.format.layout.hasOwnProperty(section)) {
        if (typeof value === "number") {
            value += "";
        }
        if (typeof value === "boolean") {
            if (value === true) {
                value += "";
            } else if (value === false) {
                value += "";
            }
        }
        if (this.format.layout[section][2].vals) {
            value = this.format.layout[section][2].vals[value.toString().toLowerCase()] || value;
        }

        if (value.length > this.format.layout[section][1]) {
            throw new Error("Value: '" + value + "'' contains to many characters, limit is " + this.format.layout[section][1]);
        }
        this.buf.write(value, this.format.layout[section][0]);
        this.todo[section] = false;
    }
    else {
        throw new Error("Invalid property " + section);
    }
    return this;
};

Fixer.prototype.length = function() {
    return this.format.length;
};

Fixer.prototype.get = function (section) {

    var start = this.format.layout[section][0];
    var end = start + this.format.layout[section][1];
    var returnValue = this.buf.toString('utf8', start, end)
    var parsedBool;
    var parsedInt = parseInt(this.buf.toString('utf8', start, end))
    var parsedVal;
    var vals = this.format.layout[section][2].vals;
    if (vals) {
        returnValue = returnValue.replace(/\s+/g, '');
        parsedVal = vals.getKeyByValue(returnValue)
        return parsedVal;
    }
    if (returnValue.toLowerCase() === "true") {
        parsedBool = true;
        return parsedBool;
    } else if (returnValue.toLowerCase() === "false") {
        parsedBool = false;
        return parsedBool;
    }

    if (parsedInt) {
        return parsedInt;
    }

    return this.buf.toString('utf8', start, end);
};

Fixer.prototype.output = function() {


    for (var a in this.todo) {
        if (this.todo.hasOwnProperty(a) && this.todo[a]) {
            throw new Error("Property '" + a + "'' is required");
        }
    }

    return this.buf.toString("utf8", 0, this.format.length);
};

Fixer.prototype.toJSON = function() {
    var obj = {};
    for (var a in this.format.layout) {
        if (this.format.layout.hasOwnProperty(a)) {
            obj[a] = this.get(a).trim();
        }
    }
    return obj;
};

Fixer.prototype.print = function() {
    var output = "";
    var maxFieldNameLength = 0;
    var a;
    for (a in this.format.layout) {
        if (this.format.layout.hasOwnProperty(a)) {
            maxFieldNameLength = Math.max(maxFieldNameLength, a.length);
        }
    }
    console.log(maxFieldNameLength);
    var padding = Array(maxFieldNameLength + 5).join(" ");

    for (a in this.format.layout) {
        output += a + ":" + padding.substr(0, padding.length - a.length) + this.get(a) + "\n";
    }
    return output;
};

module.exports = Fixer;