// 1. Ganti sumber data dari array ke model Sequelize
const { Presensi } = require("../models");
const { format } = require("date-fns-tz");
const timeZone = "Asia/Jakarta";

// --- MODIFIKASI: Impor express-validator ---
const { body, validationResult } = require("express-validator");

exports.CheckIn = async (req, res) => {
  // 2. Gunakan try...catch untuk error handling
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // 3. Ubah cara mencari data menggunakan 'findOne' dari Sequelize
    const existingRecord = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (existingRecord) {
      return res
        .status(400)
        .json({ message: "Anda sudah melakukan check-in hari ini." });
    }

    // 4. Ubah cara membuat data baru menggunakan 'create' dari Sequelize
    const newRecord = await Presensi.create({
      userId: userId,
      nama: userName,
      checkIn: waktuSekarang,
    });

    const formattedData = {
      userId: newRecord.userId,
      nama: newRecord.nama,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: null,
    };

    res.status(201).json({
      message: `Halo ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.CheckOut = async (req, res) => {
  // Gunakan try...catch
  try {
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // Cari data di database
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    // 5. Update dan simpan perubahan ke database
    recordToUpdate.checkOut = waktuSekarang;
    await recordToUpdate.save();

    const formattedData = {
      userId: recordToUpdate.userId,
      nama: recordToUpdate.nama,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

exports.deletePresensi = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }
    await recordToDelete.destroy();
    res.status(200).json({ message: "Catatan presensi berhasil dihapus." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// --- MODIFIKASI: Tambahkan aturan validasi untuk update ---
// (Catatan: Sesuai kode Anda, kita gunakan 'checkIn' dan 'checkOut', bukan 'waktuCheckIn')
exports.validateUpdatePresensi = [
  body("checkIn")
    .optional({ nullable: true }) // Izinkan field tidak ada, atau nilainya null
    .isISO8601() // Jika ada dan bukan null, harus format ISO8601
    .toDate() // Konversi string tanggal valid menjadi objek Date
    .withMessage("Format checkIn harus tanggal yang valid (ISO8601)."),

  body("checkOut")
    .optional({ nullable: true }) // Izinkan field tidak ada, atau nilainya null
    .isISO8601() // Jika ada dan bukan null, harus format ISO8601
    .toDate() // Konversi string tanggal valid menjadi objek Date
    .withMessage("Format checkOut harus tanggal yang valid (ISO8601)."),
];

// --- MODIFIKASI: Terapkan validasi di dalam fungsi updatePresensi ---
exports.updatePresensi = async (req, res) => {
  // 1. Jalankan pengecekan validasi
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Jika ada error, kirim respons 400 Bad Request
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const presensiId = req.params.id;
    // req.body sekarang berisi data yang sudah divalidasi dan disanitasi
    // (string tanggal sudah diubah menjadi objek Date oleh .toDate())
    const { checkIn, checkOut, nama } = req.body;

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }

    // 2. Gunakan logika update yang lebih aman
    // Kita cek apakah properti *benar-benar ada* di body
    // Ini lebih aman daripada 'checkIn || recordToUpdate.checkIn'
    // karena memperbolehkan update ke 'null'
    let updateData = {};

    if (req.body.hasOwnProperty("checkIn")) {
      updateData.checkIn = checkIn;
    }
    if (req.body.hasOwnProperty("checkOut")) {
      updateData.checkOut = checkOut;
    }
    if (req.body.hasOwnProperty("nama")) {
      updateData.nama = nama;
    }

    // 3. Cek apakah ada sesuatu untuk di-update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut, atau nama).",
      });
    }

    // 4. Terapkan update dan simpan
    recordToUpdate.set(updateData);
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};