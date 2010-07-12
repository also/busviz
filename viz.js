var MPH_TO_KPS = 0.00044704;

var SPEED_GRAD_MIN = 10 * MPH_TO_KPS;
var SPEED_GRAD_MAX = 50 * MPH_TO_KPS;

// maximum speed and duration. values above are ignored
var MAX_DURATION = 120;
var MAX_SPEED = 100 * MPH_TO_KPS;

// width of the bus trails
var LINE_WIDTH = 1;

// alpha of the bus trails
var ALPHA = .1;

// alpha of the generational fade
var FADE_ALPHA = 0;

// color of the bus trails. null for speed gradient
var COLOR = null;

var LINE_CAP = null;

var CLOCK_COLOR = '#aaaaaa';

function draw(lines) {
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var min = [-71.3019033935547, 42.209136123873834];
  var max = [-71.0299795654297, 42.504274862292965];
  var lonRange = max[0] - min[0];
  var latRange = max[1] - min[1];
  var xScale = (canvas.width - 20) / lonRange;
  var yScale = (canvas.height - 20) / latRange;
  var scale = Math.min(xScale, yScale);

  function drawLegend() {
    var max = 40;
    ctx.save();
    ctx.translate(20, 20)

    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';

    for (var i = 0; i <= max; i += 10) {
      ctx.fillText(i + ' MPH', 10, 200 / max * i);
    }

    ctx.lineWidth = 4;
    for (var i = 0; i < 50; i += 1) {
      ctx.beginPath();
      ctx.strokeStyle = colorForSpeed((i / 50) * max * MPH_TO_KPS);
      ctx.moveTo(0, 4 * i);
      ctx.lineTo(0, 4 * i + 4);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (!COLOR) {
    drawLegend();
  }

  function drawClock(date) {
    ctx.save();
    ctx.translate(canvas.width - 50, 50);
    var sec = date.getSeconds();
    var min = date.getMinutes();
    var hr  = date.getHours() % 12;

    ctx.globalAlpha = 1;
    ctx.fillStyle = '#000000';
    ctx.strokeStyle = CLOCK_COLOR;
    ctx.lineCap = "round";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2, true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2, true);
    ctx.stroke();

    // draw hour
    ctx.save();
    ctx.rotate(hr * (Math.PI / 6) + (Math.PI / 360) * min + (Math.PI / 21600) * sec - (Math.PI / 2))
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(13, 0);
    ctx.stroke();
    ctx.restore();

    // draw minute
    ctx.save();
    ctx.rotate((Math.PI / 30) * min + (Math.PI / 1800) * sec - (Math.PI / 2));
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(18, 0);
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function parseLine(line) {
    var row = lines[i].split(',');
    var timeOffset = Number(row[0] || 0);
    var vehicleId = row[1];
    var route = row[2] || null;
    var lon = Number(row[3]);
    var lat = Number(row[4]);
    return {vehicleId: vehicleId, timeOffset: timeOffset, route: route, lon: lon, lat: lat};
  }

  function toHex(n) {
    var result = Math.round(n).toString(16);
    if (result.length == 1) {
      result = '0' + result;
    }
    return result;
  }

  function colorForSpeed(speed) {
    if (COLOR) {
      return COLOR;
    }
    var linearPosition = Math.min(Math.max((speed - SPEED_GRAD_MIN), 0) / (SPEED_GRAD_MAX - SPEED_GRAD_MIN), 1);
    var gradientPosition = Math.sqrt(linearPosition);

    var red = toHex(255 - gradientPosition * 255);
    var green = toHex(gradientPosition * 255);
    return '#' + red + green + '00';
  }

  function drawBus(current, previous) {
    if (previous) {
      // some records have the same timestamp but different locations
      var duration = (current.timestamp - previous.timestamp) || 10;
      if (duration > MAX_DURATION) {
        return;
      }

      var distance = haversineDistance(current, previous);
      var speed = distance / duration;
      if (speed > MAX_SPEED) {
        return;
      }

      ctx.strokeStyle = colorForSpeed(speed);
      ctx.globalAlpha = ALPHA;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = LINE_CAP;

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
        if (FADE_ALPHA > 0) {
          ctx.fillStyle = '#000';
          ctx.globalAlpha = FADE_ALPHA;
          ctx.fillRect(0,0,canvas.width, canvas.height);
        }
        groupFirstIndex = i;
        setTimeout(advance, 1);
        currentTimestamp += current.timeOffset;
        drawClock(new Date(currentTimestamp * 1000));
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