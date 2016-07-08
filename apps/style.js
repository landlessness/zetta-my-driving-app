var util = require('util');
var extend = require('node.extend');

var IMAGE_URL_OT_ROOT = 'https://raw.githubusercontent.com/landlessness/zetta-overall-trip-mock-driver/master/example/images/';
var IMAGE_URL_ID_ROOT = 'https://raw.githubusercontent.com/landlessness/zetta-instant-driving-mock-driver/master/example/images/';
var IMAGE_EXTENSION = '.png';

var stateImageForOTDevice = function(device) {
  return IMAGE_URL_OT_ROOT + device.type + '-' + device.state + IMAGE_EXTENSION;
}

var stateImageForIDDevice = function(device) {
  return IMAGE_URL_ID_ROOT + device.type + '-' + device.state + IMAGE_EXTENSION;
}

module.exports = function(server) {
  // TODO: swap with server.ql and text
  var OverallTripQuery = server.where({type: 'overall-trip'});
  server.observe([OverallTripQuery], function(OverallTrip) {
    OverallTrip.style = extend(true, OverallTrip.style, {properties: {}});
    OverallTrip.style.properties = extend(true, OverallTrip.style.properties, {
      drivingConditionsRisk: {
        display: 'billboard'
      }
    });
    var states = Object.keys(OverallTrip._allowed);
    for (i = 0; i < states.length; i++) {
      OverallTrip._allowed[states[i]].push('_update-state-image');
    }
    OverallTrip._transitions['_update-state-image'] = {
      handler: function(imageURL, tintMode, foregroundColor, cb) {
        if (tintMode !== 'template') {
          tintMode = 'original';
        }
        OverallTrip.style.properties = extend(true, OverallTrip.style.properties, {
          stateImage: {
            url: imageURL,
            tintMode: tintMode
          }
        });
        if (foregroundColor) {
          OverallTrip.style.properties.stateImage.foregroundColor = foregroundColor;
        }
        cb();
      },
      fields: [
        {name: 'imageURL', type: 'text'},
        {name: 'tintMode', type: 'text'},
        {name: 'foregroundColor', type: 'text'}
      ]
    };
    OverallTrip.call('_update-state-image', stateImageForOTDevice(OverallTrip), 'original', null);
    var stateStream = OverallTrip.createReadStream('state');
    stateStream.on('data', function(newState) {
      OverallTrip.call('_update-state-image', stateImageForOTDevice(OverallTrip), 'original', null);
    });
    OverallTrip.style.actions = extend(true, OverallTrip.style.actions, {'_update-state-image': {display: 'none'}});
    OverallTrip.style.actions = extend(true, OverallTrip.style.actions, {
      'make-driving-behavior-risk-low': {display: 'none'},
      'make-driving-behavior-risk-moderate': {display: 'none'},
      'make-driving-behavior-risk-high': {display: 'none'}
    });
    
  });

  var InstantDrivingQuery = server.where({type: 'instant-driving'});
  server.observe([InstantDrivingQuery], function(InstantDriving) {
    InstantDriving.style = extend(true, InstantDriving.style, {properties: {}});
    InstantDriving.style.properties = extend(true, InstantDriving.style.properties, {
      drivingConditionsRisk: {
        display: 'billboard'
      }
    });
    var states = Object.keys(InstantDriving._allowed);
    for (i = 0; i < states.length; i++) {
      InstantDriving._allowed[states[i]].push('_update-state-image');
    }
    InstantDriving._transitions['_update-state-image'] = {
      handler: function(imageURL, tintMode, foregroundColor, cb) {
        if (tintMode !== 'template') {
          tintMode = 'original';
        }
        InstantDriving.style.properties = extend(true, InstantDriving.style.properties, {
          stateImage: {
            url: imageURL,
            tintMode: tintMode
          }
        });
        if (foregroundColor) {
          InstantDriving.style.properties.stateImage.foregroundColor = foregroundColor;
        }
        cb();
      },
      fields: [
        {name: 'imageURL', type: 'text'},
        {name: 'tintMode', type: 'text'},
        {name: 'foregroundColor', type: 'text'}
      ]
    };
    InstantDriving.call('_update-state-image', stateImageForIDDevice(InstantDriving), 'original', null);
    var stateStream = InstantDriving.createReadStream('state');
    stateStream.on('data', function(newState) {
      InstantDriving.call('_update-state-image', stateImageForIDDevice(InstantDriving), 'original', null);
    });
    InstantDriving.style.actions = extend(true, InstantDriving.style.actions, {'_update-state-image': {display: 'none'}});
    InstantDriving.style.actions = extend(true, InstantDriving.style.actions, {
      'make-driving-behavior-risk-low': {display: 'none'},
      'make-driving-behavior-risk-moderate': {display: 'none'},
      'make-driving-behavior-risk-high': {display: 'none'}
    });
  });



}