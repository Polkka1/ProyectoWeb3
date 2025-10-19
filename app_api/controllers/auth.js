const mongoose = require('mongoose');
const users = mongoose.model('user');

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email y contraseña son requeridos.' });
    }
    const emailLower = String(email).toLowerCase();
    if (!emailLower.endsWith('usfq.edu.ec')) {
      return res.status(400).json({ status: 'error', message: 'Debes usar tu email institucional de USFQ.' });
    }

    const user = await users.findOne({ email: emailLower }).lean();
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas.' });
    }
    // NOTE: For class project only; in production, hash and compare securely
    if (user.password !== password) {
      return res.status(401).json({ status: 'error', message: 'Credenciales inválidas.' });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Autenticación exitosa',
      user: { id: user._id, name: user.name, email: user.email, userid: user.userid }
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Error del servidor', error: err.message });
  }
};

module.exports = { login };

// POST /api/auth/register and used by /api/users
const register = async (req, res) => {
  try {
    let { name, email, password, lastname } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ status: 'error', message: 'Name, email, and password are required.' });
    }
    const emailLower = String(email).toLowerCase();
    if (!emailLower.endsWith('usfq.edu.ec')) {
      return res.status(400).json({ status: 'error', message: 'Debes usar tu email institucional de USFQ.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ status: 'error', message: 'La contraseña debe tener al menos 8 caracteres.' });
    }
    // Generate incremental userid
    let maxUser = await users.findOne({}, {}, { sort: { userid: -1 } });
    let nextUserId = maxUser ? maxUser.userid + 1 : 100000;

    const newUser = new users({
      name,
      lastname,
      email: emailLower,
      password, // NOTE: plaintext for class project; hash in production
      userid: nextUserId
    });
    await newUser.save();
    return res.status(201).json({
      status: 'success',
      message: 'Usuario creado exitosamente.',
      user: { id: newUser._id, name: newUser.name, email: newUser.email, userid: newUser.userid }
    });
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ status: 'error', message: 'Ya existe un usuario con ese email o ID.' });
    }
    if (err && err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ status: 'error', message: messages.join('. ') });
    }
    return res.status(500).json({ status: 'error', message: 'Error al crear usuario.', error: err.message });
  }
};

module.exports.register = register;
