const axios = require('axios');

// GET login page
const loginGet = (req, res, next) => {
  res.render('auth/login', { 
    title: 'Iniciar Sesión - CampuSwap',
    error: null,
    formData: {}
  });
};

// POST login
const loginPost = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('auth/login', {
      title: 'Iniciar Sesión - CampuSwap',
      error: 'Por favor completa todos los campos',
      formData: { email }
    });
  }
  const apiUrl = `${req.protocol}://${req.get('host')}/api/auth/login`;
  try {
    await axios.post(apiUrl, { email, password });
    // Success → redirect to dashboard (session handling could be added later)
    return res.redirect('/me/items');
  } catch (err) {
    console.error('Login error:', err.message);
    const errorMessage = err.response?.data?.message || 'Email o contraseña incorrectos';
    return res.render('auth/login', {
      title: 'Iniciar Sesión - CampuSwap',
      error: errorMessage,
      formData: { email }
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
const registerPost = (req, res, next) => {
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
  
  // Placeholder registration logic
  // In a real app, you would save to database here
  console.log('New user registration attempt:', { name, email });
  
  res.render('auth/register', {
    title: 'Registrarse - CampuSwap',
    error: null,
    success: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
    formData: {}
  });
};

// GET logout
const logout = (req, res, next) => {
  // In a real app, you would destroy the session here
  console.log('User logout');
  res.redirect('/');
};

module.exports = {
  loginGet,
  loginPost,
  registerGet,
  registerPost,
  logout
};