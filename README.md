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

required: bool // whether or not the section is required
type: string // type of value, defaults to string
default: string // default value
setter: function // function that takes value, run on SET
getter: function // function that takes value, run on GET
justify: bool // right justifies value
vals: object // look up object for type

```


     


