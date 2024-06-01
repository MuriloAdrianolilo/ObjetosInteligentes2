#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char *ssid = "Nome_Rede_Wifi";        //nome da sua rede wifi
const char* password = "Nome_Senha_Wifi";  //senha da sua rede wifi
const char* mqtt_server = "Server_MQTT";  //servidor mqtt

WiFiClient espClient;
PubSubClient client(espClient);

int PulseSensorPin = A0; 
int buzzerPin = 14;  

int Signal;  
int Threshold = 572;

unsigned long lastBeatTime = 0; 
unsigned int bpm = 0;          

void setup() {
  pinMode(buzzerPin, OUTPUT);
  Serial.begin(115200); 
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.println("Conectando no Wi-Fi...");  
  }
  Serial.println("Conectado Wi-Fi"); 
  client.setServer(mqtt_server, 1883); 
}

void reconnect_mqtt() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "IoT_Sens0r_Cardiac0_Mackenzie";
    clientId += String(random(0xffff), HEX);
    if (client.connect(clientId.c_str())) {
      Serial.println("Conectado"); 
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" Tente de novo em 5 segundos");
      delay(5000);
    }
  }
}

void publish_mqtt() {
  client.publish("arduino/1", String(bpm).c_str(), true);

void loop() {
  if (!client.connected()) {
    reconnect_mqtt();
  }

  publish_mqtt(); 

  Signal = analogRead(PulseSensorPin);

  if (Signal > Threshold) {
    if ((millis() - lastBeatTime) > 200) { 
      bpm = 60000 / (millis() - lastBeatTime); 
      lastBeatTime = millis(); 
    }
  }

  if (bpm > 150) {
    digitalWrite(buzzerPin, HIGH); 
  } else {
    digitalWrite(buzzerPin, LOW); 
  }

  static unsigned long lastPrintTime = 0;
  if (millis() - lastPrintTime >= 1000) {
    Serial.print("BPM: ");
    Serial.println(bpm);
    lastPrintTime = millis();
  }
  delay(20);
}