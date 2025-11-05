"use strict";

const { Presensi } = require("../models");
const { Op } = require("sequelize");
const timeZone = "Asia/Jakarta";

exports.getDailyReport = async (req, res) => {
  try {
    const { nama, tanggal } = req.query; // Contoh: ?nama=Yasin&tanggal=2025-11-01
    let options = { where: {} };

    // 🔍 Filter berdasarkan nama (opsional)
    if (nama) {
      options.where.nama = {
        [Op.like]: `%${nama}%`,
      };
    }

    // 🔍 Filter berdasarkan tanggal (opsional)
    if (tanggal) {
      const startOfDay = new Date(`${tanggal}T00:00:00.000Z`);
      const endOfDay = new Date(`${tanggal}T23:59:59.999Z`);
      options.where.checkIn = { [Op.between]: [startOfDay, endOfDay] };
    }

    // Urutkan dari checkIn terbaru
    options.order = [["checkIn", "DESC"]];

    // Ambil data dari database
    const records = await Presensi.findAll(options);

    if (records.length === 0) {
      return res.status(404).json({
        message: "Tidak ada data presensi ditemukan untuk filter yang diberikan.",
      });
    }

    // 🕒 Format tanggal laporan (1/11/2025)
    const reportDate = new Date().toLocaleDateString("id-ID", { timeZone });

    // Kirim hasil sesuai format yang kamu mau
    res.json({
      reportDate: reportDate,
      total: records.length,
      data: records, // biarkan data mentah tanpa format waktu agar seperti contohmu
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil laporan presensi.",
      error: error.message,
    });
  }
};