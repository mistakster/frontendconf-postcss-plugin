const postcss = require('postcss');

/**
 * @param {Object} options
 * @returns {Function}
 */
function plugin(options) {
  return (root, result) => {
  };
}

module.exports = postcss.plugin('smart-color-replacer', plugin);
