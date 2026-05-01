require('dotenv').config();
const db = require('./database');

async function migrate() {
  console.log('🚀 Iniciando migración de base de datos...');

  if (!(await db.schema.hasTable('coworking_users'))) {
    await db.schema.createTable('coworking_users', (t) => {
      t.increments('id').primary();
      t.string('name', 100).notNullable();
      t.string('email', 150).notNullable().unique();
      t.string('password', 255).nullable();
      t.enu('role', ['user', 'admin']).defaultTo('user');
      t.string('google_id', 100).nullable();
      t.timestamps(true, true);
    });
    console.log('✅ Tabla coworking_users creada');
  } else {
    console.log('⏭️  Tabla coworking_users ya existe, omitiendo');
  }

  if (!(await db.schema.hasTable('coworking_space_types'))) {
    await db.schema.createTable('coworking_space_types', (t) => {
      t.increments('id').primary();
      t.string('name', 100).notNullable();
      t.text('description').nullable();
      t.decimal('price_per_hour', 10, 2).notNullable();
      t.string('color', 20).defaultTo('#3B82F6');
      t.boolean('is_active').defaultTo(true);
      t.timestamps(true, true);
    });
    console.log('✅ Tabla coworking_space_types creada');
  } else {
    console.log('⏭️  Tabla coworking_space_types ya existe, omitiendo');
  }

  if (!(await db.schema.hasTable('coworking_reservations'))) {
    await db.schema.createTable('coworking_reservations', (t) => {
      t.increments('id').primary();
      t.integer('user_id').unsigned().notNullable().references('id').inTable('coworking_users').onDelete('CASCADE');
      t.integer('space_type_id').unsigned().notNullable().references('id').inTable('coworking_space_types').onDelete('RESTRICT');
      t.date('reservation_date').notNullable();
      t.time('start_time').notNullable();
      t.time('end_time').notNullable();
      t.decimal('total_cost', 10, 2).notNullable();
      t.enu('status', ['active', 'cancelled']).defaultTo('active');
      t.text('notes').nullable();
      t.timestamps(true, true);
    });
    console.log('✅ Tabla coworking_reservations creada');
  } else {
    console.log('⏭️  Tabla coworking_reservations ya existe, omitiendo');
  }

  if (!(await db.schema.hasTable('coworking_contact_messages'))) {
    await db.schema.createTable('coworking_contact_messages', (t) => {
      t.increments('id').primary();
      t.string('name', 100).notNullable();
      t.string('email', 150).notNullable();
      t.text('message').notNullable();
      t.boolean('read').defaultTo(false);
      t.timestamps(true, true);
    });
    console.log('✅ Tabla coworking_contact_messages creada');
  } else {
    console.log('⏭️  Tabla coworking_contact_messages ya existe, omitiendo');
  }

  const existingTypes = await db('coworking_space_types').count('id as count').first();
  if (existingTypes.count === 0) {
    await db('coworking_space_types').insert([
      { name: 'Mesa Sencilla', description: 'Escritorio individual en área abierta', price_per_hour: 50, color: '#10B981' },
      { name: 'Mesa con Monitor', description: 'Escritorio con monitor 24" incluido', price_per_hour: 80, color: '#3B82F6' },
      { name: 'Sala de Juntas', description: 'Sala privada para hasta 10 personas', price_per_hour: 200, color: '#8B5CF6' },
    ]);
    console.log('✅ Tipos de espacio iniciales insertados');
  }

  const bcrypt = require('bcryptjs');
  const adminExists = await db('coworking_users').where({ email: 'admin@coworking.com' }).first();
  if (!adminExists) {
    const hash = await bcrypt.hash('Admin123!', 12);
    await db('coworking_users').insert({
      name: 'Administrador',
      email: 'admin@coworking.com',
      password: hash,
      role: 'admin',
    });
    console.log('✅ Usuario admin creado (admin@coworking.com / Admin123!)');
  }

  console.log('\n🎉 Migración completada exitosamente');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('❌ Error en migración:', err);
  process.exit(1);
});
