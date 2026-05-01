const db = require('../config/database');

exports.create = async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const [id] = await db('coworking_contact_messages').insert({ name, email, message });
  res.status(201).json({ message: 'Mensaje enviado exitosamente', id });
};

exports.getAll = async (req, res) => {
  const messages = await db('coworking_contact_messages').orderBy('created_at', 'desc');
  res.json(messages);
};

exports.markRead = async (req, res) => {
  const { id } = req.params;
  await db('coworking_contact_messages').where({ id }).update({ read: true });
  res.json({ message: 'Marcado como leído' });
};
