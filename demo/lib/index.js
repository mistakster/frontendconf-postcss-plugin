const postcss = require('postcss');

/**
 * @param {Object} options
 * @returns {Function}
 */
function plugin(options) {
  return (root, result) => {
    root.walkDecls(decl => {
      if (decl.value === options.from) {
        decl.value = options.to;
      }
    });
  };
}

module.exports = postcss.plugin('smart-color-replacer', plugin);
