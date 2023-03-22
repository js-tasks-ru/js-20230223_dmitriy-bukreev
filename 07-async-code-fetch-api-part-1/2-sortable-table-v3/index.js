import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru";

export default class SortableTable {
  LOAD_LIMIT = 30;
  element;
  subElements = {};
  isLoadingFinished = false;

  sortHandler = (event) => {
    const field = event.target.closest("[data-sortable='true']");

    if (!field) return;

    if (this.sorted.id !== field.id) field.append(this.subElements.arrow);

    const ordersMap = {
      asc: "desc",
      desc: "asc",
    };
    const order = ordersMap[field.dataset.order];
    field.dataset.order = order;
    this.sorted.id = field.dataset.id;
    this.sorted.order = order;
    this.sort(this.sorted.id, this.sorted.order);
  };

  scrollHandler = () => {
    if (
      this.isLoadingFinished ||
      this.element.classList.contains("sortable-table_loading") ||
      this.element.getBoundingClientRect().bottom >
        document.documentElement.clientHeight
    )
      return;
    this.update();
  };

  constructor(
    headerConfig = [],
    {
      sorted = {},
      url = "",
      base = BACKEND_URL,
      data = [],
      isSortLocally = false,
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.data = data;
    this.isSortLocally = isSortLocally;
    this.url = url;
    this.base = base;

    this.render();
  }

  initListeners() {
    this.subElements.header.addEventListener("pointerdown", this.sortHandler);
    document.addEventListener("scroll", this.scrollHandler);
  }

  getTable() {
    return `
      <div class="sortable-table">
        ${this.getTableHeader()}
        <div data-element="body" class="sortable-table__body"></div>
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>No products satisfies your filter criteria</p>
            <button type="button" class="button-primary-outline">Reset all filters</button>
          </div>
        </div>
      </div>`;
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map((item) => this.getHeaderRow(item)).join("")}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    const order = this.sorted.id === id ? this.sorted.order : "asc";
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order=${order}>
        <span>${title}</span>
        ${this.getSortingArrow(id)}
      </div>
    `;
  }

  getSortingArrow(id) {
    return this.sorted.id === id ? this.getSortingArrowTemplate() : "";
  }

  getSortingArrowTemplate() {
    return `
    <span data-element="arrow" class="sortable-table__sort-arrow">
      <span class="sort-arrow"></span>
    </span>`;
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

  async render() {
    const wrapper = document.createElement("div");

    wrapper.innerHTML = this.getTable();

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    if (!this.subElements.arrow) {
      const arrow = document.createElement("div");
      arrow.innerHTML = this.getSortingArrowTemplate();
      this.subElements.arrow = arrow.firstElementChild;
    }
    await this.update();
    this.initListeners();
  }

  sort(id, order) {
    if (this.isSortLocally) this.sortOnClient(id, order);
    else this.sortOnServer(id, order);
  }

  sortOnClient(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find((item) => item.id === id);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1,
    };
    const direction = directions[order];

    const sortedData = arr.sort((a, b) => {
      switch (sortType) {
        case "number":
          return direction * (a[id] - b[id]);
        case "string":
          return direction * a[id].localeCompare(b[id], ["ru", "en"]);
        default:
          throw new Error(`Unknown type ${sortType}`);
      }
    });
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortOnServer(id, order) {
    this.isLoadingFinished = false;
    this.subElements.body.innerHTML = "";
    this.data = [];
    this.update(id, order);
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

  async update(field = this.sorted.id, order = this.sorted.order) {
    // Indicate loading
    this.element.classList.remove("sortable-table_empty");
    this.element.classList.add("sortable-table_loading");

    // Request data
    const newData = await this.loadData(field, order);

    // Data recieved
    this.element.classList.remove("sortable-table_loading");
    if (newData.length === 0) {
      this.isLoadingFinished = true;
      if (this.data.length === 0)
        // Indicate that table is empty
        this.element.classList.add(".sortable-table_empty");
    } else {
      this.data.push(...newData);
      this.subElements.body.insertAdjacentHTML(
        "beforeend",
        this.getTableRows(newData)
      );
    }
  }

  async loadData(field, order) {
    const start = this.data.length;
    const end = start + this.LOAD_LIMIT;
    const dataURL = new URL(this.url, this.base);
    dataURL.searchParams.set("_start", start);
    dataURL.searchParams.set("_end", end);
    if (field && order) {
      dataURL.searchParams.set("_sort", field);
      dataURL.searchParams.set("_order", order);
    }

    return await fetchJson(dataURL);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    if (!this.element) return;
    document.removeEventListener("scroll", this.sortHandler);
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
