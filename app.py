from flask import Flask, render_template, request, jsonify, send_from_directory
import secrets
import string

app = Flask(__name__)

class PasswordGenerator:
    def __init__(self):
        self.lowercase = string.ascii_lowercase
        self.uppercase = string.ascii_uppercase
        self.digits = string.digits
        self.symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
    def generate_password(self, length=12, use_lowercase=True, use_uppercase=True, use_digits=True, use_symbols=True, exclude_ambiguous=False):
        if length < 4: length = 4
        elif length > 128: length = 128
        pool = ""
        if use_lowercase:
            chars = self.lowercase
            if exclude_ambiguous: chars = chars.replace('l','').replace('o','')
            pool += chars
        if use_uppercase:
            chars = self.uppercase
            if exclude_ambiguous: chars = chars.replace('I','').replace('O','')
            pool += chars
        if use_digits:
            chars = self.digits
            if exclude_ambiguous: chars = chars.replace('0','').replace('1','')
            pool += chars
        if use_symbols: pool += self.symbols
        if not pool: pool = self.lowercase + self.uppercase + self.digits
        pwd = []
        if use_lowercase: pwd.append(secrets.choice(self.lowercase))
        if use_uppercase: pwd.append(secrets.choice(self.uppercase))
        if use_digits: pwd.append(secrets.choice(self.digits))
        if use_symbols: pwd.append(secrets.choice(self.symbols))
        for _ in range(length - len(pwd)): pwd.append(secrets.choice(pool))
        secrets.SystemRandom().shuffle(pwd)
        return ''.join(pwd)

    def check_strength(self, password):
        score = 0; feedback = []
        if len(password) >= 12: score += 25
        elif len(password) >= 8: score += 15; feedback.append("Consider using 12+ characters for better security")
        else: feedback.append("Password is too short (minimum 8 characters recommended)")
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_symbol = any(c in self.symbols for c in password)
        variety = sum([has_lower, has_upper, has_digit, has_symbol]); score += variety*15
        if variety < 3: feedback.append("Use a mix of uppercase, lowercase, numbers, and symbols")
        if len(set(password)) / max(len(password),1) > 0.7: score += 10
        else: feedback.append("Avoid too many repeated characters")
        common_patterns = ['123','abc','qwe','password','111','000']
        if not any(p in password.lower() for p in common_patterns): score += 15
        else: feedback.append("Avoid common patterns and sequences")
        if score >= 85: strength, color = "Very Strong", "#22c55e"
        elif score >= 70: strength, color = "Strong", "#84cc16"
        elif score >= 50: strength, color = "Medium", "#eab308"
        elif score >= 30: strength, color = "Weak", "#f97316"
        else: strength, color = "Very Weak", "#ef4444"
        return { 'score': min(score,100), 'strength': strength, 'color': color, 'feedback': feedback }

password_gen = PasswordGenerator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_password():
    data = request.get_json()
    length = int(data.get('length', 12))
    password = password_gen.generate_password(
        length=length,
        use_lowercase=data.get('lowercase', True),
        use_uppercase=data.get('uppercase', True),
        use_digits=data.get('digits', True),
        use_symbols=data.get('symbols', True),
        exclude_ambiguous=data.get('excludeAmbiguous', False)
    )
    return jsonify({ 'success': True, 'password': password, 'strength': password_gen.check_strength(password) })

@app.route('/check-strength', methods=['POST'])
def check_strength():
    data = request.get_json(); password = data.get('password','')
    if not password: return jsonify({ 'success': False, 'error': 'Password is required' }), 400
    return jsonify({ 'success': True, 'strength': password_gen.check_strength(password) })

# PWA assets
@app.route('/service-worker.js')
def service_worker():
    return send_from_directory('static', 'service-worker.js')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
