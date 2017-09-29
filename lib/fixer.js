
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

var diacritics = {
    a: 'ÀÁÂÃÄÅàáâãäåĀāąĄ',
    c: 'ÇçćĆčČ',
    d: 'đĐďĎ',
    e: 'ÈÉÊËèéêëěĚĒēęĘ',
    i: 'ÌÍÎÏìíîïĪī',
    l: 'łŁ',
    n: 'ÑñňŇńŃ',
    o: 'ÒÓÔÕÕÖØòóôõöøŌō',
    r: 'řŘ',
    s: 'ŠšśŚ',
    t: 'ťŤ',
    u: 'ÙÚÛÜùúûüůŮŪū',
    y: 'ŸÿýÝ',
    z: 'ŽžżŻźŹ'
};

function replaceDiacritics(text) {
    for(var toLetter in diacritics) if(diacritics.hasOwnProperty(toLetter)) {
        for(var i = 0, ii = diacritics[toLetter].length, fromLetter, toCaseLetter; i < ii; i++) {
            fromLetter = diacritics[toLetter][i];
            if(text.indexOf(fromLetter) < 0) continue;
            toCaseLetter = fromLetter == fromLetter.toUpperCase() ? toLetter.toUpperCase() : toLetter;
            text = text.replace(new RegExp(fromLetter, 'g'), toCaseLetter);
        }
    }
    return text;
}

Fixer.prototype.set = function(section, value) {

    if (this.format.layout.hasOwnProperty(section)) {

        this.buf.fill(this.format.padding, this.format.layout[section][0], this.format.layout[section][0] + this.format.layout[section][1]);

        if (typeof this.format.layout[section][2].setter === "function" ) {
            value = this.format.layout[section][2].setter(value);
        }
        if (this.format.layout[section][2].justify) {
            var length = value.length;
            var difference = this.format.layout[section][1] - this.format.layout[section][0];
            var newIndex = difference - length + 1;
            this.buf.write(value, newIndex);
            this.todo[section] = false;
            return this;
        }
        if (typeof value === "number") {
            value += "";
        }
        else {
            value = replaceDiacritics(value);
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
    var type = this.format.layout[section][2].type;
    var start = this.format.layout[section][0];
    var end = start + this.format.layout[section][1];
    var returnValue = this.buf.toString('utf8', start, end);
    var parsedVal;
    var parsedFromFunction;
    var vals = this.format.layout[section][2].vals;
    returnValue = returnValue.trim();

    if (typeof this.format.layout[section][2].setter === "function" ) {
        parsedFromFunction = this.format.layout[section][2].getter(returnValue);
        return parsedFromFunction;
    }
    if (vals) {
        for( var prop in vals ) {
            if( vals.hasOwnProperty( prop ) ) {
                if( vals[ prop ] === returnValue ) {
                    parsedVal = prop;
                    return parsedVal;
                }
            }
        }
    }
    if (type === "number") {
        var parsedInt = parseInt(this.buf.toString('utf8', start, end));
        return parsedInt || 0;
    }

    return returnValue.trim();
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
            obj[a] = this.get(a);
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
    var padding = Array(maxFieldNameLength + 5).join(" ");

    for (a in this.format.layout) {
        if (this.format.layout.hasOwnProperty(a)) {
            output += a + ":" + padding.substr(0, padding.length - a.length) + this.get(a) + "\n";
        }
    }
    return output;
};

module.exports = Fixer;
