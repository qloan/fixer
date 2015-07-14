var should  = require('chai').should();
var expect  = require('chai').expect;

var Fixer = require('../lib/fixer');

/* global describe before after beforeEach afterEach it fixer */

describe('fixer', function () {
    var format = {
        length: 7,
        // padding: " ",
        // initialValue: "  -  -    ",
        layout: {
            zero: [0, 2, false],
            four: [4, 2, false]
        }
    };

    var dv = "aaaaxxaaaa";

    before(     function(done) {  done(); });
    after(      function(done) {  done(); });
    beforeEach( function(done) {
        fixer = new Fixer(format, {defaultValue: dv});
        done();
    });
    afterEach(  function(done) {  done(); });


    it("should fail if the length does not add up to the amount in the format layout structure", function(done) {
        var myFormat = JSON.parse(JSON.stringify(format));
        myFormat.length = 8;
        expect(new Fixer(myFormat)).to.be.a('object');

        myFormat.length = 4;
        var test;
        try {
            test = new Fixer(myFormat);
        }
        catch (e) {
            e.toString().should.contain("Error: format.length must be greater")
            done();
        }
        expect(test).to.be.an("undefined");
    });

    it("should fail if length is not passed in", function(done) {
        var myFormat = JSON.parse(JSON.stringify(format));
        delete myFormat.length;

        var test;
        try {
            test = new Fixer(myFormat);
        }
        catch (e) {
            e.toString().should.contain("Error: format.length is a")
            done();
        }
        expect(test).to.be.an("undefined");
    });

    it("should pad strings to the specified padding value", function(done) {
        var myFormat = JSON.parse(JSON.stringify(format));
        format.padding = "-";
        fixer = new Fixer(format);
        fixer.output().should.equal('-------');
        fixer.set("four", "aa");
        fixer.output().should.equal('----aa-');
        done();
    });
    it("should use _initialValue property to pre allocate part of the string", function(done) {
        var myFormat = JSON.parse(JSON.stringify(format));
        format.padding = "a";
        format.length = 10;
        format.initialValue = "  -  -   ";
        fixer = new Fixer(format);
        fixer.output().should.equal("  -  -   a");
        fixer.set("zero", "bb")
        fixer.output().should.equal("bb-  -   a");
        done();
    });

    it("should accept the default value", function(done) {
        fixer.output().should.equal(dv);
        done();
    });

    it("should replace a section", function(done) {
        fixer.set("four", "bb");
        var output = fixer.output();
        output.should.equal("aaaabbaaaa");
        done();
    });

    it("should convert numbers to strings", function(done) {
        fixer.set("four", 99);
        var output = fixer.output();
        output.should.equal("aaaa99aaaa");
        done();
    });

    it("should get a value", function(done) {
        fixer.get("four").should.equal("xx");
        fixer.set("four", "bb");
        fixer.get("four").should.equal("bb");
        done();
    });

    // it("should fail when required fields are not set", function(done) {
    //     var myFormat = JSON.parse(JSON.stringify(format));
    //     myFormat.layout.zero[2] = true;

    //     fixer = new Fixer(myFormat);
    //     var fn = fixer.output.bind(fixer);
    //     expect(fn).to.throw("Property ");

    //     fixer.set("zero", "b");
    //     expect(fn).not.to.throw();
    //     done();
    // });

    it("should enforce the length property in the layout structure", function(done) {
        var fn = fixer.set.bind(fixer, "four", "a really long string that shouldn't work");
        expect(fn).to.throw("Value: 'a really long string");
        done();
    });

    it("should fail to set a field if the field is not in the layout", function(done) {
        var fn = fixer.set.bind(fixer, "blah", "this shouldn't work");
        expect(fn).to.throw("Invalid property");
        done();
    });

    it("should work with ssn example in the top", function(done) {
        var format = {
             length: 12,      // required field describing the total length the fixed format data is
             padding: "!",   // character the output string will be padded with
             initialValue: "   -  -    ", // initial value the string will be initialized to
             layout: {
                 first:  [0, 3, true],
                 second: [4, 2, true],
                 third:  [7, 4, true]
              }
         }
        var a = new Fixer(format);
        a.set("first", 111);
        a.set("second", "22");
        a.set("third", "6789");
        a.output().should.equal("111-22-6789!");
        done();
    });
});
