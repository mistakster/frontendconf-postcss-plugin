const postcss = require('postcss');
const parseColor = require('parse-color');

const compare = (source) => (target) => (colorType) => (
  source[colorType] === target[colorType]
);

/**
 * @param {Object} options
 * @returns {Function}
 */
function plugin(options) {
  const fromColor = parseColor(options.from);
  const compareSource = compare(fromColor);

  return (root, result) => {
    root.walkDecls(decl => {
      const declColor = parseColor(decl.value);
      const comparator = compareSource(declColor);

      if (comparator('keyword') || comparator('hex')) {
        decl.value = options.to;
      }
    });
  };
}

module.exports = postcss.plugin('smart-color-replacer', plugin);
