import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import sendVerificationRequestOverride from '../../../utils/verificationUtil';
import Models from '../../../models';

const options = {
  site: process.env.SITE || 'http://localhost:3000',

  providers: [
    Providers.Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,

      sendVerificationRequest: ({
        identifier: email, url, token, site, provider,
      }) => {
        sendVerificationRequestOverride({
          identifier: email, url, token, site, provider,
        });
      },
    }),
  ],
  // database: process.env.MONGODB_URI,
  adapter: Adapters.TypeORM.Adapter({
    type: 'mongodb',
    url: process.env.MONGODB_URI,
    customModels: {
      User: Models.User,
    },
  }),

  session: {
    jwt: true,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.AUTH_SECRET,

  pages: {
    newUser: '/auth/newuser',
  },

};

export default (req, res) => NextAuth(req, res, options);
