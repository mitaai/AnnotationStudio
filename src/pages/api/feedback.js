import { getToken } from 'next-auth/jwt';
import sgMail from '@sendgrid/mail';

const secret = process.env.AUTH_SECRET;

const handler = async (req, res) => {
  const { method } = req;
  if (method === 'POST') {
    const token = await getToken({ req, secret, raw: false });
    if (token && token.exp > 0) {
      if (req.body.name && req.body.text) {
        sgMail.setApiKey(process.env.EMAIL_SERVER_PASSWORD);
        await sgMail
          .send({
            to: process.env.SUPPORT_EMAIL,
            from: process.env.EMAIL_FROM,
            subject: `[${process.env.SITE_NAME}] Feedback submission`,
            text: `${req.body.name} writes: ${req.body.text}`,
            html: `<h5>${req.body.name} writes:</h5> <p>${req.body.text}</p>`,
          })
          .catch((error) => res.status(500).end(`Error sending feedback: ${error.message}`));
        res.status(200).json({ feedback: req.body.text });
      } else res.status(400).end('Bad request');
    } else res.status(403).end('Invalid or expired token');
  } else res.status(405).end(`Method ${method} Not Allowed`);
};

export default handler;
