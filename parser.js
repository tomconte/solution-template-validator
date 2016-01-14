var template, params, vars = {};

function parse(string)
{
  // Load the base template
  template = require('../base-solution-template/mainTemplate.json');
  
  // Load the parameters
  params = require('../base-solution-template/mainTemplate.parameters.json');
  
  // Fake the base URL; assumes the property is named "templateBaseUrl"
  params.parameters.templateBaseUrl = { value: '.' };
  
  // Process the variables
  var val;
  for (var v in template.variables) {
    val = template.variables[v];
    if (typeof val === 'string') {
      val = string_eval(val);
    }
    vars[v] = val;      
    console.log(v + '=' + val);
  }

  // Load the sub-templates into the main object

  // Process all the value strings: walk the object graph and process all properties
  
  return template;
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

exports.parse = parse;
