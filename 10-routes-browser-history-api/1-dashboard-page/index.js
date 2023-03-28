import RangePicker from "./components/range-picker/src/index.js";
import SortableTable from "./components/sortable-table/src/index.js";
import ColumnChart from "./components/column-chart/src/index.js";
import header from "./bestsellers-header.js";

import fetchJson from "./utils/fetch-json.js";

const BACKEND_URL = "https://course-js.javascript.ru/";

export default class Page {
  element;
  subElements = {};
  charts = [];

  onDateSelect = (event) => {
    const { from, to } = event.detail;
    for (const chart of this.charts) chart.update(from, to);
    this.updateTable(from, to);
  };

  async render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.initListeners();

    return this.element;
  }

  async initComponents() {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 2);
    from.setMonth(to.getMonth() - 1);

    const rangePicker = new RangePicker({ from, to });

    const ordersChart = new ColumnChart({
      label: "Orders",
      url: "api/dashboard/orders",
      range: {
        from,
        to,
      },
      link: "/sales",
    });
    const salesChart = new ColumnChart({
      label: "Sales",
      url: "api/dashboard/sales",
      range: {
        from,
        to,
      },
      formatHeading: (value) => {
        // Convert number to string and reverse it
        let formatted = [...value.toString()].reverse().join("");
        // Split into groups of three, join on ',' and reverse it back
        formatted = [...formatted.match(/.{1,3}/g).join(",")].reverse();
        return formatted.join("");
      },
    });

    const customersChart = new ColumnChart({
      label: "Customers",
      url: "api/dashboard/customers",
      range: {
        from,
        to,
      },
    });

    this.subElements.ordersChart.append(ordersChart.element);
    this.subElements.salesChart.append(salesChart.element);
    this.subElements.customersChart.append(customersChart.element);
    this.subElements.rangePicker.replaceWith(rangePicker.element);
    this.subElements.rangePicker = rangePicker.element;

    this.charts = [ordersChart, salesChart, customersChart];

    this.updateTable(from, to);
  }

  initListeners() {
    this.subElements.rangePicker.addEventListener(
      "date-select",
      this.onDateSelect
    );
  }

  updateTable(from, to) {
    const url = new URL("api/dashboard/bestsellers", BACKEND_URL);
    url.searchParams.set("from", from.toISOString());
    url.searchParams.set("to", to.toISOString());
    const sortableTable = new SortableTable(header, { url });

    this.subElements.sortableTable.replaceWith(sortableTable.element);
    this.subElements.sortableTable = sortableTable.element;
  }

  getTemplate() {
    return `
    <div class="dashboard">
        <div class="content__top-panel">
            <h2 class="page-title">Dashboard</h2>
            <!-- RangePicker component -->
            <div data-element="rangePicker"></div>
        </div>

        <div data-element="chartsRoot" class="dashboard__charts">
            <!-- column-chart components -->
            <div data-element="ordersChart" class="dashboard__chart_orders"></div>
            <div data-element="salesChart" class="dashboard__chart_sales"></div>
            <div data-element="customersChart" class="dashboard__chart_customers"></div>
        </div>

        <h3 class="block-title">Best sellers</h3>

        <div data-element="sortableTable">
            <!-- sortable-table component -->
        </div>
    </div>`;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll("[data-element]");

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.charts = [];
  }
}
