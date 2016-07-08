var zetta = require('zetta');
var OverallTrip = require('zetta-overall-trip-mock-driver');
var InstantDriving = require('zetta-instant-driving-mock-driver');
var style = require('./apps/style');
var argv = require('minimist')(process.argv.slice(2));

var increment = argv['i'];

zetta()
  .name('My Driving App')
  .use(OverallTrip, {increment: increment})
  .use(InstantDriving, {increment: increment})
  .use(style)
  .link('http://dev.zettaapi.org')
  .listen(1337);
