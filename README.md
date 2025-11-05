# PassGen Pro - Premium Password Generator

A sophisticated, web-based password generator built with Flask and modern web technologies. Generate cryptographically secure passwords with a beautiful, responsive interface.

## Features

### 🔐 Security First
- **Cryptographically Secure**: Uses Python's `secrets` module for true randomness
- **No Data Storage**: All passwords are generated client-side, nothing is stored or transmitted
- **Customizable Options**: Full control over character types, length, and complexity
- **Strength Analysis**: Real-time password strength assessment with detailed feedback

### 🎨 Premium UI/UX
- **Modern Design**: Clean, professional interface with smooth animations
- **Fully Responsive**: Works perfectly on desktop, tablet, and mobile devices
- **Dark Mode Ready**: Sophisticated color scheme that's easy on the eyes
- **Intuitive Controls**: Simple sliders, checkboxes, and buttons for easy customization

### ⚡ Advanced Features
- **Real-time Generation**: Instant password generation as you adjust settings
- **Strength Meter**: Visual strength indicator with detailed scoring (0-100)
- **Custom Analysis**: Check the strength of your existing passwords
- **One-Click Copy**: Copy passwords to clipboard with visual feedback
- **Ambiguous Character Filter**: Option to exclude confusing characters (0, O, l, I, 1)
- **Multiple Character Sets**: Support for uppercase, lowercase, numbers, and symbols

## Installation

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Omm045/pass-get.git
   cd pass-get
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application**
   ```bash
   python app.py
   ```

4. **Access the application**
   Open your web browser and navigate to `http://localhost:5000`

## Usage

### Basic Password Generation
1. Adjust the password length using the slider (4-128 characters)
2. Select your desired character types:
   - Uppercase letters (A-Z)
   - Lowercase letters (a-z)
   - Numbers (0-9)
   - Symbols (!@#$%^&*)
3. Click "Generate Password" or use the refresh button
4. Copy the generated password using the copy button

### Password Strength Analysis
- Generated passwords show real-time strength metrics
- Use "Check Custom Password" to analyze existing passwords
- Get detailed feedback and recommendations for improvement

### Advanced Options
- **Exclude Ambiguous Characters**: Remove easily confused characters for better usability
- **Length Control**: Fine-tune password length from 4 to 128 characters
- **Character Type Control**: Enable/disable specific character sets as needed

## API Endpoints

### POST `/generate`
Generate a new password with specified options.

**Request Body:**
```json
{
  "length": 16,
  "lowercase": true,
  "uppercase": true,
  "digits": true,
  "symbols": true,
  "excludeAmbiguous": false
}
```

**Response:**
```json
{
  "success": true,
  "password": "K7#mN9$pL2@vQ6",
  "strength": {
    "score": 85,
    "strength": "Very Strong",
    "color": "#22c55e",
    "feedback": []
  }
}
```

### POST `/check-strength`
Analyze the strength of a provided password.

**Request Body:**
```json
{
  "password": "your-password-here"
}
```

**Response:**
```json
{
  "success": true,
  "strength": {
    "score": 75,
    "strength": "Strong",
    "color": "#84cc16",
    "feedback": ["Consider using 12+ characters for better security"]
  }
}
```

## Security Features

### Cryptographic Security
- Uses Python's `secrets` module, which is designed for cryptographically strong random number generation
- Ensures true randomness suitable for security-sensitive applications
- No predictable patterns or weak pseudo-random generation

### Privacy Protection
- **Client-Side Generation**: All password generation happens locally
- **No Data Transmission**: Passwords are never sent over the network
- **No Storage**: No passwords are logged, stored, or cached anywhere
- **Memory Safe**: Passwords are not stored in browser history or autocomplete

### Password Strength Algorithm
The strength analysis considers multiple factors:
- **Length**: Longer passwords score higher (12+ characters recommended)
- **Character Variety**: Bonus points for using multiple character types
- **Uniqueness**: Penalties for repeated characters
- **Pattern Detection**: Identifies and penalizes common patterns
- **Dictionary Avoidance**: Checks against common weak passwords

## File Structure

```
pass-get/
├── app.py                 # Flask application and backend logic
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── templates/
│   └── index.html        # Main HTML template
└── static/
    ├── css/
    │   └── styles.css    # Comprehensive styling
    └── js/
        └── script.js     # Frontend JavaScript logic
```

## Browser Compatibility

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+
- **Mobile Browsers**: iOS Safari 12+, Chrome Mobile 60+

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [Flask](https://flask.palletsprojects.com/) - Python web framework
- Icons by [Font Awesome](https://fontawesome.com/)
- Fonts by [Google Fonts](https://fonts.google.com/) (Inter)
- Styling inspired by modern design principles and accessibility guidelines

## Security Notice

This password generator is designed for general use and follows security best practices. For enterprise or high-security applications, consider additional security measures such as:

- Hardware security modules (HSMs) for key generation
- Additional entropy sources
- Formal security audits
- Compliance with specific industry standards (FIPS, Common Criteria, etc.)

---

**PassGen Pro** - Generate secure passwords with confidence. Built with security, usability, and aesthetics in mind.