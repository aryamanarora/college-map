import jinja2 as j2
import os
import datetime, calendar
import yaml
import requests
import json
from csv import reader
import time

locations = {}

with open('data.csv', 'r') as fin:
    csv_reader = reader(fin)
    for i, row in enumerate(csv_reader):
        if i == 0: continue
        if row[2] == "" or row[2] in locations: continue
        coordinate = requests.get(f"http://api.geonames.org/geoCodeAddressJSON?q=\
            {row[2]}&username=aryaman").json()["address"]
        locations[row[2]] = coordinate
        print(row[2], coordinate)

with open('locs.json', 'w') as fout:
    fout.write(json.dumps(locations, indent=2))