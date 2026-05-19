#include <Wire.h>
#include "RTClib.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

RTC_DS3231 rtc;

const char* ssid = "Moto_g85";
const char* password = "hithu_0108";

// Change this to your deployed backend server URL when deploying (e.g. "https://adhera.onrender.com")
const char* serverBase = "http://10.245.153.43:3000";
const char* deviceId = "demobox01";

// Buffer sizes increased to prevent potential overflow/crashes with long medicine names
char medicine[64];
char slot[32];
char scheduleTime[16];
int morning_led = 25;
int afternoon_led = 26;
int night_led = 27;
int button = 19;
int buzzer = 18;

bool reminderActive = false;
bool alreadyTriggered = false;

void sendLog(const char* status) {

  if (WiFi.status() != WL_CONNECTED) {
    return;
  }
  HTTPClient http;
  String url =String(serverBase) +"/api/device/log";
  http.begin(url);
  http.addHeader("Content-Type","application/json");
  DynamicJsonDocument doc(256);

  doc["deviceId"] = deviceId;
  doc["medicineName"] = medicine;
  doc["slot"] =slot;
  doc["scheduledTime"] =scheduleTime;
  doc["status"] =status;
  
  String body;
  serializeJson(doc, body);
  int httpCode =http.POST(body);
  Serial.print("POST CODE: ");
  Serial.println(httpCode);
  http.end();
}

void setup() {

  Serial.begin(115200);
  delay(2000);

  // RTC
  Wire.begin(21, 22);
  rtc.begin();
  pinMode(morning_led, OUTPUT);
  pinMode(afternoon_led, OUTPUT);
  pinMode(night_led, OUTPUT);
  pinMode(button,INPUT_PULLUP);
  pinMode(buzzer,OUTPUT);

  // Uncomment ONLY ONCE if RTC wrong
  /*rtc.adjust(DateTime(2026, 5, 12,22, 30, 0));*/

  // WIFI
  Serial.println("Connecting WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("WiFi Connected");

  // HTTP
  HTTPClient http;
  String url =String(serverBase) +"/api/device/" +deviceId +"/schedules";
  http.begin(url);
  int httpCode = http.GET();
  Serial.print("HTTP Code: ");
  Serial.println(httpCode);
  if (httpCode != 200) {
    Serial.println("HTTP Failed");
    http.end();
    return;
  }

  // JSON
  String payload = http.getString();
  DynamicJsonDocument doc(384);
  DeserializationError error =deserializeJson(doc, payload);
  if (error) {
    Serial.println("JSON Failed");
    Serial.println(error.c_str());
    http.end();
    return;
  }
  JsonArray arr = doc.as<JsonArray>();
  if (arr.size() == 0) {
    Serial.println("No schedules found");
    http.end();
    return;
  }
  JsonObject obj = arr[0];
  String medStr = obj["medicineName"].as<String>();
  medStr.toCharArray(medicine, sizeof(medicine));
  
  String slotStr = obj["slot"].as<String>();
  slotStr.toCharArray(slot, sizeof(slot));
  
  String tempTime = obj["scheduledTime"].as<String>();
  if (tempTime.length() == 4) {
    tempTime = "0" + tempTime;
  }
  tempTime.toCharArray(scheduleTime, sizeof(scheduleTime));
  Serial.println("Schedule Loaded");
  Serial.print("Medicine: ");
  Serial.println(medicine);
  Serial.print("Slot: ");
  Serial.println(slot);
  Serial.print("Time: ");
  Serial.println(scheduleTime);
  http.end();
}

void loop() {
  DateTime now = rtc.now();
  int hour = now.hour();
  int minute = now.minute();
  char currentTime[10];

  sprintf(currentTime,"%02d:%02d",hour,minute);
  Serial.print("Current Time: ");
  Serial.println(currentTime);
  Serial.print("Schedule Time: ");
  Serial.println(scheduleTime);

  if (strcmp(currentTime,scheduleTime) == 0 && !alreadyTriggered) {
    Serial.println("MATCH FOUND");
    reminderActive = true;
    alreadyTriggered = true;
    tone(buzzer,1000);
    
    if (strcmp(slot, "Morning") == 0) {
      digitalWrite(morning_led, HIGH); 
    }
    else if (strcmp(slot, "Afternoon") == 0) {
      digitalWrite(afternoon_led, HIGH);
    }
    else if (strcmp(slot, "Night") == 0) {
      digitalWrite(night_led, HIGH);
    }
  }

  if (strcmp(currentTime, scheduleTime) != 0) {
    alreadyTriggered = false;
  }

  if (reminderActive &&digitalRead(button) == LOW) {
    Serial.println("TAKEN");
    sendLog("Taken");
    digitalWrite(morning_led, LOW);
    digitalWrite(afternoon_led, LOW);
    digitalWrite(night_led, LOW);
    noTone(buzzer);
    reminderActive = false;
    delay(500);
  }

  if (reminderActive) {
    int scheduledMinute =atoi(scheduleTime + 3);
    if (minute != scheduledMinute) {
      Serial.println("MISSED");
      sendLog("Missed");
      digitalWrite(morning_led, LOW);
      digitalWrite(afternoon_led, LOW);
      digitalWrite(night_led, LOW);
      noTone(buzzer);
      reminderActive = false;
    }
  }
  delay(1000);
}