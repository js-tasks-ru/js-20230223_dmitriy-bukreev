export default class SortableTable {
  static compareFunctions = {
    number: (a, b) => a - b,
    string: (a, b) => a.localeCompare(b, ["ru", "en"], { caseFirst: "upper" }),
  };

  static orders = {
    asc: 1,
    desc: -1,
  };

  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render();
  }

  get template() {
    return `
    <div data-element="productsContainer" class="products-list__container">
      <div class="sortable-table">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.headerTemplate}
        </div>
        <div data-element="body" class="sortable-table__body">
          ${this.bodyTemplate}
        </div>
      </div>
    </div>;
    `;
  }

  get headerTemplate() {
    return `
      ${this.headerConfig
        .map(({ id, title, sortable }) => {
          return `
          <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
            <span>${title}</span>
          </div>
          `;
        })
        .join("")}
    `;
  }

  get bodyTemplate() {
    return `
    ${this.data
      .map((dataItem) => {
        return `
        <a href=/products/${dataItem.id} class="sortable-table__row">
          ${this.getRow(dataItem)}
        </a>`;
      })
      .join("")}
    `;
  }

  getRow(dataItem) {
    return this.headerConfig
      .map(({ id, template = this.getCell }) => {
        return template(dataItem[id]);
      })
      .join("");
  }

  getCell(value) {
    return `<div class="sortable-table__cell">${value}</div>
    `;
  }

  sort(field, param) {
    const fieldConfig = this.headerConfig.find((item) => item.id === field);
    if (!fieldConfig.sortable) return;

    const order = SortableTable.orders[param];
    const compareFunction =
      SortableTable.compareFunctions[fieldConfig.sortType];

    this.data.sort((a, b) => {
      return order * compareFunction(a[field], b[field]);
    });

    this.updateBody();
  }

  updateBody() {
    this.subElements.body.innerHTML = this.bodyTemplate;
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    // this.element = null; fails the last test
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }
}
