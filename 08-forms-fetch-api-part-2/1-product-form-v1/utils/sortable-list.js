export default class SortableList {
  element;
  subElements = {};
  imageList = {};

  onPointerDown = (event) => {
    // TODO: Drag&Drop handler
    // Consider list to be flat
    let listItem = event.target.closest("li");
    let target = event.target.closest("[data-delete-handle]");
    if (target) {
      listItem.remove();
      return;
    }
    target = event.target.closest("[data-grab-handle]");
    if (target) {
      // Grab item
      return;
    }
  };

  constructor({ items = [] } = {}) {
    this.render(items);
    this.initListeners();
    this.append = this.element.append.bind(this.element);
  }

  render(items) {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<ul class="sortable-list"></ul>`;
    this.element = wrapper.firstElementChild;
    this.element.append(...items);
  }

  initListeners() {
    this.element.addEventListener("pointerdown", this.onPointerDown);
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
