from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import datetime
from groq import Groq  # Ensure you have the groq package installed
import os
import joblib
from rank_bm25 import BM25Okapi  # Lightweight BM25 library
import numpy as np
from flask_cors import CORS
import os
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)
load_dotenv()

# -------------------------------
# MongoDB Connection for Rate Limiting
# -------------------------------
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["vechat"]
users_collection = db["chat"]
groq_api_key = os.getenv("GROQ_API_KEY")

# -------------------------------
# Initialize Groq Client
# -------------------------------
groq_client = Groq(api_key="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")

# -------------------------------
# BM25 Memorization Model (Persisted)
# -------------------------------
BM25_MODEL_FILE = "bm25_model.joblib"
DOCUMENTS_FILE = "data.txt"

def load_documents(file_path=DOCUMENTS_FILE):
    """
    Loads non-empty lines from data.txt.
    Each line is treated as a separate document.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        docs = [line.strip() for line in f if line.strip()]
    return docs

# Load documents
documents = load_documents()

# Build or load BM25 model
if os.path.exists(BM25_MODEL_FILE):
    bm25 = joblib.load(BM25_MODEL_FILE)
    print("Loaded BM25 model from disk.")
else:
    # Tokenize each document (simple whitespace tokenization and lowercasing)
    tokenized_docs = [doc.lower().split() for doc in documents]
    bm25 = BM25Okapi(tokenized_docs)
    joblib.dump(bm25, BM25_MODEL_FILE)
    print("BM25 model trained and saved to disk.")

def query_bm25(query, max_chars=2000):
    """
    Transforms the query using BM25 and retrieves documents until the combined character 
    count reaches max_chars.
    """
    tokenized_query = query.lower().split()
    scores = bm25.get_scores(tokenized_query)
    sorted_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)
    
    selected_docs = []
    total_chars = 0

    for idx in sorted_indices:
        doc = documents[idx]
        if total_chars + len(doc) > max_chars:
            break  
        selected_docs.append(doc)
        total_chars += len(doc)
    
    return selected_docs

# -------------------------------
# Groq LLM Functions
# -------------------------------
def process_with_groq(context, query):
    """
    Uses Groq's Llama chat completion API to generate a final answer given the context and query.
    """
    try:
        prompt = (
            "You are a kind, patient, and helpful assistant for Velammal Engineering College "
            "based in Surapet, Chennai. Any questions not relevant to the college should be strictly prohibited. "
            "If the provided info either is incomplete, doesn't make sense or is just straight up irrelevant, ignore it when considering your answer. Do not reveal anything to the user. "
            "You are a helpful assistant. Use the following context to answer the query. There might be some irrelevant info there as well, please feel free to ignore it.\n\n"
            "Context:\n" + context + "\n\n"
            "Query:\n" + query + ". If the question is completely irrelevant, do not answer."
        )
        completion = groq_client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile"
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error processing with Groq: {e}"

# -------------------------------
# Rate Limiting Function
# -------------------------------
def check_limit(phone):
    """
    Enforce a daily limit of 15 queries per phone number.
    """
    today = datetime.date.today().isoformat()
    user = users_collection.find_one({"phone": phone})
    if user:
        if user["last_used"] != today:
            users_collection.update_one(
                {"phone": phone},
                {"$set": {"query_count": 1, "last_used": today}}
            )
        elif user["query_count"] >= 15:
            return False
        else:
            users_collection.update_one(
                {"phone": phone},
                {"$inc": {"query_count": 1}}
            )
    else:
        users_collection.insert_one({
            "phone": phone,
            "query_count": 1,
            "last_used": today
        })
    return True

# -------------------------------
# Flask Routes
# -------------------------------
@app.route("/")
def index_page():
    return jsonify({
        "response": "Welcome to the velammal engineering college chatbot"
    })

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    query_text = data.get("query", "")
    phone_number = data.get("phone", "")
    
    if not phone_number:
        return jsonify({"response": "Phone number verification required."})
    
    if not check_limit(phone_number):
        return jsonify({"response": "Daily limit of 15 queries reached. Please try again tomorrow."})
    
    # Use BM25 to retrieve the top relevant passages.
    top_docs = query_bm25(query_text, max_chars=6000)
    debug_info = []
    for i, doc in enumerate(top_docs):
        debug_info.append(f"Doc {i+1}: {doc}")
    
    # Combine the retrieved passages as context.
    final_context = "\n---\n".join(top_docs)
    if not final_context.strip():
        final_context = query_text  # Fallback if no docs found
    
    # Use Groq's LLM to process the final context and query.
    groq_response = process_with_groq(final_context, query_text)
    
    return jsonify({
        "response": groq_response,
        "debug": debug_info
    })

if __name__ == "__main__":
    app.run(debug=True,port=8080)
