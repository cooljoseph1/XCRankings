function gradient(scores, times) {
  // Gradient of the error function
  // sum (ln(s1/s2) - ln(t1/t2))^2
  let grad = [];
  for (let i = 0; i < scores.length; i++) {
    let g = 0;
    for (let j = 0; j < scores.length; j++) {
      g += (Math.log(scores[i] / scores[j]) - Math.log(times[i] / times[j])) ** 2
    }
    grad.push(g / scores[i]);
  }
  return grad;
}

function bayesian(scores) {
  // Pushes towards the center of the Rayeleigh distribution
  // x/4 * e^(-x**2/8)
  let grad = [];
  for (let i = 0; i < scores.length; i++) {
    let s = scores[i];
    grad.push(1 / 4 - s / 16) * Math.exp(-s ** 2 / 8)
  }
}

function batch_update(scores, race, alpha = 0.1, beta = 0.1) {
  let score_batch = [];
  let time_batch = [];
  Object.keys(race).forEach(function(key) {
    time_batch.push(race[key]);
    if (!scores.has(key)) {
      scores[key] = 2;
    }
    score_batch.push(scores[key]);
  });

  grad1 = gradient(score_batch, time_batch);
  grad2 = bayesian(score_batch);
  Object.keys(race).forEach(function(key, i) {
    scores[key] += -alpha * grad1[i] + beta * grad2[i];
  });
}

export batch_update;