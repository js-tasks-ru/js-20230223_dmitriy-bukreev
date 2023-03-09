export default class ColumnChart {
  constructor({
    data = [],
    label = "",
    link = "",
    formatHeading = (val) => val,
    value = 0,
  } = {}) {
    this.chartHeight = 50;
    this.render({ data, label, link, formatHeading, value });
  }

  getTemplate({ data, label, link, formatHeading, value }) {
    return `
    <div class="column-chart ${this._getLoadingStatus(data)}" 
      style="--chart-height: ${this.chartHeight}">
      <div class="column-chart__title">
          Total ${label}
          <a class="column-chart__link" href=${link}>View all</a>
      </div>
      <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">
          ${formatHeading(value)}
          </div>
          <div data-element="body" class="column-chart__chart">
            ${this._getChart(data)}
          </div>
      </div>
    </div>
    `;
  }

  render(params) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate(params);
    this.element = wrapper.firstElementChild;
  }

  update(data) {
    if (!data || data.length === 0) return;
    this.element.classList.remove("column-chart_loading");
    const dataArea = this.element.querySelector(".column-chart__chart");
    dataArea.insertAdjacentHTML("afterbegin", this._getChart(data));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  _getLoadingStatus(data) {
    if (!data || data.length === 0) return "column-chart_loading";
  }

  _getChart(data) {
    return this._getColumnProps(data)
      .map(
        ({ percent, value }) =>
          `<div style="--value: ${value}" data-tooltip="${percent}"></div>`
      )
      .join("");
  }

  _getColumnProps(data) {
    const maxValue = Math.max(...data);
    const scale = this.chartHeight / maxValue;

    return data.map((item) => {
      return {
        percent: ((item / maxValue) * 100).toFixed(0) + "%",
        value: String(Math.floor(item * scale)),
      };
    });
  }
}
