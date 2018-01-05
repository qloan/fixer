# fixer

Utility functions for fixed format data.

# Installation

```
npm install fixer
```

# Basic Usage
```
  Format: {
      length: 12,       // required field describing the total length the fixed format data is
      padding: "!",    // character the output string will be padded with
      initialValue: "   -  -    ",  // initial value the string will be initialized to
      layout: {
          first:  [0, 3, {required: true}],
          second: [4, 2, {required: true}],
          third:  [7, 4, {required: true}]
       }
  }
  var a = new Fixer(format);
  a.set("first", 111);
  a.set("second", "22");
  a.set("third', "6789");
  a.output() -> "111-22-6789!"
  ```
# Layout

```
layout: {
          first:  [0, 3, {required: true}], // section: [startingIndex, maxLength, options]
          second: [4, 2, {required: true}],
          third:  [7, 4, {required: true}]
       }

//options

required: bool			// whether or not the section is required
type: string           // type of value, defaults to string
default: string       // default value
setter: function     // function that takes value, run on SET
getter: function    // function that takes value, run on GET
justify: bool      // right justifies value
vals: object      // look up object for type

```

# Set

```
var a = new Fixer(format);

a.set(section, value)

a.set("first", "hello")
```

# Safe Set
Sets a value but will truncate the value automatically if it exceeds the fields maximum length

```
var a = new Fixer(format);

a.safeSet(section, value)

a.safeSet("first", "hello")
```


# Get

```
var a = new Fixer(format);

a.get(section)

a.set("first", "hello")
a.get("first") -> "hello"
```

# Output

```
var format = {
        length: 5,
        layout: {
            first: [0, 3, {"required": true}],
      		second: [3, 2, {"required": true}]
        }
    };

var a = new Fixer(format);
a.set("first", "hel");
a.set("second", "lo")

a.output() -> "hello"
```

# Setter/Getter Example
```
var format = {
             length: 5,
             initialValue: "",
             layout: {
                 first:  [0, 4, {
                  required: "true",
                  setter: function(val) {
                    var value = "";
                    if (val === "Y") {
                        value = "true";
                        return value;
                    } else {
                        value = "false";
                        return value;
                    }
                  },
                  getter: function(val) {
                    var value = ""
                    if (val === "true") {
                        value = "Y";
                        return value;
                    } else {
                        value = "N";
                        return value;
                    }
                  }
               }]
              }
            }

var a = new Fixer(format);
a.set("first", "Y");
a.get("first") -> "Y"
a.output() -> "true ";
```

# Vals Example
```
var format = {
             length: 12,
             padding: "!",
             initialValue: "   -  -    ",
             layout: {
                 first:  [0, 3, {vals: {"one": "AAA", "two": "BBB", "three": "CCC"}}],
                 second: [4, 2, true],
                 third:  [7, 4, true]
              }
         }

 var a = new Fixer(format);
 a.set("first", "one")
 a.get("first") -> "one"
 a.output() -> "AAA-  -    !"
 ```





