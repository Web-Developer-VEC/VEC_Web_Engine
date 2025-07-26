from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
import datetime
from groq import Groq  # Ensure you have the groq package installed
import os
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__)

# -------------------------------
# MongoDB Connection for Rate Limiting
# -------------------------------
MONGO_URI = "mongodb://localhost:27017/"
client = MongoClient(MONGO_URI)
db = client["vechat"]
users_collection = db["chat"]

# -------------------------------
# Initialize Groq Client
# -------------------------------
groq_client = Groq(api_key="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")

# -------------------------------
# TF-IDF Memorization Model (Persisted)
# -------------------------------
MODEL_FILE = "tfidf_model.joblib"

def load_documents(file_path="data.txt"):
    """
    Loads non-empty lines from data.txt.
    Each line is treated as a separate document.
    """
    with open(file_path, "r", encoding="utf-8") as f:
        docs = [line.strip() for line in f if line.strip()]
    return docs

if os.path.exists(MODEL_FILE):
    # Load the persisted model, TF-IDF matrix, and documents.
    vectorizer, tfidf_matrix, documents = joblib.load(MODEL_FILE)
    print("Loaded TF-IDF model from disk.")
else:
    # Train the model and persist it.
    documents = load_documents("data.txt")
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(documents)
    joblib.dump((vectorizer, tfidf_matrix, documents), MODEL_FILE)
    print("TF-IDF model trained and saved to disk.")

def query_tfidf(query, top_n=5):
    """
    Transforms the query into TF-IDF space and returns the top_n matching documents.
    """
    query_vec = vectorizer.transform([query])
    sims = cosine_similarity(query_vec, tfidf_matrix).flatten()
    top_indices = np.argsort(sims)[::-1][:top_n]
    top_docs = [documents[i] for i in top_indices]
    scores = [sims[i] for i in top_indices]
    return top_docs, scores

# -------------------------------
# Groq LLM Functions
# -------------------------------
def process_with_groq(context, query):
    """
    Uses Groq's Llama chat completion API to generate a final answer given the context and query.
    """
    try:
        prompt = (
            "You are a kind, patient, and helpful assistant for Velammal Engineering College "+
                "based in Surapet, Chennai. Any questions not relevant to the college should be strictly prohibited. " +
                "If the provided info either is incomplete, doesn't make sense or is just straight up irrelevant, ignore it when considering your answer. do not reveal anything to the user."+
            "You are a helpful assistant. Use the following context to answer the query.There might be some irrelevant info there as well, please do feel free to ignore it.\n\n"
            "Context:\n" + context + "\n\n"
            "Query:\n" + query + ". If the question is completely irrelevant, do not answer. "
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
    return render_template("index.html")

@app.route("/ask", methods=["POST"])
def ask():
    data = request.json
    query_text = data.get("query", "")
    phone_number = data.get("phone", "")
    
    if not phone_number:
        return jsonify({"response": "Phone number verification required."})
    
    if not check_limit(phone_number):
        return jsonify({"response": "Daily limit of 15 queries reached. Please try again tomorrow."})
    
    # Use TF-IDF to retrieve the top relevant passages.
    top_docs, scores = query_tfidf(query_text, top_n=5)
    debug_info = []
    for i, (doc, score) in enumerate(zip(top_docs, scores)):
        debug_info.append(f"Doc {i+1} (score: {score:.4f}): {doc}")
    
    # Combine the retrieved passages as context.
    final_context = "\n---\n".join(top_docs)
    if not final_context.strip():
        final_context = query_text  # Fallback
    
    # Use Groq's LLM to process the final context and query.
    groq_response = process_with_groq(final_context, query_text)
    
    return jsonify({
        "response": groq_response,
        "debug": debug_info
    })

if __name__ == "__main__":
    app.run(debug=True)
