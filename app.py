from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests 
from time import time
from flask import Flask, request, jsonify, render_template

app = Flask(__name__)
CORS(app) 

cached_gold_price = None
cached_time = 0
CACHE_DURATION = 18000

GOLD_API_KEY = "goldapi-8piosm9g2pm8i-io"
GOLD_API_URL = "https://www.goldapi.io/api/XAU/USD"


@app.route('/')
def home():
    return render_template('index.html')

def calculate_price(product):
    gold_price = get_gold_price_per_gram()
    if gold_price is None:
        return None
    popularity = product.get('popularityScore', 0)
    weight = product.get('weight', 0)
    return (popularity + 1) * weight * gold_price
    
def get_gold_price_per_gram():
    global cached_gold_price, cached_time
    if time() - cached_time < CACHE_DURATION:
        return cached_gold_price

    try:
        headers = {
            "x-access-token": GOLD_API_KEY,
            "Content-Type": "application/json"
        }
        response = requests.get(GOLD_API_URL, headers=headers)
        data = response.json()

        if 'price' not in data:
            print("GoldAPI response error:", data)
            return None

        usd_per_ounce = data['price']
        usd_per_gram = usd_per_ounce / 31.1035

        cached_gold_price = usd_per_gram
        cached_time = time()

        return usd_per_gram

    except Exception as e:
        print(f"Error fetching gold price: {e}")
        return None
    

@app.route('/product/price', methods=['GET'])
def get_price_by_name():
    product_name = request.args.get('name')
    if not product_name:
        return jsonify({"error": "Please provide a product name via 'name' query parameter"}), 400

    product_name = product_name.strip()

    file_path = os.path.join(os.path.dirname(__file__), 'products.json')
    with open(file_path, 'r') as file:
        products = json.load(file)

    product = next((p for p in products if p.get('name') == product_name), None)
    if not product:
        return jsonify({"error": f"Product with name '{product_name}' not found"}), 404

    price = calculate_price(product)
    if price is None:
        return jsonify({"error": "Failed to retrieve real-time gold price"}), 500

    return jsonify({
        "name": product_name,
        "price": round(price, 2)
    }), 200

@app.route('/products', methods=['GET'])
def get_all_products():
    file_path = os.path.join(os.path.dirname(__file__), 'products.json')
    with open(file_path, 'r') as file:
        products = json.load(file)
    return jsonify(products), 200

@app.route('/products/with-price', methods=['GET'])
def get_all_products_with_price():
    file_path = os.path.join(os.path.dirname(__file__), 'products.json')
    with open(file_path, 'r') as file:
        products = json.load(file)

    enriched = []
    for product in products:
        price = calculate_price(product)
        if price is not None:
            product_with_price = product.copy()
            product_with_price["price"] = round(price, 2)
            enriched.append(product_with_price)

    return jsonify(enriched), 200


if __name__ == '__main__':
    app.run(debug=True, port=5001)

#updated