const db = require('../config/database');

exports.getAll = async (req, res) => {
  const types = await db('coworking_space_types').where({ is_active: true }).orderBy('price_per_hour');
  res.json(types);
};

exports.getAllAdmin = async (req, res) => {
  const types = await db('coworking_space_types').orderBy('created_at', 'desc');
  res.json(types);
};

exports.create = async (req, res) => {
  const { name, description, price_per_hour, color } = req.body;
  if (!name || !price_per_hour)
    return res.status(400).json({ error: 'Nombre y precio son requeridos' });

  const [id] = await db('coworking_space_types').insert({ name, description, price_per_hour, color: color || '#3B82F6' });
  const created = await db('coworking_space_types').where({ id }).first();
  res.status(201).json(created);
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { name, description, price_per_hour, color, is_active } = req.body;

  await db('coworking_space_types').where({ id }).update({ name, description, price_per_hour, color, is_active });
  const updated = await db('coworking_space_types').where({ id }).first();
  res.json(updated);
};

exports.remove = async (req, res) => {
  const { id } = req.params;
  await db('coworking_space_types').where({ id }).update({ is_active: false });
  res.json({ message: 'Tipo de espacio desactivado' });
};
