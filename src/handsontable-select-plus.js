(function (Handsontable, WalkontableCellCoords) {
  var SelectPlusEditor = Handsontable.editors.TextEditor.prototype.extend();

  SelectPlusEditor.prototype.init = function () {
    Handsontable.editors.TextEditor.prototype.init.apply(this, arguments);
    this.reset();
  };

  SelectPlusEditor.prototype.reset = function () {
    this.timer = null;
    this.filteredItems = [];
    this.selectedIndex = -1;
    this.highlightedIndex = -1;
  };

  SelectPlusEditor.prototype.createElements = function () {
    Handsontable.editors.TextEditor.prototype.createElements.apply(this, arguments);
    this.selectPlusWrapper = document.createElement('DIV');
    Handsontable.Dom.addClass(this.selectPlusWrapper, 'select-plus-wrapper');
    this.selectPlusWrapper.style.display = 'none';
    this.selectPlusList = document.createElement('UL');
    Handsontable.Dom.addClass(this.selectPlusList, 'select-plus-list');
    this.selectPlusWrapper.appendChild(this.selectPlusList);
    this.instance.rootElement.appendChild(this.selectPlusWrapper);
  };

  SelectPlusEditor.prototype.prepare = function () {
    Handsontable.editors.TextEditor.prototype.prepare.apply(this, arguments);
    this.filteredItems = this.cellProperties.items;
    this.renderList();
  };

  SelectPlusEditor.prototype.open = function () {
    Handsontable.editors.TextEditor.prototype.open.apply(this, arguments);
    this.show();
    this.handleHighlightIndexChange();
    this.instance.addHook('beforeKeyDown', this.onBeforeKeyDown);
  };

  SelectPlusEditor.prototype.close = function () {
    Handsontable.editors.TextEditor.prototype.close.apply(this, arguments);
    this.hide();
    this.instance.removeHook('beforeKeyDown', this.onBeforeKeyDown);
    this.reset();
  };

  SelectPlusEditor.prototype.getValue = function () {
    var item = this.getSelectedItem();
    return !item ? '' : item.value;
  };

  SelectPlusEditor.prototype.setValue = function (value) {
    var index = -1;
    for (var i = 0; i < this.filteredItems.length; i++) {
      var item = this.filteredItems[i];
      if (String(item.value) === String(value)) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      this.TEXTAREA.value = '';
    } else {
      this.selectedIndex = index;
      this.highlightedIndex = index;
      var selectedItem = this.getSelectedItem();
      this.TEXTAREA.value = !selectedItem ? '' : selectedItem.label;
      this.renderList();
    }
  };

  SelectPlusEditor.prototype.onBeforeKeyDown = function (event) {
    var editor = this.getActiveEditor();

    if (event.keyCode === Handsontable.helper.KEY_CODES.C && (event.ctrlKey || event.metaKey)) {
      return;
    }

    if (event.keyCode === Handsontable.helper.KEY_CODES.ARROW_LEFT || event.keyCode === Handsontable.helper.KEY_CODES.ARROW_RIGHT) {
      return;
    }

    if (event.keyCode === Handsontable.helper.KEY_CODES.ARROW_UP || event.keyCode === Handsontable.helper.KEY_CODES.ARROW_DOWN) {
      if (event.keyCode === Handsontable.helper.KEY_CODES.ARROW_UP) {
        editor.highlightedIndex = editor.highlightedIndex <= 0
          ? editor.filteredItems.length - 1
          : editor.highlightedIndex - 1;
      } else {
        editor.highlightedIndex = editor.highlightedIndex >= editor.filteredItems.length - 1
          ? 0
          : editor.highlightedIndex + 1;
      }
      editor.handleHighlightIndexChange();
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (event.keyCode === Handsontable.helper.KEY_CODES.ENTER) {
      if (editor.highlightedIndex !== -1) {
        editor.selectedIndex = editor.highlightedIndex;
        editor.handleSelectItem(editor.getSelectedItem());
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(function () {
      editor.filterItems(editor.TEXTAREA.value);
      editor.renderList();
    }, 200);
  };

  SelectPlusEditor.prototype.filterItems = function (value) {
    var items = this.cellProperties.items || [];
    this.filteredItems = items.filter(function (item) {
      var label = item.label || '';
      return label.toLowerCase().indexOf(value.toLowerCase()) === 0;
    });

    this.highlightedIndex = (this.filteredItems.length === 0 || value.length === 0) ? -1 : 0;
  };

  SelectPlusEditor.prototype.renderList = function (items) {
    items = items || this.filteredItems;
    var highlightedIndex = this.highlightedIndex;
    Handsontable.Dom.empty(this.selectPlusList);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var selectPlusItem = document.createElement('LI');
      Handsontable.Dom.addClass(selectPlusItem, 'select-plus-item');
      if (highlightedIndex === i) {
        Handsontable.Dom.addClass(selectPlusItem, 'select-plus-item-highlight');
      }
      selectPlusItem.textContent = item.label;
      selectPlusItem.addEventListener('click', this.handleItemClick(item, i));
      this.selectPlusList.appendChild(selectPlusItem);
    }
  };

  SelectPlusEditor.prototype.handleHighlightIndexChange = function () {
    var selectPlusItems = this.selectPlusList.querySelectorAll('.select-plus-item');
    var selectedItem = null;
    for (var i = 0; i < selectPlusItems.length; i++) {
      var selectPlusItem = selectPlusItems[i];
      if (this.highlightedIndex === i) {
        Handsontable.Dom.addClass(selectPlusItem, 'select-plus-item-highlight');
        selectedItem = selectPlusItems[i];
      } else if (Handsontable.Dom.hasClass(selectPlusItem, 'select-plus-item-highlight')) {
        Handsontable.Dom.removeClass(selectPlusItem, 'select-plus-item-highlight');
      }
    }

    if (!selectedItem) {
      return;
    }

    var wrapperHeight = Handsontable.Dom.innerHeight(this.selectPlusWrapper);
    var wrapperOffset = Handsontable.Dom.offset(this.selectPlusWrapper);
    var wrapperScrollTop = this.selectPlusWrapper.scrollTop;
    var itemHeight = Handsontable.Dom.innerHeight(selectedItem);
    var itemOffset = Handsontable.Dom.offset(selectedItem);
    var itemY = itemOffset.top - wrapperScrollTop;
    var y = 0;
    if (itemY <= wrapperOffset.top) {
      y = itemY - wrapperOffset.top;
    } else if (itemY + itemHeight >= wrapperOffset.top + wrapperHeight) {
      y = (itemY + itemHeight) - (wrapperOffset.top + wrapperHeight);
    }
    this.selectPlusWrapper.scrollTop += y;
  };

  SelectPlusEditor.prototype.handleItemClick = function (item) {
    var self = this;
    return function (event) {
      self.handleSelectItem(item);
    };
  };

  SelectPlusEditor.prototype.handleSelectItem = function (item) {
    this.setValue(item.value);
    this.refreshDimensions();
    this.finishEditing();
  };

  SelectPlusEditor.prototype.getSelectedItem = function () {
    var item = this.filteredItems[this.selectedIndex];
    return !item ? undefined : item;
  };

  SelectPlusEditor.prototype.show = function () {
    var height = Handsontable.Dom.outerHeight(this.TD);
    var width = Handsontable.Dom.outerWidth(this.TD);
    var rootOffset = Handsontable.Dom.offset(this.instance.rootElement);
    var tdOffset = Handsontable.Dom.offset(this.TD);

    this.selectPlusWrapper.style.position = 'absolute';
    this.selectPlusWrapper.style.top = tdOffset.top - rootOffset.top + height + 'px';
    this.selectPlusWrapper.style.left = tdOffset.left - rootOffset.left + 'px';
    this.selectPlusWrapper.style.minWidth = width + 'px';
    this.selectPlusWrapper.style.display = '';
  };

  SelectPlusEditor.prototype.hide = function () {
    this.selectPlusWrapper.scrollTop = 0;
    this.selectPlusWrapper.style.display = 'none';
  };

  var ARROW = document.createElement('DIV');
  ARROW.className = 'htAutocompleteArrow';
  ARROW.appendChild(document.createTextNode(String.fromCharCode(9660)));

  var SelectPlusRenderer = function (instance, td, row, col, prop, value, cellProperties) {
    value = value || '';
    var items = cellProperties.items || [];
    var item = null;
    for (var i = 0; i < items.length; i++) {
      if (items[i].value === value) {
        item = items[i];
        break;
      }
    }
    Handsontable.Dom.empty(td);
    var arrow = ARROW.cloneNode(true);
    arrow.addEventListener('click', function () {
      instance.view.wt.getSetting('onCellDblClick', null, new WalkontableCellCoords(row, col), td);
    });
    td.appendChild(document.createTextNode(!item ? value : item.label));
    td.appendChild(arrow);
    Handsontable.Dom.addClass(td, 'htAutocomplete');
    return td;
  };

  Handsontable.editors.SelectPlusEditor = SelectPlusEditor;
  Handsontable.editors.registerEditor('selectPlus', SelectPlusEditor);
  Handsontable.renderers.SelectPlusRenderer = SelectPlusRenderer;
  Handsontable.renderers.registerRenderer('selectPlus', SelectPlusRenderer);

  Handsontable.cellTypes.selectPlus = {
    editor: Handsontable.editors.SelectPlusEditor,
    renderer: Handsontable.renderers.SelectPlusRenderer
  };
})(Handsontable, WalkontableCellCoords);