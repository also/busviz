
function draw(lines) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

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
      var duration = current.timestamp - previous.timestamp;
      var opacity = Math.max(1 - (duration - 10) / 30, .1);
      ctx.globalAlpha = opacity;
      ctx.strokeStyle = '#000000';
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