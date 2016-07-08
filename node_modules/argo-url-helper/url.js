var path = require('path');
var url = require('url');

module.exports =function(opts) {
  var useXForwardedHostHeader = false;
  if(opts && typeof opts.useXForwardedHostHeader !== 'undefined') {
    useXForwardedHostHeader = opts.useXForwardedHostHeader;
  }
  return function(handle) {
    handle('request', function(env, next) {
      env.helpers = env.helpers || {};
      env.helpers.url = {};

      var uri = parseUri(env);

      
      env.helpers.url.join = function(pathname, opts) {
        var tmpUri = uri;
        if(opts) {
          tmpUri =  parseUri(env, opts) 
        }
        var parsed = url.parse(tmpUri);
        parsed.search = null;
        parsed.pathname = path.join(parsed.pathname, pathname).replace(/\\/g, '/');
        
        return url.format(parsed);
      };

      env.helpers.url.path = function(pathname, opts) {
        var tmpUri = uri;
        if(opts) {
          tmpUri =  parseUri(env, opts) 
        }         
        var parsed = url.parse(tmpUri);
        parsed.search = null;
        parsed.pathname = pathname;

        return url.format(parsed);
      };

      env.helpers.url.current = function(opts) {
        if(opts) {
          return parseUri(env, opts) 
        } else {
          return uri;
        }
      };

      next(env);
    });
  };

  function parseUri(env, opts) {
    var xfp = env.request.headers['x-forwarded-proto'];
    var xfh = env.request.headers['x-forwarded-host'];
    var useXfh = useXForwardedHostHeader;
    if(opts && typeof opts.useXForwardedHostHeader !== 'undefined') {
      useXfh = opts.useXForwardedHostHeader; 
    }
    
    var protocol;

    if (xfp && xfp.length) {
      protocol = xfp.replace(/\s*/, '').split(',')[0];
    } else {
      protocol = env.request.connection.encrypted ? 'https' : 'http';
    }

    var host = env.request.headers['host'];

    if(useXfh && xfh) {
      host = xfh;
    }

    if (!host) {
      var address = env.request.connection.address();
      host = address.address;
      if (address.port) {
        if (!(protocol === 'https' && address.port === 443) && 
            !(protocol === 'http' && address.port === 80)) {
          host += ':' + address.port
        }
      }
    }

    return protocol + '://' + path.join(host, env.request.url);
  }
} 
