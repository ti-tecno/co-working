const nodemailer = require('nodemailer');

const BREVO_HOST = process.env.BREVO_SMTP_SERVER || 'smtp-relay.brevo.com';
const BREVO_PORT = Number(process.env.BREVO_SMTP_PORT || 587);
const BREVO_USER = process.env.BREVO_SMTP_LOGIN;
const BREVO_PASS = (process.env.BREVO_SMTP_PASSWORD || '').trim();
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@coworking.local';

const transporter = nodemailer.createTransport({
    host: BREVO_HOST,
    port: BREVO_PORT,
    secure: BREVO_PORT === 465,
    auth: {
        user: BREVO_USER,
        pass: BREVO_PASS,
    },
    requireTLS: BREVO_PORT === 587,
});

const formatReservationDate = (dateValue) => {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return String(dateValue);
    return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const sendReservationConfirmationEmail = async ({
    toEmail,
    toName,
    reservationId,
    reservationDate,
    startTime,
    endTime,
    totalCost,
    notes,
    spaceName,
}) => {
    if (!BREVO_PASS) {
        throw new Error('BREVO_SMTP_PASSWORD no está configurada en el entorno');
    }

    const safeName = toName || 'Usuario';
    const formattedDate = formatReservationDate(reservationDate);
    const formattedCost = Number(totalCost).toFixed(2);

    const text = [
        `Hola ${safeName},`,
        '',
        'Tu reserva ha sido confirmada con éxito.',
        '',
        `ID de reserva: ${reservationId}`,
        `Espacio: ${spaceName}`,
        `Fecha: ${formattedDate}`,
        `Horario: ${startTime} - ${endTime}`,
        `Costo total: $${formattedCost} MXN`,
        `Notas: ${notes || 'Sin notas'}`,
        '',
        'Gracias por reservar con nosotros.',
    ].join('\n');

    const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <h2 style="margin-bottom: 0.5rem;">Reserva confirmada</h2>
      <p>Hola <strong>${safeName}</strong>, tu reserva ha sido confirmada con éxito.</p>
      <table style="border-collapse: collapse; margin-top: 1rem;">
        <tr><td style="padding: 6px 10px; font-weight: bold;">Espacio:</td><td style="padding: 6px 10px;">${spaceName}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Fecha:</td><td style="padding: 6px 10px;">${formattedDate}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Horario:</td><td style="padding: 6px 10px;">${startTime} - ${endTime}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Costo total:</td><td style="padding: 6px 10px;">$${formattedCost} MXN</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Notas:</td><td style="padding: 6px 10px;">${notes || 'Sin notas'}</td></tr>
      </table>
      <p style="margin-top: 1rem;">Gracias por reservar con nosotros.</p>
    </div>
  `;

    try {
        await transporter.verify();
    } catch (error) {
        const code = error && (error.code || error.responseCode || 'UNKNOWN');
        const message = error && (error.message || error.response || String(error));
        throw new Error(
            `Error de autenticación SMTP con Brevo (code: ${code}). ` +
            `Verifica BREVO_SMTP_LOGIN, BREVO_SMTP_PASSWORD y permisos de cuenta. ` +
            `Detalle: ${message}`
        );
    }

    return transporter.sendMail({
        from: EMAIL_FROM,
        to: toEmail,
        subject: 'Confirmación de reserva',
        text,
        html,
    });
};

const sendAdminReservationNotificationEmail = async ({
    reservationId,
    reservationDate,
    startTime,
    endTime,
    totalCost,
    notes,
    spaceName,
    userName,
    userEmail,
}) => {
    if (!BREVO_PASS) {
        throw new Error('BREVO_SMTP_PASSWORD no está configurada en el entorno');
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) throw new Error('ADMIN_EMAIL no está configurada en el entorno');

    const formattedDate = formatReservationDate(reservationDate);
    const formattedCost = Number(totalCost).toFixed(2);

    const text = [
        'Nueva reserva realizada.',
        '',
        `Usuario: ${userName} (${userEmail})`,
        `ID de reserva: ${reservationId}`,
        `Espacio: ${spaceName}`,
        `Fecha: ${formattedDate}`,
        `Horario: ${startTime} - ${endTime}`,
        `Costo total: $${formattedCost} MXN`,
        `Notas: ${notes || 'Sin notas'}`,
    ].join('\n');

    const html = `
    <div style="font-family: Arial, sans-serif; color: #1f2937;">
      <h2 style="margin-bottom: 0.5rem;">Nueva reserva realizada</h2>
      <table style="border-collapse: collapse; margin-top: 1rem;">
        <tr><td style="padding: 6px 10px; font-weight: bold;">Usuario:</td><td style="padding: 6px 10px;">${userName} (${userEmail})</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">ID de reserva:</td><td style="padding: 6px 10px;">${reservationId}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Espacio:</td><td style="padding: 6px 10px;">${spaceName}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Fecha:</td><td style="padding: 6px 10px;">${formattedDate}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Horario:</td><td style="padding: 6px 10px;">${startTime} - ${endTime}</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Costo total:</td><td style="padding: 6px 10px;">$${formattedCost} MXN</td></tr>
        <tr><td style="padding: 6px 10px; font-weight: bold;">Notas:</td><td style="padding: 6px 10px;">${notes || 'Sin notas'}</td></tr>
      </table>
    </div>
  `;

    return transporter.sendMail({
        from: EMAIL_FROM,
        to: adminEmail,
        subject: `Nueva reserva: ${spaceName} — ${formattedDate}`,
        text,
        html,
    });
};

module.exports = {
    sendReservationConfirmationEmail,
    sendAdminReservationNotificationEmail,
};
