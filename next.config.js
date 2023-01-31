module.exports = {
  webpack: (config) => {
    config.externals.push('mongodb-client-encryption');
    return config;
  },
  env: {
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DB_NAME: process.env.DB_NAME,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_FROM: process.env.EMAIL_FROM,
    MONGODB_URI: process.env.MONGODB_URI,
    NEXT_PUBLIC_IDEA_SPACE_ENABLED: process.env.NEXT_PUBLIC_IDEA_SPACE_ENABLED,
    NEXT_PUBLIC_LOGO_SVG: process.env.NEXT_PUBLIC_LOGO_SVG,
    NEXT_PUBLIC_SIGNING_URL: process.env.NEXT_PUBLIC_SIGNING_URL,
    NEXT_PUBLIC_SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME,
    NEXT_PUBLIC_TINYMCE_API_KEY: process.env.NEXT_PUBLIC_TINYMCE_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    SITE: process.env.SITE,
    SITE_NAME: process.env.SITE_NAME,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  },
};
