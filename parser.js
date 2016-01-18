var template, params, vars = {};

function parse(baseDir, templateFile, templateParametersFile)
{
  // Load the base template
  template = require(baseDir + '/' + templateFile);
  
  // Load the parameters
  params = require(baseDir + '/' + templateParametersFile);
  
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

  // Load the JSON sub-templates into the main object

  var deployments = [], deployment_idx = [];
  for (var r in template.resources) {
    if (template.resources[r].type === 'Microsoft.Resources/deployments') {
      deployments.push(template.resources[r]);
      deployment_idx.push(r);
    }
  }
  
  for (var d in deployments) {
    // TODO: good luck figuring out what this does ;-)
    template.resources.splice.apply(template.resources, 
      [deployment_idx[d], 1].concat(
        process_subtemplate(baseDir, 
          deployments[d].properties.templateLink.uri, 
          deployments[d].properties.parameters)));
  }
  
  return template;
}

/*
** Process variables
*/

function process_variables(t)
{
  var val;
  
  // Pass 1: string variables
  for (var v in t.variables) {
    val = t.variables[v];
    if (typeof val === 'string') {
      val = string_eval(val);
    }
    vars[v] = val;      
  }

  // Pass 2: object variables
  for (var v in t.variables) {
    val = t.variables[v];
    if (typeof val === 'object') {
      val = process_values(val);
      vars[v] = val;      
    }
  }  
}

/*
** Process sub-template
*/

function process_subtemplate(baseDir, fileName, stParameters)
{
  var st = require(baseDir + '/' + fileName);
  var save_params, save_vars;

  // Re-use module-global variables
  save_params = params;
  save_vars = vars;
  params = { parameters: stParameters };
  vars = {};

  process_variables(st);
  process_values(st.resources);

  // Restore global variables
  params = save_params;
  vars = save_vars;

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
*/

function concat()
{
  // TODO: I have a feeling this is a hack...
  return String.prototype.concat.apply('', arguments);
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
  return vars[v];
}

// Return a mock Resource Group object
function resourceGroup()
{
  return { id: 'mockRGId', name: 'mockRGName', location: "mockRGLocation" };
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

exports.parse = parse;
