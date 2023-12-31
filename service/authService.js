const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { client } = require('../connection/db');

const registerService = async (request, h) => {
  try {
    const {
      username, email, password, name,
    } = request.payload;

    // Validasi input
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30)
        .required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      name: Joi.string().required(),
    });

    const validationResult = schema.validate({
      username, email, password, name,
    });
    if (validationResult.error) {
      return h.response({ message: validationResult.error.details[0].message }).code(400);
    }

    // Cek apakah alamat email sudah terdaftar
    const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
    const emailResult = await client.query(checkEmailQuery, [email]);

    if (emailResult.rows.length > 0) {
      return h.response({ message: 'Alamat email sudah terdaftar. Gunakan alamat email lain.' }).code(409);
    }

    // Hash password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Simpan data registrasi ke database
    const query = 'INSERT INTO users (username, email, password, name) VALUES ($1, $2, $3, $4)';
    const values = [username, email, hashedPassword, name];
    await client.query(query, values);

    return h.response({ message: 'Registrasi berhasil', email, name }).code(201);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Terjadi kesalahan internal' }).code(500);
  }
};

const loginService = async (request, h) => {
  try {
    const { username, password } = request.payload;

    // Validasi input
    const schema = Joi.object({
      username: Joi.string().alphanum().min(3).max(30)
        .required(),
      password: Joi.string().min(6).required(),
    });

    const validationResult = schema.validate({ username, password });
    if (validationResult.error) {
      return h.response(validationResult.error.details[0].message).code(400);
    }

    // Ambil data pengguna dari database
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await client.query(query, [username]);

    if (result.rows.length === 0) {
      return h.response({ message: 'Login gagal. Pengguna tidak ditemukan.' }).code(401);
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, result.rows[0].password);
    if (!isValidPassword) {
      return h.response({ message: 'Login gagal. Password salah.' }).code(401);
    }

    const secretKey = randomUUID.toString();

    // Buat token JWT
    const user = { id: result.rows[0].id, username: result.rows[0].username, email: result.rows[0].email };
    const token = jwt.sign(user, secretKey, { expiresIn: '1h' });

    return h.response({ token }).code(200);
  } catch (error) {
    console.error(error);
    return h.response({ message: 'Terjadi kesalahan internal' }).code(500);
  }
};

module.exports = { registerService, loginService };
