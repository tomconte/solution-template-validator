var template, params, vars = {};

function parse()
{
  // Load the base template
  template = require('../base-solution-template/mainTemplate.json');
  
  // Load the parameters
  params = require('../base-solution-template/mainTemplate.parameters.json');
  
  // Fake the base URL; assumes the property is named "templateBaseUrl"
  params.parameters.templateBaseUrl = { value: '.' };

  return process_template();
}

/*
** Process the template
*/

function process_template()
{
  var val;
  
  // Process the variables
  for (var v in template.variables) {
    val = template.variables[v];
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
        [r, 1].concat(require('../base-solution-template/' + val).resources));
    }
  }
  
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
