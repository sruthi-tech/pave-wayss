from flask import Flask, render_template, request, jsonify, session
from flask_cors import CORS
import json
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
app.secret_key = 'your-secret-key-here'  # Change this to a secure secret key
CORS(app)

# In-memory storage for demo purposes
# In production, use a proper database
users = {}
routes = [
    {
        "id": 1,
        "start": "Kollam",
        "stop": "Trivandrum",
        "segments": [
            {"mode": "Bus", "distance": "30 km", "fare": 159, "time": "1 hour"},
            {"mode": "Auto", "distance": "10 km", "fare": 200, "time": "30 minutes"}
        ]
    },
    {
        "id": 2,
        "start": "Kochi",
        "stop": "Mukkada",
        "segments": [
            {"mode": "Bus", "distance": "50 km", "fare": 256, "time": "2 hours"},
            {"mode": "Private Taxi", "distance": "20 km", "fare": 500, "time": "1 hour"}
        ]
    },
    {
        "id": 3,
        "start": "Edappaly",
        "stop": "Vadakara",
        "segments": [
            {"mode": "Bus", "distance": "100 km", "fare": 356, "time": "3 hours"},
            {"mode": "Airplane", "distance": "200 km", "fare": 1500, "time": "1 hour"}
        ]
    },
    {
        "id": 4,
        "start": "Mylakkad",
        "stop": "Kuttivattom",
        "segments": [
            {"mode": "Auto", "distance": "5 km", "fare": 100, "time": "15 minutes"},
            {"mode": "Bus", "distance": "10 km", "fare": 56, "time": "30 minutes"}
        ]
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if email in users:
        return jsonify({'error': 'User already exists'}), 400
    
    users[email] = generate_password_hash(password)
    return jsonify({'message': 'Registration successful'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if email not in users or not check_password_hash(users[email], password):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    session['user_email'] = email
    return jsonify({'message': 'Login successful', 'email': email})

@app.route('/api/routes', methods=['GET'])
def get_routes():
    start = request.args.get('start')
    end = request.args.get('end')
    
    if start and end:
        route = next((r for r in routes 
                     if r['start'].lower() == start.lower() 
                     and r['stop'].lower() == end.lower()), None)
        if route:
            return jsonify(route)
        return jsonify({'error': 'Route not found'}), 404
    
    return jsonify(routes)

@app.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_email', None)
    return jsonify({'message': 'Logout successful'})

if __name__ == '__main__':
    app.run(debug=True)