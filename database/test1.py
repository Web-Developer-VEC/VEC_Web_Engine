import requests

url = "https://localvec3.duckdns.org/gallery"  # Replace with your actual link

# Call the link 5 times
for i in range(60):
    try:
        print(f"Calling {url} - Attempt {i+1}")
        response = requests.get(url)
        print("Status Code:", response.status_code)
        print("Response (first 100 chars):", response.text[:100], "\n")
    except requests.exceptions.RequestException as e:
        print("Error calling the link:", e, "\n")
