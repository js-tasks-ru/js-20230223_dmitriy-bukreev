export default class DoubleSlider {
  element;
  subElements = {};
  selected = {};

  startSelection = (event) => {
    // Fails tests: setPointerCapture is not a function
    event.target.setPointerCapture(event.pointerId);
    event.target.addEventListener("pointermove", this.processSelection);
    event.target.addEventListener("pointerup", this.finishSelection);
  };

  processSelection = (event) => {
    const leftBorder = event.target.bindings.leftBorder;
    const rightBorder = event.target.bindings.rightBorder;
    const sliderRect = this.subElements.slider.getBoundingClientRect();

    let position = event.clientX;
    if (position < leftBorder) position = leftBorder;
    if (position > rightBorder) position = rightBorder;

    event.target.bindings.position =
      (position - sliderRect.left) / sliderRect.width;
  };

  finishSelection = (event) => {
    event.target.removeEventListener("pointermove", this.processSelection);
    event.target.removeEventListener("pointerup", this.finishSelection);
    const selectedEvent = new Event("range-select", { bubbles: true });
    this.element.dispatchEvent(selectedEvent);
  };

  // TODO REMOVE FORMATTING
  constructor({
    min = 0,
    max = 100,
    formatValue = (val) => val,
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
    this.createBindings();
  }

  createBindings() {
    const subElements = this.subElements;

    const valueFromPosition = (pos) => {
      return this.formatValue(((this.max - this.min) * pos).toFixed());
    };

    subElements.thumbLeft.bindings = {
      get leftBorder() {
        return subElements.slider.getBoundingClientRect().left;
      },

      get rightBorder() {
        return subElements.thumbRight.getBoundingClientRect().left;
      },

      set position(pos) {
        subElements.from.textContent = valueFromPosition(pos);
        const percent = pos * 100 + "%";
        subElements.range.style.left = percent;
        subElements.thumbLeft.style.left = percent;
      },
    };

    subElements.thumbRight.bindings = {
      get leftBorder() {
        return subElements.thumbLeft.getBoundingClientRect().right;
      },

      get rightBorder() {
        return subElements.slider.getBoundingClientRect().right;
      },

      set position(pos) {
        subElements.to.textContent = valueFromPosition(pos);
        const percent = 100 - pos * 100 + "%";
        subElements.range.style.right = percent;
        subElements.thumbRight.style.right = percent;
      },
    };
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
    <div class="range-slider__inner" data-element="slider">
      <span class="range-slider__progress" style="left: ${fromPos}%; right: ${toPos}%" data-element="range"></span>
      <span class="range-slider__thumb-left" style="left: ${fromPos}%" data-element="thumbLeft"></span>
      <span class="range-slider__thumb-right" style="right: ${toPos}%" data-element="thumbRight"></span>
    </div>
    <span data-element="to">${this.formatValue(this.selected.to)}</span>
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
