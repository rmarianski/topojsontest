Topojson Test
=============

This is meant to be used as a proxy to test topojson rendering.

Usage
-----

```shell
npm install
node index.js
```

Details
-------

The idea here is to proxy to vector.mapzen.com to pull down the corresponding json data, and convert it to topojson using the [topojson npm package](https://www.npmjs.com/package/topojson).

It expects urls in the shape of:

* http://localhost:8080/osm/all/{z}/{x}/{y}.topojson

1. The url path will get replaced from .topojson -> .json.
2. A subrequest will get issued to vector.mapzen.com with the updated url.
3. The geojson response will get converted to topojson.
4. The converted topojson will get sent back as the response.
