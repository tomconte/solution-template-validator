var template, params;

function parse(baseDir, templateFile, templateParametersFile)
{
  // Load the base template
  template = require(baseDir + '/' + templateFile);
  
  // Load the parameters
  params = require(baseDir + '/' + templateParametersFile);
  
  // Assign the default values
  process_params(template.parameters);
  
  // Mock the base URL; assumes the property is named "templateBaseUrl"
  params.parameters.templateBaseUrl = { value: '' };

  return process_template(baseDir);
}

/*
** Process the template
*/

function process_template(baseDir)
{
  // Process variables
  process_variables(template);

  // Process all the value strings in the main template
  process_values(template.resources);

  // Process the resources array

  var sub_resources, new_resources = [];
  for (var r in template.resources) {
    if (template.resources[r].type === 'Microsoft.Resources/deployments') {
      // Load & merge sub-template
      sub_resources = process_subtemplate(baseDir, 
        template.resources[r].properties.templateLink.uri, 
        template.resources[r].properties.parameters);
      for (var i=0; i < sub_resources.length; i++) {
        new_resources.push(sub_resources[i]);
      }
    } else {
      new_resources.push(template.resources[r]);
    }
  }

  template.resources = new_resources;
  
  return template;
}

/*
** Process parameters
*/

function process_params(template_params)
{
  for (var p in template_params) {
    if (template_params[p].defaultValue && !params.parameters[p]) {
      params.parameters[p] = { value: template_params[p].defaultValue };
    }
  }
}

/*
** Process variables
*/

function process_variables(t)
{
  var val;
  
  for (var v in t.variables) {
    val = t.variables[v];
    if (typeof val === 'string') {
      val = string_eval(val);
    } else if (typeof val === 'object') {
      val = process_values(val);
    }
    t.variables[v] = val;      
  }
}

/*
** Process sub-template
*/

function process_subtemplate(baseDir, fileName, stParameters)
{
  var st = require(baseDir + '/' + fileName);
  var save_template, save_params;

  // Point to new template / parameters
  save_params = params;
  save_template = template;
  params = { parameters: stParameters };
  template = st;

  process_params(st.parameters);
  process_variables(st);
  process_values(st.resources);

  // Restore global variables
  params = save_params;
  template = save_template;

  return st.resources;
}

/*
** Recursively walk the object graph and process all string properties
*/

function process_values(o)
{
  for (var p in o) {
    if (typeof o[p] === 'string') {
      o[p] = string_eval(o[p]);
    } else {
      process_values(o[p]);
    }
  }
  
  return o;
}

/*
** Evaluate a value string e.g. return plain string or execute [] expressions
*/

function string_eval(str)
{
  if (typeof str === 'string' && str.charAt(0) === '[') {
    return eval(str.substring(1, str.length-1));
  } else {
    return str;
  }
}

/*
** Functions below will be called by eval() to interpret [] values
** TODO: implement all documented ARM functions
** https://azure.microsoft.com/en-gb/documentation/articles/resource-group-template-functions/
*/

function concat()
{
  // TODO: I have a feeling this is a hack...
  return String.prototype.concat.apply('', arguments);
}

function add(op1, op2)
{
  return op1 + op2;
}

function sub(op1, op2)
{
  return op1 - op2;
}

function mod(op1, op2)
{
  return op1 % op2;
}

function div(op1, op2)
{
  return op1 / op2;
}

function string(op)
{
  return "" + op;
}

function resourceId(type, name)
{
  // TODO: handle all possible arguments
  return type + '/' + name;
}

function parameters(p)
{
  if (params.parameters[p])
    return params.parameters[p].value;
  else
    console.log('ERROR undefined: ' + p);
}

function variables(v)
{
  if (v === 'templateBaseUrl') return "";
  return template.variables[v];
}

// Return a mock Resource Group object
function resourceGroup()
{
  return { id: 'mockRGId', name: 'mockRGName', location: "mockRGLocation" };
}

// Return a mock Deployment object
// TODO: the Deployment object has more properties
function deployment()
{
  return { name: 'mockDeploymentName' };
}

// Mock index
function copyIndex()
{
  return 1;
}

// Mock index... in lowercase
function copyindex()
{
  return 1;
}

// Mock uniqueString
function uniqueString()
{
  return "MOCK_UNIQUE_STRING";
}

// Mock uniqueString... in lowercase
function uniquestring()
{
  return "MOCK_UNIQUE_STRING";
}

// Mock subscription
function subscription()
{
  return { id: "MOCK_SUB_ID", subscriptionId: "MOCK_SUB_ID" };
}

// split
function split(inputString, delimiter)
{
  return String.prototype.split.apply(inputString, [ delimiter ]);
}

// int
function int(valueToConvert) {
  return parseInt(valueToConvert);
}

// Mock reference
function reference(resource) {
  return "MOCK_REFERENCE";
}

// substring
function substring(str, start, end)
{
  return String.prototype.substring.apply(str, [start, end]);
}

exports.parse = parse;
