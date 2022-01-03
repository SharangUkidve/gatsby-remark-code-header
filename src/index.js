"use strict";

const visit = require(`unist-util-visit`);

const getComputedClassName = (staticClassName, ...dynamicClassNames) => {
  return [staticClassName, ...dynamicClassNames]
    .filter(
      (className) =>
        className && typeof className === `string` && className?.trim().length
    )
    .map((className) => className.trim())
    .join(` `);
};

module.exports = (
  { markdownAST },
  {
    headerClassName = ``,
    titleClassName = ``,
    addExtensionTitle = true,
    showHeaderButtons = true,
  } = {}
) => {
  let titleNodesToAdd = [];
  visit(markdownAST, `code`, (node, index, parent) => {
    let language = node.meta ? node.lang + node.meta : node.lang;
    if (!language) {
      return ``;
    }
    let noTitle = false;

    const [splitLanguage, ...options] = language.split(`{`);
    let title = "";
    let ind = -1;
    options.forEach((option, index) => {
      option = option.slice(0, -1);
      const splitOption = option.split(`:`).map((s) => s.trim());
      if (splitOption.length === 2 && splitOption[0] === `title`) {
        title = splitOption[1];
        ind = index;
      } else if (splitOption.length === 1 && splitOption[0] === `skipTitle`) {
        noTitle = true;
      }
    });

    if (noTitle || (!addExtensionTitle && !title)) return;

    title = title || splitLanguage;

    if (ind > -1) {
      if (options.length > 1) {
        options.splice(ind, 1);
        node.lang = [splitLanguage, options].join(`{`);
      } else {
        node.lang = splitLanguage;
      }
      node.meta = ``;
    }

    console.log(node.value);

    const titleNode = {
      type: `html`,
      value: `<div class="${getComputedClassName(
        `gatsby-remark-code-header`,
        headerClassName
      )}" aria-hidden="true">
        ${
          showHeaderButtons
            ? `<div class="mac-btns">
          <span class="mac-btn color-close">
            <span class="material-icons-round">close</span>
          </span>
          <span class="mac-btn color-minimise">
            <span class="material-icons-round">remove</span>
          </span>
          <span class="mac-btn color-fullscreen">
            <span class="material-icons-round switch-left">
              switch_left
            </span>
            <span class="material-icons-round switch-right">
              switch_right
            </span>
          </span>
        </div>`
            : ``
        }
        <span class="${getComputedClassName(
          `gatsby-remark-code-title gatsby-highlight-title`,
          titleClassName
        )}">
          ${title}
        </span>
      </div>`,
    };

    titleNodesToAdd.push({ parent, titleNode, index });
  });

  titleNodesToAdd.forEach(({ parent, titleNode, index }, i) => {
    parent.children.splice(index + i, 0, titleNode);
  });

  return markdownAST;
};
