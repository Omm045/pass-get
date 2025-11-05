from flask import Flask, render_template, request, jsonify
import secrets
import string
import json

app = Flask(__name__)

class PasswordGenerator:
    def __init__(self):
        self.lowercase = string.ascii_lowercase
        self.uppercase = string.ascii_uppercase
        self.digits = string.digits
        self.symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        
    def generate_password(self, length=12, use_lowercase=True, use_uppercase=True, 
                         use_digits=True, use_symbols=True, exclude_ambiguous=False):
        """
        Generate a secure password based on specified criteria
        """
        if length < 4:
            length = 4
        elif length > 128:
            length = 128
            
        character_pool = ""
        
        if use_lowercase:
            chars = self.lowercase
            if exclude_ambiguous:
                chars = chars.replace('l', '').replace('o', '')
            character_pool += chars
            
        if use_uppercase:
            chars = self.uppercase
            if exclude_ambiguous:
                chars = chars.replace('I', '').replace('O', '')
            character_pool += chars
            
        if use_digits:
            chars = self.digits
            if exclude_ambiguous:
                chars = chars.replace('0', '').replace('1', '')
            character_pool += chars
            
        if use_symbols:
            character_pool += self.symbols
            
        if not character_pool:
            character_pool = self.lowercase + self.uppercase + self.digits
            
        # Ensure at least one character from each selected category
        password = []
        
        if use_lowercase and self.lowercase in character_pool:
            password.append(secrets.choice([c for c in character_pool if c in self.lowercase]))
        if use_uppercase and any(c in character_pool for c in self.uppercase):
            password.append(secrets.choice([c for c in character_pool if c in self.uppercase]))
        if use_digits and any(c in character_pool for c in self.digits):
            password.append(secrets.choice([c for c in character_pool if c in self.digits]))
        if use_symbols and use_symbols:
            password.append(secrets.choice([c for c in character_pool if c in self.symbols]))
            
        # Fill the rest randomly
        for _ in range(length - len(password)):
            password.append(secrets.choice(character_pool))
            
        # Shuffle the password
        secrets.SystemRandom().shuffle(password)
        
        return ''.join(password)
    
    def check_strength(self, password):
        """
        Check password strength and return score with feedback
        """
        score = 0
        feedback = []
        
        # Length check
        if len(password) >= 12:
            score += 25
        elif len(password) >= 8:
            score += 15
            feedback.append("Consider using 12+ characters for better security")
        else:
            feedback.append("Password is too short (minimum 8 characters recommended)")
            
        # Character variety checks
        has_lower = any(c.islower() for c in password)
        has_upper = any(c.isupper() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_symbol = any(c in self.symbols for c in password)
        
        variety_score = sum([has_lower, has_upper, has_digit, has_symbol])
        score += variety_score * 15
        
        if variety_score < 3:
            feedback.append("Use a mix of uppercase, lowercase, numbers, and symbols")
            
        # Repetition check
        if len(set(password)) / len(password) > 0.7:
            score += 10
        else:
            feedback.append("Avoid too many repeated characters")
            
        # Common patterns check (basic)
        common_patterns = ['123', 'abc', 'qwe', 'password', '111', '000']
        if not any(pattern in password.lower() for pattern in common_patterns):
            score += 15
        else:
            feedback.append("Avoid common patterns and sequences")
            
        # Determine strength level
        if score >= 85:
            strength = "Very Strong"
            color = "#22c55e"
        elif score >= 70:
            strength = "Strong"
            color = "#84cc16"
        elif score >= 50:
            strength = "Medium"
            color = "#eab308"
        elif score >= 30:
            strength = "Weak"
            color = "#f97316"
        else:
            strength = "Very Weak"
            color = "#ef4444"
            
        return {
            'score': min(score, 100),
            'strength': strength,
            'color': color,
            'feedback': feedback
        }

password_gen = PasswordGenerator()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_password():
    try:
        data = request.get_json()
        
        length = int(data.get('length', 12))
        use_lowercase = data.get('lowercase', True)
        use_uppercase = data.get('uppercase', True)
        use_digits = data.get('digits', True)
        use_symbols = data.get('symbols', True)
        exclude_ambiguous = data.get('excludeAmbiguous', False)
        
        password = password_gen.generate_password(
            length=length,
            use_lowercase=use_lowercase,
            use_uppercase=use_uppercase,
            use_digits=use_digits,
            use_symbols=use_symbols,
            exclude_ambiguous=exclude_ambiguous
        )
        
        strength_info = password_gen.check_strength(password)
        
        return jsonify({
            'success': True,
            'password': password,
            'strength': strength_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

@app.route('/check-strength', methods=['POST'])
def check_strength():
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        if not password:
            return jsonify({
                'success': False,
                'error': 'Password is required'
            }), 400
            
        strength_info = password_gen.check_strength(password)
        
        return jsonify({
            'success': True,
            'strength': strength_info
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)