var MPH_TO_KPS = 0.00044704;

// maximum speed and duration. values above are ignored
var MAX_DURATION = 120;
var MAX_SPEED = 100 * MPH_TO_KPS;

var settings = {};

function LineIterator(data) {
  var offset = 0;
  this.hasNext = function hasNext() {
    return offset < data.length;
  };
  this.next = function next() {
    var end = data.indexOf('\n', offset);
    if (end == -1) {
      end == data.length;
    }
    var result = data.substring(offset, end);
    offset = end + 1;
    return result;
  };
}

function Player(data) {
  var iterator = new LineIterator(data);
  var stopped = false;
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  ctx.globalAlpha = 1;
  ctx.fillStyle = settings.background_color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  var min = [-71.3019033935547, 42.209136123873834];
  var max = [-71.0299795654297, 42.504274862292965];
  var lonRange = max[0] - min[0];
  var latRange = max[1] - min[1];
  var xScale = (canvas.width - 20) / lonRange;
  var yScale = (canvas.height - 20) / latRange;
  var scale = Math.min(xScale, yScale);

  this.stop = function stop() {
    stopped = true;
  }

  function drawLegend() {
    var max = 40;
    ctx.save();
    ctx.translate(20, 20)

    ctx.textBaseline = 'middle';
    ctx.fillStyle = settings.legend_color;

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

  if (!settings.color && settings.show_legend) {
    drawLegend();
  }

  function drawClock(date) {
    ctx.save();
    ctx.translate(canvas.width - 50, 50);
    var sec = date.getSeconds();
    var min = date.getMinutes();
    var hr  = date.getHours() % 12;

    ctx.globalAlpha = 1;
    ctx.fillStyle = settings.background_color;
    ctx.strokeStyle = settings.clock_color;
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
    var row = line.split(',');
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
    if (settings.color) {
      return settings.color;
    }
    var linearPosition = Math.min(Math.max((speed - settings.speed_gradient_min), 0) / (settings.speed_gradient_max - settings.speed_gradient_min), 1);
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
      ctx.globalAlpha = settings.alpha;
      ctx.lineWidth = settings.line_width;
      ctx.lineCap = settings.line_cap;

      ctx.beginPath();
      ctx.moveTo((previous.lon - min[0]) * scale, canvas.height - Mercator.lat2y(previous.lat - min[1]) * scale);
      ctx.lineTo((current.lon - min[0]) * scale, canvas.height - Mercator.lat2y(current.lat - min[1]) * scale);
      ctx.stroke();
    }
  }

  var buses = {};

  var currentTimestamp = 0;
  var firstRowInFrame = false;
  var current;

  function advance() {
    if (stopped) {
      return;
    }

    if (settings.fade_alpha > 0) {
      ctx.fillStyle = settings.background_color;
      ctx.globalAlpha = settings.fade_alpha;
      ctx.fillRect(0,0,canvas.width, canvas.height);
    }

    while (firstRowInFrame || iterator.hasNext()) {
      if (!firstRowInFrame) {
        current = parseLine(iterator.next());
        if (current.timeOffset != 0) {
          firstRowInFrame = true;
          setTimeout(advance, 1);
          currentTimestamp += current.timeOffset;
          drawClock(new Date(currentTimestamp * 1000));
          return;
        }
      }
      firstRowInFrame = false;
      // draw the current row
      current.timestamp = currentTimestamp;
      var previous = buses[current.vehicleId];
      drawBus(current, previous);
      buses[current.vehicleId] = current;
    }
  }

  this.start = function start() {
    stopped = false;
    advance();
  };
}