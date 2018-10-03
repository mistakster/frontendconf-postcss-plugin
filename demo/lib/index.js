const postcss = require('postcss');
const cssTree = require('css-tree');
const parseColor = require('parse-color');

function getColorFormat(color) {
  if (color.indexOf('rgb(') === 0) {
    return 'rgb';
  } else if (color.indexOf('rgba(') === 0) {
    return 'rgba';
  } else if (color.indexOf('hsl(') === 0) {
    return 'hsl';
  } else if (color.indexOf('hsla(') === 0) {
    return 'hsla';
  } else if (color.indexOf('#') === 0) {
    return 'hex';
  } else {
    return 'keyword';
  }
}

function parseColorWithFormat(color) {
  const data = parseColor(color);
  const colorFormat = getColorFormat(color);

  if (data.keyword) {
    data.keyword = data.keyword.replace(/grey/, 'gray');
  }

  return {
    colorFormat,
    ...data
  };
}

const identifierVisitor = (source) => (target) => (node, item, list) => {
  if (node.name.toLowerCase() === source.keyword.toLowerCase()) {
    switch (target.colorFormat) {
      case 'hex':
        const data = cssTree.fromPlainObject({
          type: 'HexColor',
          value: target.hex.substr(1)
        });
        list.replace(item, list.createItem(data));
        break;
      case 'keyword':
        node.name = target.keyword;
        break;
      default:
        throw new Error('Unknown target color format');
    }
  }
};

const hexColorVisitor = (source) => (target) => (node, item, list) => {
  if ('#' + node.value.toLowerCase() === source.hex.toLowerCase()) {
    switch (target.colorFormat) {
      case 'hex':
        node.value = target.hex.substr(1);
        break;
      case 'keyword':
        const data = cssTree.fromPlainObject({
          type: 'Identifier',
          name: target.keyword
        });
        list.replace(item, list.createItem(data));
        break;
      default:
        throw new Error('Unknown target color format');
    }
  }
};

/**
 * @param {Object} options
 * @returns {Function}
 */
function plugin(options) {
  const fromColor = parseColorWithFormat(options.from);
  const toColor = parseColorWithFormat(options.to);
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
