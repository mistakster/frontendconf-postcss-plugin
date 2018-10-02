const postcss = require('postcss');
const plugin = require('../lib/index');

/**
 * A helper which let us reduce boilerplate code invoking PostCSS
 * @param {String} css to process
 * @param {Object} options for the plugin
 * @returns {Promise<String>}
 */
function process(css, options) {
  return postcss()
    .use(plugin(options))
    .process(css, { from: undefined })
    .then(result => result.css.toString());
}

// https://jestjs.io/docs/en/api
describe('Smart color replacer', () => {
  it('should work for keyword', () => {
    const options = {
      from: 'darkslategray',
      to: '#556832',
    };

    const css = 'div { color: darkslategray; } p { background: black; }';

    return process(css, options)
      .then(result => {
        // https://jestjs.io/docs/en/expect
        expect(result).toBe(
          'div { color: #556832; } p { background: black; }'
        );
      });
  });

  it('should work for hex', () => {
    const options = {
      from: 'darkslategray',
      to: '#556832',
    };

    const css = 'div { color: #2F4F4F; } p { background: black; }';

    return process(css, options)
      .then(result => {
        expect(result).toBe(
          'div { color: #556832; } p { background: black; }'
        );
      });
  });
});
