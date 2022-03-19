import numpy as np
"""
race should be formatted as follows:
{ "name1": time1,
  "name2": time2,
  ...
  }
"""
def error(scores, times):
    errors = []
    for s, t in zip(scores, times):
        errors.append((np.log(s/scores) - np.log(t/times))**2)
    return np.sum(errors)

def gradient(scores, times):
    g = []
    for s, t in zip(scores, times):
        g.append(np.sum((np.log(s/scores) - np.log(t/times)))/s)
    return np.array(g)

def bayesian(scores):
    # Rayleigh distribution.
    g = scores / 4 * np.exp(-scores**2 / 8)
    return g

def bayesian_gradient(scores):
    return (1/4 - scores**2 / 16) * np.exp(-scores**2 / 8)

def update(scores, race, alpha=0.1, beta=0.1):
    ss, ts = [], []
    for name, time in race.items():
        if name not in scores:
            scores[name] = 2
        ss.append(scores[name])
        ts.append(time)
    ss = np.array(ss)
    ts = np.array(ts)
    grad1 = gradient(ss, ts)
    grad2 = bayesian_gradient(ss)
    for name, g1, g2 in zip(race.keys(), grad1, grad2):
        scores[name] += -g1*alpha + g2*beta
