var MPH_TO_KPS = 0.44704;

var MIN_ALPHA = 0.05;
var ALPHA_DUR_MIN = 10;
var ALPHA_DUR_MAX = 30;
var SPEED_GRAD_MIN = 0 * MPH_TO_KPS;
var SPEED_GRAD_MAX = 10 * MPH_TO_KPS;
var slow = 0;

function draw(lines) {
  var canvas = document.getElementById('canvas');
  canvas.width = document.width;
  canvas.height = document.height;
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var min = [-71.19019033935547, 42.309136123873834];
  var max = [-70.94299795654297, 42.404274862292965];
  var lonRange = max[0] - min[0];
  var latRange = max[1] - min[1];
  var xScale = (canvas.width - 20) / lonRange;
  var yScale = (canvas.height - 20) / latRange;
  var scale = Math.min(xScale, yScale);
  ctx.translate(10, 10);

  function parseLine(line) {
    var row = lines[i].split(',');
    var timeOffset = Number(row[0] || 0);
    var vehicleId = row[1];
    var route = row[2] || null;
    var lon = Number(row[3]);
    var lat = Number(row[4]);
    return {vehicleId: vehicleId, timeOffset: timeOffset, route: route, lon: lon, lat: lat};
  }

  function drawBus(current, previous) {
    if (previous) {
      // some records have the same timestamp but different durations
      var duration = (current.timestamp - previous.timestamp) || 10;
      var opacity = .1;//Math.max(1 - (duration - ALPHA_DUR_MIN) / ALPHA_DUR_MAX, MIN_ALPHA);

      // var distance = haversineDistance(current, previous);
      //       var speed = distance / duration;
      //       var gradientPosition = Math.max(Math.log(Math.min((speed - SPEED_GRAD_MIN) / (SPEED_GRAD_MAX - SPEED_GRAD_MIN), 1)) + 3, 0) / 3;
      //       console.log(distance);
      //
      //       function toHex(n) {
      //         var result = Math.round(n).toString(16);
      //         if (result.length == 1) {
      //           result = '0' + result;
      //         }
      //         return result;
      //       }
      //
      //       var red = toHex(255 - gradientPosition * 255);
      //       var green = toHex(gradientPosition * 255);
      // ctx.strokeStyle = '#' + red + green + '00';

      ctx.strokeStyle = '#ffffff';
      ctx.globalAlpha = opacity;

      ctx.beginPath();
      ctx.moveTo((previous.lon - min[0]) * scale, canvas.height - Mercator.lat2y(previous.lat - min[1]) * scale);
      ctx.lineTo((current.lon - min[0]) * scale, canvas.height - Mercator.lat2y(current.lat - min[1]) * scale);
      ctx.stroke();
    }
  }

  var buses = {};

  var currentTimestamp = 0;
  var groupFirstIndex = -1;

  var i = 0;

  function advance() {
    while (i < lines.length) {
      var current = parseLine(lines[i]);
      if (current.timeOffset != 0 && i != groupFirstIndex) {
        ctx.strokeStyle = '#ffffff';
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 10);
        ctx.lineTo(((currentTimestamp - 1276574400) / (1276660800 - 1276574400)) * canvas.width, canvas.height - 10);
        ctx.stroke();
        groupFirstIndex = i;
        setTimeout(advance, 1);
        currentTimestamp += current.timeOffset;
        return;
      }
      current.timestamp = currentTimestamp;
      var previous = buses[current.vehicleId];
      drawBus(current, previous);
      buses[current.vehicleId] = current;
      i++;
    }
  }

  advance();
}