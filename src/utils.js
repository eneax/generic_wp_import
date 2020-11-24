const unified = require("unified");
const parse = require("rehype-parse");
const mutate = require("rehype-remark");
const stringify = require("remark-stringify");

const proMark = (input) => {
  let content = "";
  unified()
    .use(parse)
    .use(mutate)
    .use(stringify, {})
    .process(input, function (err, payload) {
      if (err) console.log(err);
      content = String(payload);
    });
  return content;
};

const pickConstructor = (data) => (input, wp = true) =>
  wp ? data[0][`wp:${input}`] : data[0][input];
const attrConstructor = (post) => (input, enumerable = false) =>
  enumerable ? post[input] : post[input][0];

const isHTML = (input) => /<\/p>/gi.test(input);

export { proMark, pickConstructor, isHTML, attrConstructor };
