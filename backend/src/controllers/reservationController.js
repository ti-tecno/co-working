const db = require('../config/database');

const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;

const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

exports.getMyReservations = async (req, res) => {
  const reservations = await db('coworking_reservations')
    .join('coworking_space_types', 'coworking_reservations.space_type_id', 'coworking_space_types.id')
    .where('coworking_reservations.user_id', req.user.id)
    .select(
      'coworking_reservations.*',
      'coworking_space_types.name as space_name',
      'coworking_space_types.color as space_color',
      'coworking_space_types.price_per_hour'
    )
    .orderBy('reservation_date', 'desc');
  res.json(reservations);
};

exports.getAllReservations = async (req, res) => {
  const reservations = await db('coworking_reservations')
    .join('coworking_space_types', 'coworking_reservations.space_type_id', 'coworking_space_types.id')
    .join('coworking_users', 'coworking_reservations.user_id', 'coworking_users.id')
    .select(
      'coworking_reservations.*',
      'coworking_space_types.name as space_name',
      'coworking_space_types.color as space_color',
      'coworking_users.name as user_name',
      'coworking_users.email as user_email'
    )
    .orderBy('reservation_date', 'desc');
  res.json(reservations);
};

exports.getAvailability = async (req, res) => {
  const { date, space_type_id } = req.query;
  if (!date || !space_type_id)
    return res.status(400).json({ error: 'Fecha y tipo de espacio requeridos' });

  const reserved = await db('coworking_reservations')
    .where({ reservation_date: date, space_type_id, status: 'active' })
    .select('start_time', 'end_time');

  res.json({ reserved });
};

exports.create = async (req, res) => {
  const { space_type_id, reservation_date, start_time, end_time, notes } = req.body;

  if (!space_type_id || !reservation_date || !start_time || !end_time)
    return res.status(400).json({ error: 'Todos los campos son requeridos' });

  const startMin = timeToMinutes(start_time);
  const endMin = timeToMinutes(end_time);

  if (startMin < OPEN_HOUR * 60 || endMin > CLOSE_HOUR * 60)
    return res.status(400).json({ error: 'Horario fuera del rango permitido (9:00 - 18:00)' });

  if (startMin >= endMin)
    return res.status(400).json({ error: 'La hora de inicio debe ser anterior a la hora de fin' });

  const conflict = await db('coworking_reservations')
    .where({ space_type_id, reservation_date, status: 'active' })
    .where(function () {
      this.where('start_time', '<', end_time).andWhere('end_time', '>', start_time);
    })
    .first();

  if (conflict)
    return res.status(409).json({ error: 'El espacio ya está reservado en ese horario' });

  const spaceType = await db('coworking_space_types').where({ id: space_type_id }).first();
  if (!spaceType) return res.status(404).json({ error: 'Tipo de espacio no encontrado' });

  const hours = (endMin - startMin) / 60;
  const total_cost = parseFloat((spaceType.price_per_hour * hours).toFixed(2));

  const [id] = await db('coworking_reservations').insert({
    user_id: req.user.id,
    space_type_id,
    reservation_date,
    start_time,
    end_time,
    total_cost,
    notes,
    status: 'active',
  });

  const created = await db('coworking_reservations').where({ id }).first();
  res.status(201).json(created);
};

exports.cancel = async (req, res) => {
  const { id } = req.params;
  const reservation = await db('coworking_reservations').where({ id }).first();

  if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });

  const isOwner = reservation.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin)
    return res.status(403).json({ error: 'No tienes permiso para cancelar esta reserva' });

  await db('coworking_reservations').where({ id }).update({ status: 'cancelled' });
  res.json({ message: 'Reserva cancelada exitosamente' });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const { space_type_id, reservation_date, start_time, end_time, notes, status } = req.body;

  const reservation = await db('coworking_reservations').where({ id }).first();
  if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });

  let total_cost = reservation.total_cost;
  if (start_time && end_time && space_type_id) {
    const spaceType = await db('coworking_space_types').where({ id: space_type_id }).first();
    const hours = (timeToMinutes(end_time) - timeToMinutes(start_time)) / 60;
    total_cost = parseFloat((spaceType.price_per_hour * hours).toFixed(2));
  }

  await db('coworking_reservations').where({ id }).update({
    space_type_id: space_type_id || reservation.space_type_id,
    reservation_date: reservation_date || reservation.reservation_date,
    start_time: start_time || reservation.start_time,
    end_time: end_time || reservation.end_time,
    notes: notes !== undefined ? notes : reservation.notes,
    status: status || reservation.status,
    total_cost,
  });

  const updated = await db('coworking_reservations').where({ id }).first();
  res.json(updated);
};
