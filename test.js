/*
** https://github.com/azure/azure-marketplace
*/

var assert = require('assert');
var parser = require('./parser');

var template = parser.parse();

describe('Template', function() {

  describe('vmSize parameter', function() {

    it('should not include allowedValues', function() {
      assert.equal([], template.parameters.vmSize.allowedValues);
    });

  });

  describe('Location parameter', function() {

    it('should not include allowedValues', function() {
      assert.equal(undefined, template.parameters.location.allowedValues);
    });

    it('should not include default value', function() {
      assert.equal(undefined, template.parameters.location.defaultValue);
    });

  });

  describe('Microsoft.Compute/virtualMachines', function() {

    it('must use imageReference', function() {
      for (var res in template.resources) {
        if (template.resources[res].type === 'Microsoft.Compute/virtualMachines') {
          assert.notEqual(undefined, template.resources[res].properties.storageProfile.imageReference);
        }
      }
    });

    it('must use latest imageReference', function() {
      for (var res in template.resources) {
        if (template.resources[res].type === 'Microsoft.Compute/virtualMachines') {
          assert.equal("latest", template.resources[res].properties.storageProfile.imageReference.version);
        }
      }
    });

  });

  describe('apiVersion', function() {

    // How do you know the apiVersion is "the latest"??
    it('MUST be either be the latest version or have a date within 12 months of publishing', function() {
      for (var res in template.resources) {
        //console.log(template.resources[res].apiVersion);
      }
    });

  });
});
