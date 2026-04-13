document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
  }

  /* ------------------------------------------------
     Top-surface hit detection
     The icing is an ellipse — center ≈ (125, 47),
     semi-x ≈ 115, semi-y ≈ 42.
     Only allow placement in the upper visible portion.
     ------------------------------------------------ */
  function isOnCakeTop(x, y) {
    var cx = 125, cy = 47, rx = 115, ry = 42;
    var norm =
      ((x - cx) * (x - cx)) / (rx * rx) +
      ((y - cy) * (y - cy)) / (ry * ry);
    return norm <= 1 && y <= 52;
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    if (isOnCakeTop(left, top)) {
      addCandle(left, top);
    }
  });

  /* ------------------------------------------------
     Auto-place 19 lit candles on page load
     Arranged in 4 rows across the icing surface:
       Row 1:  3 candles  (top arc, narrow)
       Row 2:  5 candles
       Row 3:  6 candles  (widest)
       Row 4:  5 candles
     ------------------------------------------------ */
  (function autoPlaceCandles() {
    var cx = 125;
    var rows = [
      { y: 10, count: 3, rx: 45 },
      { y: 18, count: 5, rx: 72 },
      { y: 27, count: 6, rx: 90 },
      { y: 36, count: 5, rx: 78 },
    ];
    rows.forEach(function (row) {
      for (var i = 0; i < row.count; i++) {
        var t = row.count === 1 ? 0 : (i / (row.count - 1)) * 2 - 1;
        addCandle(cx + t * row.rx, row.y);
      }
    });
  })();

  /* ================================================
     Microphone blow detection — ORIGINAL LOGIC
     ================================================ */
  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40; //
  }

  function blowOutCandles() {
    let blownOut = 0;

    if (isBlowing()) {
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.5) {
          candle.classList.add("out");
          blownOut++;
        }
      });
    }

    if (blownOut > 0) {
      updateCandleCount();
    }
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
  }
});
