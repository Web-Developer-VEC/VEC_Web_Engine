import json
from pymongo import MongoClient

mongo_uri = "mongodb://localhost:27017/"
db_name = "VEC"

client = MongoClient(mongo_uri)
db = client[db_name]

import json
from pymongo import MongoClient


