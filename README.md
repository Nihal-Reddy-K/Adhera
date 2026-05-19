# Adhera: Smart Medication Adherence System

Adhera is an IoT-powered healthcare solution designed to track, monitor, and improve patient medication adherence. The system integrates a physical smart pillbox (powered by an ESP32 microcontroller) with a live web-based tracking dashboard.

**Live Site:** [https://adhera.onrender.com](https://adhera.onrender.com)

---

##  Key Features

* **IoT Dashboard:** Real-time visualization of medication logs, adherence score (percentage of taken vs. missed doses), and active schedules.
* **Medication Scheduler:** Simple web interface to create, manage, and delete medication routines for patient-specific timings.
* **Secure Dose Logging:** Tracks patient compliance status (`Taken`, `Missed`, `Pending`) synced directly from the physical pillbox device.
* **Robust Hardware Firmware:** Microcontroller code with built-in hardware protection, bounds-safe string operations to prevent memory corruption, and accurate real-time clock (RTC) syncing.
* **Aesthetic User Experience:** Highly responsive glassmorphism dark-mode UI with dynamic SVG gauge progress indicators.

---

##  Tech Stack

### Backend & Frontend Web
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (using Mongoose ODM)
* **Template Engine:** EJS (Embedded JavaScript)
* **Styling:** Custom CSS (Glassmorphism theme)

### IoT Hardware Firmware
* **Microcontroller:** ESP32 (Wi-Fi enabled)
* **Real-Time Clock:** DS3231 RTC module
* **Indicators:** Buzzer and 3 active slot LEDs (Morning, Afternoon, Night)
* **Input:** Physical push button for dosage acknowledgement

---

##  Local Development Setup

### 1. Backend Server Setup
1. Navigate into the backend directory:
   ```bash
   cd adhera
   ```
2. Install the required Node.js packages:
   ```bash
   npm install
   ```
3. Create a `.env` file using the `.env.example` as a template:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/adhera
   ```
4. Start the server locally:
   ```bash
   npm start
   ```
5. Access your local dashboard at [http://localhost:3000](http://localhost:3000).

### 2. ESP32 Hardware Connection
1. Open the file located at `adhera/hardware/Adhera_finalcopy.ino` in your Arduino IDE.
2. Ensure you have the following libraries installed via the Library Manager:
   * `Wire.h` (Built-in)
   * `RTClib` (by Adafruit)
   * `WiFi.h` (Built-in)
   * `HTTPClient.h` (Built-in)
   * `ArduinoJson` (v6 or v7)
3. Set your Wi-Fi credentials at the top of the file:
   ```cpp
   const char* ssid = "YOUR_WIFI_NAME";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
4. Set the backend URL to your local server IP (or your live deployed Render URL):
   ```cpp
   const char* serverBase = "https://adhera.onrender.com";
   ```
5. Connect your ESP32 board, select the correct COM port, and click **Upload**.

---

## 🔒 Security & Best Practices

* **Ignored Secrets:** Environment variables containing sensitive database credentials (`.env`) are explicitly ignored by Git (`.gitignore`) to keep production systems secure.
* **Firmware Safety:** Variable copy operations on the ESP32 utilize bounds-checked string manipulation (`String.toCharArray`) rather than standard C `strcpy` to prevent memory leaks and device crashes.
