import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import fetch from 'isomorphic-unfetch';
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

  callbacks: {
    session: async (session) => {
      const { email } = session.user;
      const url = `${process.env.SITE}/api/user/${email}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.status === 200) {
        const user = await res.json();
        // eslint-disable-next-line no-param-reassign
        session.user.name = user.name;
      }
      return Promise.resolve(session);
    },
  },

};

export default (req, res) => NextAuth(req, res, options);
