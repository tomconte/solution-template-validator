# Azure Marketplace Solution Template parser / validator

Use Mocha to run the test:

```
$ npm install -g mocha
$ mocha
```

Edit `test.js` to change the template to test:

```
var template = parser.parse('../base-solution-template', 'mainTemplate.json', 'mainTemplate.parameters.json');
```

The parser will perform the following:

- Evaluate all variables
- Evaluate all expressions in the template
- Load all sub-templates, evaluate them, and merge them
