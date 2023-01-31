/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import EmailProvider from 'next-auth/providers/email';
import { MongoDBAdapter } from '@next-auth/mongodb-adapter';
// import Adapters from 'next-auth/adapters';
import sendVerificationRequestOverride from '../../../utils/verificationUtil';
import clientPromise from '../../../lib/mongodb';
// import Models from '../../../models';
import { appendProtocolIfMissing } from '../../../utils/fetchUtil';

const maxAge = 30 * 24 * 60 * 60; // 30 days
const options = {
  providers: [
    EmailProvider({
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

  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.DB_NAME,
  }),

  /*
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
  */

  debug: true,

  session: {
    strategy: 'jwt',
    maxAge, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.AUTH_SECRET,

  jwt: {
    secret: process.env.AUTH_SECRET,
    raw: false,
    maxAge,
  },

  pages: {
    newUser: '/user/newuser',
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify-request',
  },

  callbacks: {
    jwt: async (session) => {
      const {
        token,
        user,
      } = session;
      const auth_time = user?.id || token?.sub ? Number(new Date()) : undefined;
      return Promise.resolve({ ...token, auth_time });
    },

    session: async (args) => {
      const { session, token } = args;

      const { sub: id } = token;
      const url = `${appendProtocolIfMissing(process.env.SITE)}/api/user/${id}`;
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
