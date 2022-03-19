var races = [];
var history = {};

async function update(e) {
  let f = e.target.files[0];
  await read(f);
  for (let n = 0; n < 1000; n++) {
    let i = Math.floor(Math.random() * races.length);
    batch_update(scores, races[i]);
    Object.keys(scores).forEach(function(name) {
      if (!history.hasOwnProperty(name)) {
        history[name] = [];
      }
      history[name].push(scores[name]);
    });
  }
  drawTable();
  drawGraph();
}

async function read(file) {
  let text = await file.text();
  let race = {};
  let lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line == "") {
      continue;
    }
    let info = line.split(",");
    let name = info[0];
    let team = info[1];
    let time = info[2];
    let timeArray = time.split(":");
    let timeSeconds = 0.0;
    for (let i = 0; i < timeArray.length; i++) {
      timeSeconds *= 60.0;
      timeSeconds += parseFloat(timeArray[i]);
    }
    if (!isNaN(timeSeconds)) {
      race[name] = timeSeconds;
    }
  }
  races.push(race);
}

let upload = document.getElementById("upload");
upload.addEventListener('change', update);

function gradient(scores, times) {
  // Gradient of the error function
  // sum (ln(s1/s2) - ln(t1/t2))^2
  let grad = [];
  for (let i = 0; i < scores.length; i++) {
    let g = 0;
    for (let j = 0; j < scores.length; j++) {
      g += Math.log(scores[i] / scores[j]) - Math.log(times[i] / times[j]);
    }
    grad.push(g / scores[i]);
  }
  return grad;
}

var sigma = 100;

function bayesian(scores) {
  // Pushes towards the center of the Rayeleigh distribution
  // x / sigma * e^(-x**2 / sigma / 2)
  let grad = [];
  for (let i = 0; i < scores.length; i++) {
    let s = scores[i];
    grad.push(1 / sigma - (s / sigma) ** 2) * Math.exp(-s * s / sigma / 2);
  }
  return grad;
}

function batch_update(scores, race, alpha = 0.01, beta = 0.01) {
  let score_batch = [];
  let time_batch = [];
  Object.keys(race).forEach(function(key) {
    time_batch.push(race[key]);
    if (!scores.hasOwnProperty(key)) {
      scores[key] = Math.sqrt(sigma);
    }
    score_batch.push(scores[key]);
  });

  grad1 = gradient(score_batch, time_batch);
  grad2 = bayesian(score_batch);
  Object.keys(race).forEach(function(key, i) {
    scores[key] += -alpha * grad1[i] + beta * grad2[i];
  });
}


scores = {};
google.charts.load('current', { 'packages': ['table', 'corechart', 'line'] });
google.charts.setOnLoadCallback(drawTable);

function drawTable() {
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'Name');
  data.addColumn('number', 'Score');
  let array = Object.keys(scores).map((name) => [name, scores[name]]);
  data.addRows(array);
  data.sort([{ column: 1, desc: false }]);

  var table = new google.visualization.Table(document.getElementById('table_div'));
  table.draw(data, { showRowNumber: true, width: '100%', height: '100%' });
}

function drawGraph() {
  var data = new google.visualization.DataTable();
  var players = [];
  let names = Object.keys(scores);
  let n = names.length;
  data.addColumn('number', 'Batch #')
  for (let i = 0; i < 4; i++) {
    data.addColumn('number', 'Runner ' + i);
    players.push(names[Math.floor(Math.random() * n)])
  }

  for (let i = -1000; i < 0; i++) {
    let row = [i + 1000];
    for (let j = 0; j < 4; j++) {
      let l = history[names[j]];
      row.push(l[i + l.length]);
    }
    data.addRow(row);
  }

  var options = {
    legend: { position: 'none' },
    hAxis: {
      title: 'Batch #',
    },
    vAxis: {
      title: 'Score',
    },
  };

  var chart = new google.visualization.LineChart(document.getElementById('line_chart'));
  chart.draw(data, options);
}

var switcher = document.getElementById("switcher");
switcher.addEventListener("click", function() {
  if (document.getElementById('table_div').style.display != "none") {
    document.getElementById('table_div').style.display = "none";
    document.getElementById('score_graph').style.display = "block";
    drawGraph();
  } else {
    document.getElementById('table_div').style.display = "block";
    document.getElementById('score_graph').style.display = "none";
    drawTable();
  }
  console.log(document.getElementById('table_div').style.display);
});