const axios = require('axios');

// GET login page
const loginGet = (req, res, next) => {
  const nextUrl = req.query.next || '/me/items';
  res.render('auth/login', { 
    title: 'Iniciar Sesión - CampuSwap',
    error: null,
    formData: {},
    nextUrl
  });
};

// POST login
const loginPost = async (req, res, next) => {
  const { email, password, nextUrl } = req.body;
  if (!email || !password) {
    return res.render('auth/login', {
      title: 'Iniciar Sesión - CampuSwap',
      error: 'Por favor completa todos los campos',
      formData: { email },
      nextUrl: nextUrl || '/me/items'
    });
  }
  const apiUrl = `${req.protocol}://${req.get('host')}/api/auth/login`;
  try {
    const { data } = await axios.post(apiUrl, { email, password });
    // Set session
    req.session.user = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      userid: data.user.userid
    };
    // Persist session before redirect
    req.session.save(() => {
      return res.redirect(nextUrl || '/me/items');
    });
  } catch (err) {
    console.error('Login error:', err.message);
    const errorMessage = err.response?.data?.message || 'Email o contraseña incorrectos';
    return res.render('auth/login', {
      title: 'Iniciar Sesión - CampuSwap',
      error: errorMessage,
      formData: { email },
      nextUrl: nextUrl || '/me/items'
    });
  }
};

// GET register page
const registerGet = (req, res, next) => {
  res.render('auth/register', { 
    title: 'Registrarse - CampuSwap',
    error: null,
    success: null,
    formData: {}
  });
};

// POST register
const registerPost = async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;
  
  // Basic validation
  const errors = [];
  
  if (!name) errors.push('El nombre es requerido');
  if (!email) errors.push('El email es requerido');
  if (!password) errors.push('La contraseña es requerida');
  if (!confirmPassword) errors.push('Confirma tu contraseña');
  
  if (email && !email.includes('@usfq.edu.ec')) {
    errors.push('Debes usar tu email institucional de USFQ');
  }
  
  if (password && password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  }
  
  if (password && confirmPassword && password !== confirmPassword) {
    errors.push('Las contraseñas no coinciden');
  }
  
  if (errors.length > 0) {
    return res.render('auth/register', {
      title: 'Registrarse - CampuSwap',
      error: errors.join('. '),
      success: null,
      formData: { name, email }
    });
  }
  
  try {
    const apiUrl = `${req.protocol}://${req.get('host')}/api/auth/register`;
    await axios.post(apiUrl, { name, email, password });
    return res.render('auth/register', {
      title: 'Registrarse - CampuSwap',
      error: null,
      success: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
      formData: {}
    });
  } catch (err) {
    console.error('Register error:', err.message);
    const errorMessage = err.response?.data?.message || 'No se pudo crear la cuenta';
    return res.render('auth/register', {
      title: 'Registrarse - CampuSwap',
      error: errorMessage,
      success: null,
      formData: { name, email }
    });
  }
};

// GET logout
const logout = (req, res, next) => {
  if (!req.session) return res.redirect('/');
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = {
  loginGet,
  loginPost,
  registerGet,
  registerPost,
  logout
};