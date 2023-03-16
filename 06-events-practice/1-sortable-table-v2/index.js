export default class SortableTable {
  element;
  sortedField;
  subElements = {};

  sortHandler = (event) => {
    const field = event.target.closest(".sortable-table__cell");

    if (field.dataset.sortable === "false") return;

    if (this.sortedField !== field) {
      this.sortedField.dataset.order = "";
      this.sortedField = field;
    }

    const ordersMap = {
      "": "desc",
      asc: "desc",
      desc: "asc",
    };
    const order = ordersMap[field.dataset.order];
    field.dataset.order = order;
    this.sort(field.dataset.id, order);
  };

  constructor(
    headerConfig = [],
    { data = [], sorted = {} } = {},
    isSortLocally = true
  ) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
    this.initListeners();
  }

  initListeners() {
    this.subElements.header.addEventListener("pointerdown", this.sortHandler);
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map((item) => this.getHeaderRow(item)).join("")}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order>
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `;
  }

  getTableBody() {
    const data = this.sortOnClient(this.sorted.id, this.sorted.order);
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getTableRows(data)}
      </div>`;
  }

  getTableRows(data = []) {
    return data
      .map((item) => {
        return `
        <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRow(item)}
        </a>`;
      })
      .join("");
  }

  getTableRow(product) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return {
        id,
        template,
      };
    });

    return cells
      .map(({ id, template }) => {
        return template
          ? template(product[id])
          : `<div class="sortable-table__cell">${product[id]}</div>`;
      })
      .join("");
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>`;
  }

  render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.sortedField = this.subElements.header.querySelector(
      `.sortable-table__cell[data-id="${this.sorted.id}"]`
    );
    this.sortedField.dataset.order = this.sorted.order;
  }

  sort(field, order) {
    const sortedData = this.isSortLocally
      ? this.sortOnClient(field, order)
      : this.sortOnServer(field, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortOnClient(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1,
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[field] - b[field]);
        case "string":
          return direction * a[field].localeCompare(b[field], ["ru", "en"]);
        default:
          throw new Error(`Unknown type ${sortType}`);
      }
    });
  }

  sortOnServer(field, order) {
    // TODO
    return;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    if (!this.element) return;
    this.remove();
    this.element = null;
    this.sortedField = null;
    this.subElements = {};
  }
}
