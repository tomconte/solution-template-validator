/* global describe, it */

/*
** Validate a Solution Template
** https://github.com/azure/azure-marketplace
*/

var should = require('should');
var parser = require('./parser');

var template = parser.parse('../PrestaShop/azure-quickstart-templates/prestashop', 'mainTemplate.json', 'mainTemplate.parameters.json');

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

  describe('location parameter', function() {
    
    it('should exist', function() {
      template.parameters.should.have.property('location');
    });

    it('should not include allowedValues', function() {
      template.parameters.location.should.not.have.property('allowedValues');
    });

    it('should not include defaultValue', function() {
      template.parameters.location.should.not.have.property('defaultValue');
    });

  });

  describe('Virtual Machines', function() {

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
    it('MUST be either be the latest version or have a date within 12 months of publishing', function() {
      for (var res in template.resources) {
        template.resources[res].apiVersion.should.equal('2015-06-15');
      }
    });

  });
  
  describe('Linux Virtual Machines', function() {
    
    it('must support SSH keys', function() {
      for (var res in template.resources) {
        if (template.resources[res].type === 'Microsoft.Compute/virtualMachines') {
          // TODO: how do you know this is a Linux VM?
          template.resources[res].properties.osProfile.should.have.property('linuxConfiguration');
        }
      }
    });
    
  });
  
});
