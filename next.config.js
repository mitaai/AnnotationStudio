module.exports = {
  webpack: (config) => {
    config.externals.push('mongodb-client-encryption');
    return config;
  },
  target: 'serverless',
};
