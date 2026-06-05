require('dotenv').config({ path: require('path').join(process.cwd(), 'backend/.env') });
const nodemailer = require('nodemailer');

const BREVO_HOST = process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com';
const BREVO_PORT = Number(process.env.BREVO_SMTP_PORT || 587);
const BREVO_USER = process.env.BREVO_SMTP_USER || 'apikey';
const BREVO_SMTP_KEY = (process.env.BREVO_SMTP_KEY || '').trim();
const EMAIL_FROM = process.env.EMAIL_FROM || 'no-reply@coworking.local';
const TEST_EMAIL_TO = 'jorgeluiscazas@gmail.com';

const mask = (value) => {
    if (!value) return '(empty)';
    if (value.length <= 8) return '********';
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

(async () => {
    try {
        if (!BREVO_SMTP_KEY) {
            throw new Error('BREVO_SMTP_KEY is missing or empty in backend/.env');
        }

        console.log('[SMTP] Config summary:');
        console.log(`- host: ${BREVO_HOST}`);
        console.log(`- port: ${BREVO_PORT}`);
        console.log(`- user: ${BREVO_USER}`);
        console.log(`- key : ${mask(BREVO_SMTP_KEY)}`);

        const transporter = nodemailer.createTransport({
            host: BREVO_HOST,
            port: BREVO_PORT,
            secure: BREVO_PORT === 465,
            auth: {
                user: BREVO_USER,
                pass: BREVO_SMTP_KEY,
            },
            requireTLS: BREVO_PORT === 587,
        });

        await transporter.verify();
        console.log('[SMTP] VERIFY_OK');

        const info = await transporter.sendMail({
            from: EMAIL_FROM,
            to: TEST_EMAIL_TO,
            subject: 'Test email from coworking backend',
            text: 'This is a test email sent via Brevo SMTP from the coworking backend.',
            html: '<p>This is a <strong>test email</strong> sent via Brevo SMTP from the coworking backend.</p>',
        });

        console.log('[SMTP] SEND_OK');
        console.log(`- messageId: ${info.messageId}`);
        console.log(`- to: ${TEST_EMAIL_TO}`);
        process.exit(0);
    } catch (error) {
        console.error('[SMTP] VERIFY_ERROR');
        console.error(error && (error.message || error));
        process.exit(1);
    }
})();
