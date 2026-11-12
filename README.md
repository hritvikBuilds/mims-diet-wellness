# dt Mimmy — Nourish Delight 🌱

> Personalized Hormone & Nutrition Coaching Web Platform

A web application designed for **dt Mimmy (Nourish Delight)**, offering science-backed, real Indian food plans to naturally reverse PCOS, Thyroid imbalances, postpartum weight gain, and metabolic lifestyle disorders.

---

## 🌟 Key Features

- **Interactive 3D Hero Experience**: Botanical layers (avocado superfood, green wheat spike, tulsi foliage, clinical stethoscope) that interact with cursor proximity via physics-based interpolation.
- **Bio-Vitality Hub**: Visual 4-phase hormonal cycle synchronization engine (Menstrual, Follicular, Ovulatory, Luteal) with real-time biological telemetry.
- **Smart Nutritional Hacks & Food Swaps**: Side-by-side interactive Indian food alternatives (refined carbs to complex grain bio-hacks, high glycemic to hormone-safe swaps).
- **Free Health Quiz & Clinical BMI Engine**: Automated endocrine diagnostic questionnaire with instant body composition analysis and tailored program recommendations.
- **Client Portal (Authentication & Dashboard)**: Firebase Phone OTP & Password authentication architecture, personalized meal plan tracking, hydration tracker, and direct messaging.
- **Accessible & Responsive**: Modern dark botanical aesthetics (80% rich green palette, 20% delicate accent gradients) adhering to WCAG AA contrast standards.

---

## 🚀 Quick Start

### Local Preview
No complex build steps required. Simply serve the repository with any HTTP server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node / npx
npx serve .
```

Open `http://localhost:3000` in your browser.

### Run Automated Tests

```bash
npm test
```

Runs the 30-test suite covering all UI components, mathematical calculators, security boundaries, and input sanitization.

---

## 📁 Project Structure

```text
mims-diet-wellness/
├── index.html          # Main application page & semantic layouts
├── styles.css          # Design system, theme variables & animations
├── app.js              # Core interactive logic, proximity physics & state
├── firebase-config.js  # Firebase authentication & Firestore client configuration
├── assets/             # Brand mascot, botanical vectors & illustrations
└── tests/
    └── test_suite.js   # Automated Node.js unit & security test suite
```

---

## 📜 License
MIT License. Created for dt Mimmy — Nourish Delight.
