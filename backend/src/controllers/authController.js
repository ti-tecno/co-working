const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const generateToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const exists = await db('coworking_users').where({ email }).first();
  if (exists) return res.status(409).json({ error: 'El email ya está registrado' });

  const hash = await bcrypt.hash(password, 12);
  const [id] = await db('coworking_users').insert({ name, email, password: hash, role: 'user' });
  const user = await db('coworking_users').where({ id }).first();

  res.status(201).json({ token: generateToken(user), user: sanitize(user) });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email y contraseña requeridos' });

  const user = await db('coworking_users').where({ email }).first();
  if (!user || !user.password)
    return res.status(401).json({ error: 'Credenciales inválidas' });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

  res.json({ token: generateToken(user), user: sanitize(user) });
};

exports.me = async (req, res) => {
  res.json({ user: sanitize(req.user) });
};

const sanitize = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role });
