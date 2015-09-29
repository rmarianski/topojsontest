var http = require('http');
var topojson = require('topojson');

// without this the topojson conversion drops all properties
function preserveProperties(feature) {
  return feature.properties;
}

function convertGeojsonToToposjon(geojson) {
  // geojson is expected to be a map of the layers
  // ie what we get back from a geojson response but converted to objects
  var topoData = topojson.topology(geojson, {
    'property-transform': preserveProperties
  });
  return topoData;
}

http.createServer(function(req, res) {

  var geojsonUrl = req.url.replace('.topojson', '.json');

  var proxyReqOptions = {
    protocol: 'http:',
    host: 'vector.mapzen.com',
    port: 80,
    path: geojsonUrl
  };

  var proxyReq = http.request(proxyReqOptions, function(proxyRes) {
    var jsonStr = '';
    proxyRes.on('data', function(chunk) {
      jsonStr += chunk;
    });
    proxyRes.on('end', function() {
      if (proxyRes.statusCode !== 200) {
        res.writeHeader(proxyRes.statusCode, proxyRes.headers);
        res.end(jsonStr);
        return;
      }
      var geojson;
      try {
        geojson = JSON.parse(jsonStr);
      } catch (err) {
        console.log('error parsing json for url: ' + geojsonUrl);
        console.log(jsonStr);
        console.log(err);
        res.writeHead(500, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*'
        });
        res.end('failure parsing geojson');
        return;
      }

      // here's where we convert the geojson to topojson
      var topoData = convertGeojsonToToposjon(geojson);

      // response string
      var topoStr = JSON.stringify(topoData);

      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(topoStr, 'utf8')
      });
      res.end(topoStr);
    });
  });

  proxyReq.on('error', function(err) {
    console.log('proxy request error');
    console.log(err);
  });

  proxyReq.end();

}).listen(8080);

console.log('Listening on 8080');
