import json
import requests

endpoint = "https://api.millercenter.org/speeches"
out_file = "trump_speeches.json"

r = requests.post(url=endpoint)
data = r.json()
# Filter for Trump speeches only
items = [item for item in data["Items"] if item["president"] == "Donald Trump"]

while "LastEvaluatedKey" in data:
    parameters = {"LastEvaluatedKey": data["LastEvaluatedKey"]["doc_name"]}
    r = requests.post(url=endpoint, params=parameters)
    data = r.json()
    # Filter new batch for Trump speeches only
    trump_speeches = [item for item in data["Items"] if item["president"] == "Donald Trump"]
    items += trump_speeches
    print(f"{len(items)} Trump speeches")

with open(out_file, "w") as out:
    out.write(json.dumps(items))
    print(f"wrote results to file: {out_file}")
