/*
** Validate a Solution Template
** https://github.com/azure/azure-marketplace
*/

var should = require('should');
var parser = require('./parser');

var template = parser.parse('../base-solution-template', 'mainTemplate.json', 'mainTemplate.parameters.json');

describe('Template', function() {

  describe('vmSize parameter', function() {

    // TODO: this parameter could be named anything...

    it.skip('should exist', function() {
      template.parameters.should.have.property('vmSize');
    });

    it.skip('should not include allowedValues', function() {
      template.parameters.vmSize.should.not.have.property('allowedValues');
    });

  });

  describe('Location parameter', function() {

    it('should not include allowedValues', function() {
      template.parameters.location.should.not.have.property('allowedValues');
    });

    it('should not include defaultValue', function() {
      template.parameters.location.should.not.have.property('defaultValue');
    });

  });

  describe('Microsoft.Compute/virtualMachines', function() {

    it('must use imageReference', function() {
      for (var res in template.resources) {
        if (template.resources[res].type === 'Microsoft.Compute/virtualMachines') {
          template.resources[res].properties.storageProfile.should.have.property('imageReference');
        }
      }
    });

    it('must use latest imageReference', function() {
      for (var res in template.resources) {
        if (template.resources[res].type === 'Microsoft.Compute/virtualMachines') {
          template.resources[res].properties.storageProfile.imageReference.version.should.equal("latest");
        }
      }
    });

  });

  describe('apiVersion', function() {

    // TODO: How do you know the apiVersion is "the latest"??
    it.skip('MUST be either be the latest version or have a date within 12 months of publishing', function() {
      for (var res in template.resources) {
        //console.log(template.resources[res].apiVersion);
      }
    });

  });
});
