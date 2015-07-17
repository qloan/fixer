# fixer

Utility functions for fixed format data.

# Installation

```
npm install fixer
```

# Basic Usage
```
  Format: {
      length: 12,       required field describing the total length the fixed format data is
      padding: "!",    character the output string will be padded with
      initialValue: "   -  -    ",  initial value the string will be initialized to
      layout: {
          first:  [0, 3, true],
          second: [4, 2, true],
          third:  [7, 4, true]
       }
  }
  var a = new Fixer(format);
  a.set("first", 111);
  a.set("second", "22");
  a.set("third', "6789");
  a.output() -> "111-22-6789!"
  ```



