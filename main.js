
 /// Configurações do broker MQTT
var broker = "192.168.15.27";
var port = 8884;
var clientId = "web-client-" + parseInt(Math.random() * 100000, 10);
var username = "";
var password = "";

// Cria um cliente MQTT
var client = new Paho.MQTT.Client(broker, port, clientId);

// Função de callback para quando a conexão é estabelecida
client.onConnectionLost = function (responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("Conexão perdida: " + responseObject.errorMessage);
  }
};

// Função de callback para quando uma mensagem é recebida
client.onMessageArrived = function (message) {
  updateDisplay(message.payloadString);
  console.log("Mensagem recebida: " + message.payloadString);
  document.getElementById("bpm").innerText =
    "BPM: " + message.payloadString;
};

// Conecta-se ao broker MQTT
client.connect({
  onSuccess: function () {
    console.log("Conexão estabelecida com sucesso");
    // Subscreve ao tópico onde o BPM está sendo publicado
    client.subscribe("esp.mackenzie/sensorcardiaco");
  },
  onFailure: function (errorMessage) {
    console.log("Falha na conexão: " + errorMessage.errorMessage);
  },
  useSSL: true,
  userName: username,
  password: password
});

function updateDisplay(bpm) {
  const pulseStatusElement = document.getElementById('monitor-cardiaco-pulso-status');
  const recommendationElement = document.getElementById('monitor-cardiaco-sugestao');

  let pulseStatus = '';
  let recommendation = '';
  let recommendationClass = '';

  bpm = parseInt(bpm); // Certifique-se de que bpm é um número

  if (bpm > 240) {
    pulseStatus = 'Muito Alto';
    recommendation = 'Batimentos estão muito ALTO.';
    recommendationClass = 'high';
  } else if (bpm > 90) {
    pulseStatus = 'Alto';
    recommendation = 'Batimentos estão ALTO.';
    recommendationClass = 'high';
  } else if (bpm >= 50) {
    pulseStatus = 'Normal';
    recommendation = 'Batimento estão OK.';
    recommendationClass = 'normal';
  } else if (bpm >= 30) {
    pulseStatus = 'Baixo';
    recommendation = 'Batiments estão BAIXOS';
    recommendationClass = 'low';
  } else {
    pulseStatus = 'Muito Baixo';
    recommendation = 'Batimentos estão muito BAIXOS';
    recommendationClass = 'low';
  }

  pulseStatusElement.textContent = `Status: ${pulseStatus}`;
  recommendationElement.textContent = `Recomendação: ${recommendation}`;
  recommendationElement.className = `recommendation ${recommendationClass}`;
}
