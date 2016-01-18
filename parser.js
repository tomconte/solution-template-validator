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
  var val;
  
  // Process the variables
  for (var v in template.variables) {
    val = template.variables[v];
    
    // Need to handle some special cases
    if (v === 'templateBaseUrl') {
      vars[v] = '';
      continue;
    }
    
    if (typeof val === 'string') {
      val = string_eval(val);
    }
    vars[v] = val;      
    //console.log(v + '=' + val);
  }

  // Load the JSON sub-templates into the main object
  for (var r in template.resources) {
    if (template.resources[r].type === 'Microsoft.Resources/deployments') {
      val = string_eval(template.resources[r].properties.templateLink.uri);
      // TODO: good luck figuring out what this does ;-)
      template.resources.splice.apply(template.resources, 
        [r, 1].concat(require(baseDir + '/' + val).resources));
    }
  }
  
  // Process all the value strings
  process_values(template.resources);
  
  //console.log(JSON.stringify(template));
  
  return template;
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
}

/*
** Evaluate a value string e.g. return plain string or execute [] expressions
*/

function string_eval(str)
{
  if (str.charAt(0) === '[') {
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

exports.parse = parse;
