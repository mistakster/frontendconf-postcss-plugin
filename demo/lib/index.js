const postcss = require('postcss');
const cssTree = require('css-tree');
const parseColor = require('parse-color');

const identifierVisitor = (source) => (target) => (node, item, list) => {
  if (node.name.toLowerCase() === source.keyword.toLowerCase()) {
    const data = cssTree.fromPlainObject({
      type: 'HexColor',
      value: target.hex.substr(1)
    });
    list.replace(item, list.createItem(data));
  }
};

const hexColorVisitor = (source) => (target) => (node, item, list) => {
  if ('#' + node.value.toLowerCase() === source.hex.toLowerCase()) {
    node.value = target.hex.substr(1);
  }
};

/**
 * @param {Object} options
 * @returns {Function}
 */
function plugin(options) {
  const fromColor = parseColor(options.from);
  const toColor = parseColor(options.to);
  const boundIdentifierVisitor = identifierVisitor(fromColor)(toColor);
  const boundHexColorVisitor = hexColorVisitor(fromColor)(toColor);

  return (root, result) => {
    root.walkDecls(decl => {
      const parsedValue = cssTree.parse(decl.value, { context: 'value' });

      cssTree.walk(parsedValue, {
        visit: 'Identifier',
        enter: boundIdentifierVisitor
      });

      cssTree.walk(parsedValue, {
        visit: 'HexColor',
        enter: boundHexColorVisitor
      });

      decl.value = cssTree.generate(parsedValue);
    });
  };
}

module.exports = postcss.plugin('smart-color-replacer', plugin);
