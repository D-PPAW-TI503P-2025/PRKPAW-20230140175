exports.testConnection = (req, res) => {
  const { deviceId, message, uptime } = req.body;

  console.log(`📡 [IOT] Device: ${deviceId}`);
  console.log(`💬 Pesan: ${message}`);
  console.log(`⏱️ Uptime: ${uptime} ms`);

  res.status(200).json({
    status: "ok",
    reply: "Server menerima koneksi!"
  });
};


exports.receiveSensorData = (req, res) => {
  const { suhu, kelembaban, cahaya, alert } = req.body;

  console.log(
    `🔥 [SENSOR] Suhu: ${suhu}°C | Lembab: ${kelembaban}% | Cahaya: ${cahaya} | Status: ${alert}`
  );

  res.status(200).json({ status: "diterima" });
};
