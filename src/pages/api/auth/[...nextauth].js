/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import sendVerificationRequestOverride from '../../../utils/verificationUtil';
import Models from '../../../models';

const options = {
  providers: [
    Providers.Email({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,

      sendVerificationRequest: sendVerificationRequestOverride,
    }),
  ],

  adapter: Adapters.TypeORM.Adapter(
    {
      type: 'mongodb',
      url: process.env.MONGODB_URI,
      w: 'majority',
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
    },
    {
      models: {
        User: Models.User,
      },
    },
  ),

  debug: true,

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
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
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
      // eslint-disable-next-line no-undef
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
        session.user.firstName = user.firstName;
        session.user.groups = user.groups;
        session.user.role = user.role ? user.role : 'user';
      } else {
        return Promise.reject();
      }
      return Promise.resolve(session);
    },
  },

};

export default (req, res) => NextAuth(req, res, options);
