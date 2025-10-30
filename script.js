let model, webcam, labelContainer, maxPredictions;
let alertCooldown = false;

async function init() {
  const modelURL = "my_model/model.json";
  const metadataURL = "my_model/metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true; // lật ngược để hiển thị như gương
  webcam = new tmImage.Webcam(300, 300, flip);
  await webcam.setup();
  await webcam.play();
  window.requestAnimationFrame(loop);

  document.getElementById("webcam-container").appendChild(webcam.canvas);
  labelContainer = document.getElementById("label-container");
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.appendChild(document.createElement("div"));
  }
}

async function loop() {
  webcam.update();
  await predict();
  window.requestAnimationFrame(loop);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);
  let fallDetected = false;

  for (let i = 0; i < maxPredictions; i++) {
    const className = prediction[i].className;
    const probability = prediction[i].probability.toFixed(2);
    labelContainer.childNodes[i].innerHTML = `${className}: ${probability}`;

    if (className.toLowerCase().includes("té") && probability > 0.9) {
      fallDetected = true;
    }
  }

  if (fallDetected) playAlertSound();
}

function playAlertSound() {
  if (alertCooldown) return;
  alertCooldown = true;
  const audio = new Audio("alert.mp3");
  audio.play();
  console.warn("Falldown detection!");
  setTimeout(() => (alertCooldown = false), 5000); // 5s cooldown
}

init();
