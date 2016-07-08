var util = require('util');
var extend = require('node.extend');

var IMAGE_URL_ROOT = 'https://raw.githubusercontent.com/landlessness/zetta-instant-driving-mock-driver/master/example/images/';
var IMAGE_EXTENSION = '.png';

var stateImageForDevice = function(device) {
  return IMAGE_URL_ROOT + device.type + '-' + device.state + IMAGE_EXTENSION;
}

module.exports = function(server) {
  // TODO: swap with server.ql and text
  var InstantDrivingQuery = server.where({type: 'instant-driving'});
  server.observe([InstantDrivingQuery], function(InstantDriving) {
    InstantDriving.style = extend(true, InstantDriving.style, {properties: {}});
    InstantDriving.style.properties = extend(true, InstantDriving.style.properties, {
      vehicleSpeed: {
        display: 'billboard',
        significantDigits: 1,
        symbol: 'km/h'
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
    InstantDriving.call('_update-state-image', stateImageForDevice(InstantDriving), 'original', null);
    var stateStream = InstantDriving.createReadStream('state');
    stateStream.on('data', function(newState) {
      InstantDriving.call('_update-state-image', stateImageForDevice(InstantDriving), 'original', null);
    });
    InstantDriving.style.actions = extend(true, InstantDriving.style.actions, {'_update-state-image': {display: 'none'}});
  });
}