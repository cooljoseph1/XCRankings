import pandas as pd
import ranking
import random

def get_race(i):
    return pd.read_csv(f"races/race{i}.csv", index_col=0, header=None, squeeze=True)

scores = dict()
for i in range(1000):
    race = get_race(random.choice([0, 1]))
    ranking.update(scores, race)
print(scores)
