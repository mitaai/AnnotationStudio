/* eslint-disable no-param-reassign */
import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import Adapters from 'next-auth/adapters';
import sendVerificationRequestOverride from '../../../utils/verificationUtil';
import Models from '../../../models';
import { appendProtocolIfMissing } from '../../../utils/fetchUtil';

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
    jwt: async (token, profile) => {
      if (profile) {
        token.auth_time = Date.now();
        token.id = profile.id;
        const url = `${appendProtocolIfMissing(process.env.SITE)}/api/user/${profile.id}`;
        // eslint-disable-next-line no-undef
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (res.ok) {
          const user = await res.json();
          token.user = {
            id: profile.id,
            email: profile.email,
            name: user.name,
            firstName: user.firstName,
            groups: user.groups,
            role: user.role ?? 'user',
          };
        }
      }
      return token;
    },

    session: async (session, jwt) => {
      session.user = jwt.user;
      return session;
    },
  },

};

export default (req, res) => NextAuth(req, res, options);
