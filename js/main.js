var data;
var player;
var settingsChanged = false;
function restart() {
  player.stop();
  player = new Player(data);
  player.start();
}

function load() {
  updateSettings(presets.base);
  // FIXME
  if (navigator.userAgent.indexOf('Version/5.') != -1) {
    $('body').addClass('enable3d');
  }

  $('input, select').bind('change', function () {
    var setting = this.id.substring(9);
    settings[setting] = $(this).val();
    settingsChanged = true;
  });

  var interval;
  $.ajax({
    type: 'GET',
    url: '15th.csv',
    success: function (data) {
      window.data = data;
      drawProgress(1);
      clearInterval(interval);
      player = new Player(data);
      setTimeout(function () {
        player.start();
      }, 1000);
    },
    beforeSend: function (xhr) {
      interval = setInterval(function () {
        if (xhr.readyState > 2) {
          var totalBytes = xhr.getResponseHeader('Content-length');
          var dlBytes = xhr.responseText.length;
          drawProgress(dlBytes / totalBytes);
        }
      }, 200);
    }
  });

  var flipped = false;
  $(document).ready(function () {
    $('.front').bind('click', function () {
      $('#viz').addClass('flipped');
    });
    $('#done').bind('click', function () {
      hideSettings();
      if (settingsChanged) {
        settingsChanged = false;
        restart();
      }
    });
    $('#presets li').bind('click', function () {
      updateSettings(presets[this.id]);
      hideSettings();
      restart();
    })
  });

  function hideSettings() {
    $('#viz').removeClass('flipped');
  }
}

function updateSettings(newSettings) {
  for (var k in newSettings) {
    var v = newSettings[k];
    $('#settings_' + k).val(v);
    settings[k] = v;
  }
}

function drawProgress(progress) {
  var canvas = $('#canvas').get(0);
  var ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width - 50, 50);
  ctx.rotate(3 * Math.PI / 2);
  ctx.strokeStyle = '#aaa';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (progress != 1) {
    ctx.moveTo(0, 0);
  }
  ctx.arc(0, 0, 25, 0, Math.PI * 2 * progress, false);
  if (progress != 1) {
    ctx.lineTo(0, 0);
  }
  ctx.stroke();
  ctx.restore();
}

load();