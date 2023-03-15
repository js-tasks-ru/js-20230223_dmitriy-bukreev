// import { template } from "@babel/core";

export default class DoubleSlider {
  element;
  subElements = {};
  selected = {};
  shiftX = 0;

  startSelection = (event) => {
    const thumb = event.target;
    // Prevents thumb from jumping
    // this.shiftX = event.clientX - thumb.getBoundingClientRect().left;
    thumb.setPointerCapture(event.pointerId);
    thumb.addEventListener("pointermove", this.processSelection);
    thumb.addEventListener("pointerup", this.finishSelection);
  };

  processSelection = (event) => {
    // let newLeft = event.clientX -
  };

  finishSelection = (event) => {
    event.target.removeEventListener("pointermove", this.processSelection);
    event.target.removeEventListener("pointerup", this.finishSelection);
    // dispatch selection
  };

  // TODO REMOVE FORMATTING
  constructor({
    min = 0,
    max = 100,
    formatValue = (val) => "$ " + val,
    selected = {},
  } = {}) {
    this.min = min;
    this.max = max;
    this.formatValue = formatValue;
    this.selected.from = selected.from || this.min;
    this.selected.to = selected.to || this.max;

    this.render();
    this.initListeners();
  }

  render() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  initListeners() {
    this.subElements.thumbLeft.addEventListener(
      "pointerdown",
      this.startSelection
    );
    this.subElements.thumbRight.addEventListener(
      "pointerdown",
      this.startSelection
    );
  }

  get template() {
    const fromPos = this.getPercent(this.selected.from);
    const toPos = 100 - this.getPercent(this.selected.to);
    return `
    <div class="range-slider">
    <span data-element="from">${this.formatValue(this.selected.from)}</span>
    <div class="range-slider__inner">
      <span class="range-slider__progress" style="left: ${fromPos}%; right: ${toPos}%" data-element="range"></span>
      <span class="range-slider__thumb-left" style="left: ${fromPos}%" data-element="thumbLeft"></span>
      <span class="range-slider__thumb-right" style="right: ${toPos}%" data-element="thumbRight"></span>
    </div data-element="to">
    <span>${this.formatValue(this.selected.to)}</span>
    </div>
    `;
  }

  getPercent(value) {
    return (value / (this.max - this.min)) * 100;
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
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
