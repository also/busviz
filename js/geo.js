var Mercator = {
  y2lat: function y2lat(a) { return 180/Math.PI * (2 * Math.atan(Math.exp(a*Math.PI/180)) - Math.PI/2); },
  lat2y: function lat2y(a) { return 180/Math.PI * Math.log(Math.tan(Math.PI/4+a*(Math.PI/180)/2)); }
};

var PI_RAD = Math.PI / 180;
// calculate the distance between two points (in kilometers)
function haversineDistance(a, b) {
  var R = 6371; // km
  var dLat = (b.lat-a.lat) * PI_RAD;
  var dLon = (b.lon-a.lon) * PI_RAD;
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.cos(a.lat * PI_RAD) * Math.cos(b.lat * PI_RAD) *
          Math.sin(dLon/2) * Math.sin(dLon/2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}