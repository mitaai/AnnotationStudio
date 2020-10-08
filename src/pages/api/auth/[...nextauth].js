/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import fetch from 'isomorphic-unfetch';
import sendVerificationRequestOverride from '../../../utils/verificationUtil';
import Models from '../../../models';

const options = {
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

  adapter: Adapters.TypeORM.Adapter(process.env.MONGODB_URI,
    {
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

  jwt: {
    secret: process.env.AUTH_SECRET,
    raw: true,
  },

  pages: {
    newUser: '/user/newuser',
    signIn: '/auth/email-signin',
  },

  callbacks: {
    jwt: async (token, user) => {
      const isSignIn = !!(user);
      if (isSignIn) {
        token.auth_time = Number(new Date());
        token.id = user.id;
      }
      return Promise.resolve(token);
    },

    session: async (session, sessionToken) => {
      const { id } = sessionToken;
      const url = `${process.env.SITE}/api/user/${id}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (res.status === 200) {
        const user = await res.json();
        session.user.id = id;
        session.user.name = user.name;
        session.user.groups = user.groups;
      } else {
        return Promise.reject();
      }
      return Promise.resolve(session);
    },
  },

};

export default (req, res) => NextAuth(req, res, options);
