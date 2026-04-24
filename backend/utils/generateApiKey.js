const crypto = require('crypto');

module.exports = () => {
  return 'api_' + crypto.randomBytes(16).toString('hex');
};
