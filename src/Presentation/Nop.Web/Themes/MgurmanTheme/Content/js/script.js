// helpers

const qs = (selector, parent = document) => parent.querySelector(selector);
const qsa = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

function onReady(callback) {
  document.addEventListener('DOMContentLoaded', callback);
}

function setActive(elements, activeElement, activeClass = 'active') {
  elements.forEach(element => element.classList.toggle(activeClass, element === activeElement));
}

function showEmptyBlock(mainBlock, emptyBlock) {
  if (!mainBlock || !emptyBlock) return;

  mainBlock.classList.add('hidden');
  emptyBlock.classList.add('show');
}

function hideEmptyBlock(mainBlock, emptyBlock) {
  if (!mainBlock || !emptyBlock) return;

  mainBlock.classList.remove('hidden');
  emptyBlock.classList.remove('show');
}

function getFieldBlock(input) {
  return input?.closest('.input-group') || input?.closest('.input-block');
}

function clearInputError(input) {
  const fieldBlock = getFieldBlock(input);
  if (!fieldBlock) return;

  fieldBlock.classList.remove('has-error');

  const errorEl = qs('.form-error', fieldBlock);
  if (errorEl) errorEl.textContent = '';
}

function bindClearErrorsOnInput(form) {
  qsa('input', form).forEach(input => {
    input.addEventListener('input', () => {
      clearInputError(input);
      clearFormError(form, false);
    });
  });
}

// swiper

function initSliders() {
  if (typeof Swiper === 'undefined') return;

  if (qs('.banner-slider')) {
    new Swiper('.banner-slider', {
      slidesPerView: 1,
      spaceBetween: 8,
      loop: true,
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
    });
  }

  qsa('.products-slider').forEach(slider => {
    new Swiper(slider, {
      slidesPerView: 'auto',
      spaceBetween: 20,
      breakpoints: {
        480: {
          spaceBetween: 20,
        },
        768: {
          spaceBetween: 20,
        },
        1024: {
          spaceBetween: 20,
        },
      },
    });
  });
}

// counters for catalog and product page

function initCounters(root = document) {

  const counters = root.querySelectorAll(".product-counter:not([data-cart-item])");

  counters.forEach(counter => {

    if (counter.dataset.initialized === "1")
      return;

    counter.dataset.initialized = "1";

    const isWeight = counter.dataset.unit === "kg";

    const min = parseFloat(counter.dataset.min ?? "1");
    const max = parseFloat(counter.dataset.max ?? "99");
    const step = parseFloat(counter.dataset.step ?? "1");

    const btnMinus = counter.querySelector(".btn-minus");
    const btnPlus = counter.querySelector(".btn-plus");
    const input = counter.querySelector(".counter-value");

    if (!btnMinus || !btnPlus || !input)
      return;

    let value = parseFloat(
      String(input.value).replace(",", ".")
    );

    if (isNaN(value))
      value = min;

    function clamp(v) {

      if (isNaN(v))
        v = min;

      if (v < min)
        v = min;

      if (v > max)
        v = max;

      return v;
    }

    function syncWeightRadio(weight) {

      if (!isWeight)
        return;

      const radios = document.querySelectorAll(
        '.attributes input[type="radio"][name^="product_attribute_"]'
      );

      for (const radio of radios) {

        const label = document.querySelector(
          `label[for="${radio.id}"]`
        );

        if (!label)
          continue;

        const text = label.textContent
          .replace(/\[.*?\]/g, "")
          .trim();

        let radioWeight = 0;

        if (text.includes("кг")) {

          radioWeight = parseFloat(
            text
              .replace("кг", "")
              .replace(/\s/g, "")
              .replace(",", ".")
          );

        } else {

          radioWeight =
            parseFloat(
              text
                .replace("гр", "")
                .replace(/\s/g, "")
                .replace(",", ".")
            ) / 1000;
        }

        if (Math.abs(radioWeight - weight) < 0.001) {

          radio.checked = true;

          radio.dispatchEvent(
            new Event("change", {
              bubbles: true
            })
          );

          break;
        }
      }
    }

    function render(triggerEvents) {

      value = clamp(value);

      if (isWeight) {

        input.value = value.toFixed(1);
        syncWeightRadio(value);

      } else {

        value = Math.trunc(value);
        input.value = value;
      }

      if (triggerEvents) {

        input.dispatchEvent(
          new Event("input", {
            bubbles: true
          })
        );

        input.dispatchEvent(
          new Event("change", {
            bubbles: true
          })
        );
      }
    }

    btnPlus.addEventListener("click", () => {

      value += step;

      render(true);
    });

    btnMinus.addEventListener("click", () => {

      value -= step;

      render(true);
    });

    input.addEventListener("blur", () => {

      value = parseFloat(
        String(input.value).replace(",", ".")
      );

      render(true);
    });

    render(false);
  });
}

// counters for cart

function initCartCounters(root = document) {

  const counters = root.querySelectorAll(".product-counter[data-cart-item]");

  counters.forEach(counter => {

    if (counter.dataset.initialized === "1")
      return;

    counter.dataset.initialized = "1";

    const isWeight = counter.dataset.unit === "kg";

    const min = parseFloat(counter.dataset.min ?? "1");
    const max = parseFloat(counter.dataset.max ?? "99");
    const step = parseFloat(counter.dataset.step ?? "1");

    const btnMinus = counter.querySelector(".btn-minus");
    const btnPlus = counter.querySelector(".btn-plus");
    const input = counter.querySelector(".counter-value");

    if (!btnMinus || !btnPlus || !input)
      return;

    function parseNumber(value) {
      if (typeof value === 'string') {
        value = value.replace(',', '.');
      }
      return parseFloat(value);
    }

    let value = parseNumber(input.value);

    if (isNaN(value))
      value = min;

    function clamp(v) {

      if (isNaN(v))
        v = min;

      if (v < min)
        v = min;

      if (v > max)
        v = max;

      return v;
    }

    function updateCart() {
      const form = document.getElementById('shopping-cart-form');
      if (!form) return;

      const productItem = counter.closest('.product-item');
      if (!productItem) return;

      const hiddenInput = productItem.querySelector('.cart-item-quantity-hidden');
      if (hiddenInput) {
        const stringValue = isWeight ? value.toFixed(1) : Math.trunc(value).toString();
        hiddenInput.value = stringValue;
      }

      const updateBtn = document.getElementById('updatecart');
      if (updateBtn) {
        updateBtn.click();
      }
    }

    function render(triggerEvents) {

      value = clamp(value);

      if (isWeight) {
        input.value = value.toFixed(1);
      } else {
        value = Math.trunc(value);
        input.value = value;
      }

      if (triggerEvents) {

        input.dispatchEvent(
          new Event("input", {
            bubbles: true
          })
        );

        input.dispatchEvent(
          new Event("change", {
            bubbles: true
          })
        );

        clearTimeout(window.cartUpdateTimeout);
        window.cartUpdateTimeout = setTimeout(() => {
          updateCart();
        }, 300);
      }
    }

    btnPlus.addEventListener("click", () => {
      value += step;
      render(true);
    });

    btnMinus.addEventListener("click", () => {
      value -= step;
      render(true);
    });

    input.addEventListener("blur", () => {
      value = parseNumber(input.value);
      render(true);
    });

    input.addEventListener("input", function (e) {
      let newValue = parseNumber(this.value);
      if (!isNaN(newValue)) {
        value = newValue;
        clearTimeout(window.cartUpdateTimeout);
        window.cartUpdateTimeout = setTimeout(() => {
          render(true);
        }, 500);
      }
    });

    render(false);
  });
}

document.querySelectorAll(".counter-value").forEach(input => {
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });
});

// selectors

function closeSelects(exceptSelect = null) {
  qsa('[data-select], .custom-select').forEach(select => {
    if (select !== exceptSelect) select.classList.remove('open');
  });
}

function initSortSelect() {

  document.addEventListener('click', (e) => {

    const select = e.target.closest('[data-sort-select]');
    if (!select) return;

    const trigger = select.querySelector('[data-trigger]');
    const option = e.target.closest('li[data-value]');
    const hidden = document.querySelector('#products-orderby');

    if (!trigger || !hidden) return;

    if (e.target.closest('[data-trigger]')) {
      e.stopPropagation();
      select.classList.toggle('open');
      return;
    }

    if (option) {

      const value = option.dataset.value;

      const span = option.querySelector('span');

      if (span) {
        trigger.innerHTML =
          `<span>${span.innerHTML}</span>` +
          option.textContent.replace(span.textContent, '').trim();
      } else {
        trigger.textContent = option.textContent.trim();
      }

      hidden.value = value;
      select.classList.remove('open');

      if (window.CatalogProducts) {
        CatalogProducts.getProducts();
      }
    }
  });

  // nop hook
  if (typeof CatalogProducts !== 'undefined') {

    $(CatalogProducts).on('before', function (e) {

      const hidden = document.querySelector('#products-orderby');

      if (!hidden) return;

      const value = hidden.value;

      if (value) {
        e.payload.urlBuilder.addParameter('orderby', value);
      }
    });

  }
}

function initCustomSelectors() {
  qsa('.custom-select').forEach(select => {
    const trigger = qs('.custom-select__trigger', select);
    const options = qsa('.custom-select__option', select);
    const input = qs('input[type="hidden"]', select);

    if (!trigger || !options.length) return;

    trigger.addEventListener('click', event => {
      event.stopPropagation();
      closeSelects(select);
      select.classList.toggle('open');
    });

    options.forEach(option => {
      option.addEventListener('click', () => {
        const value = option.dataset.value || '';
        const text = option.textContent.trim();

        trigger.textContent = text;
        if (input) input.value = value;

        select.classList.remove('open');
      });
    });
  });
}

function initSelectOutsideClick() {
  document.addEventListener('click', event => {
    if (!event.target.closest('[data-select], .custom-select')) {
      closeSelects();
    }
  });
}

// pagination

function initPagination() {
  const container = qs('.products__pagination');
  if (!container) return;

  const totalProducts = parseInt(container.dataset.totalProducts, 10) || 120;
  const perPage = parseInt(container.dataset.perPage, 10) || 12;
  const totalPages = Math.max(1, Math.ceil(totalProducts / perPage));

  const urlParams = new URLSearchParams(window.location.search);
  let currentPage = parseInt(urlParams.get('page'), 10) || 1;
  currentPage = Math.min(totalPages, Math.max(1, currentPage));

  renderPagination();

  function renderPagination() {
    container.innerHTML = '';

    container.appendChild(createBtn('«', 1, currentPage === 1));
    container.appendChild(createBtn('‹', currentPage - 1, currentPage === 1));

    let start = Math.max(1, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 2);

    for (let page = start; page <= end; page++) {
      container.appendChild(createPage(page));
    }

    if (end < totalPages) {
      if (end < totalPages - 1) container.appendChild(createDots());
      container.appendChild(createPage(totalPages));
    }

    container.appendChild(createBtn('›', currentPage + 1, currentPage === totalPages));
    container.appendChild(createBtn('»', totalPages, currentPage === totalPages));
  }

  function createPage(page) {
    const link = document.createElement('a');

    link.href = getPageUrl(page);
    link.textContent = page;
    link.className = 'page';

    if (page === currentPage) link.classList.add('active');

    return link;
  }

  function createBtn(symbol, page, disabled) {
    const link = document.createElement('a');

    link.textContent = symbol;
    link.className = 'btn';

    if (disabled) {
      link.href = '#';
      link.classList.add('disabled');
      link.setAttribute('aria-disabled', 'true');
    } else {
      link.href = getPageUrl(page);
    }

    return link;
  }

  function createDots() {
    const div = document.createElement('div');
    div.className = 'dots';

    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = 'dot';
      div.appendChild(span);
    }

    return div;
  }

  function getPageUrl(page) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page);

    return `${window.location.pathname}?${params.toString()}`;
  }
}


// orders

function initOrdersSelect() {
  const ordersSelect = qs('.orders__select');
  if (!ordersSelect) return;

  const selectBtns = qsa('.orders-select__btn');
  const orders = qsa('.order-item');

  selectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status || 'all';

      setActive(selectBtns, btn);
      filterOrders(orders, status);
    });
  });

  filterOrders(orders, 'all');

  function filterOrders(items, status) {
    items.forEach(order => {
      const shouldShow = status === 'all' || order.dataset.status === status;
      order.classList.toggle('show', shouldShow);
    });
  }
}

function initOrdersList() {
  const ordersList = qs('.orders__list');
  const ordersEmptyBlock = qs('.orders__empty');

  if (!ordersList || !ordersEmptyBlock) return;

  const hasOrders = Boolean(qs('.order-item', ordersList));

  ordersList.classList.toggle('hidden', !hasOrders);
  ordersEmptyBlock.classList.toggle('show', !hasOrders);
}

function initDetailsInfo() {
  const ordersView = qs('.orders-view');
  if (!ordersView) return;

  const ordersList = qs('.orders__list');
  const ordersListView = qs('.orders-view__list');
  const orderDetailsView = qs('.orders-view__details');
  const detailsBackBtn = qs('.order-details__back');

  if (!ordersList || !ordersListView || !orderDetailsView || !detailsBackBtn) return;

  ordersList.addEventListener('click', event => {
    const btn = event.target.closest('.btn-more');
    if (!btn) return;

    toggleViews();
  });

  detailsBackBtn.addEventListener('click', toggleViews);

  function toggleViews() {
    ordersListView.classList.toggle('show');
    orderDetailsView.classList.toggle('show');
  }
}

// checkout

function initCheckoutSection() {
  const mainSection = qs('.cart-section');
  const checkoutSection = qs('.cart-checkout-section');

  if (!mainSection || !checkoutSection) return;

  const checkoutBtn = qs('.checkout-btn', mainSection);
  const checkoutBackBtn = qs('.cart-checkout__back-btn', checkoutSection);

  if (!checkoutBtn || !checkoutBackBtn) return;

  checkoutBtn.addEventListener('click', showCheckout);
  checkoutBackBtn.addEventListener('click', showMain);

  function showCheckout() {
    mainSection.classList.add('hidden');
    checkoutSection.classList.add('show');
  }

  function showMain() {
    mainSection.classList.remove('hidden');
    checkoutSection.classList.remove('show');
  }
}

function initDeliveryTimePick() {
  const dateInput = qs('#delivery-dateTime');

  if (!dateInput || typeof flatpickr === 'undefined') return;

  const dateTimeInputField = qs('.dateTime-input');
  const asapBtn = qs('#asap-btn');
  const typeInput = qs('#delivery-type');

  if (!dateTimeInputField || !asapBtn || !typeInput) return;

  const grayIco = qs('.gray-ico', dateTimeInputField);
  const whiteIco = qs('.white-ico', dateTimeInputField);

  const datePicker = flatpickr(dateInput, {
    enableTime: true,
    time_24hr: true,
    dateFormat: 'Y-m-d H:i',
    altInput: true,
    altFormat: 'j F в H:i',
    minDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
    minuteIncrement: 15,
    minTime: '9:00',
    maxTime: '23:00',
    locale: 'ru',
    onChange: (_, dateStr) => {
      if (dateStr) setScheduled();
    },
  });

  asapBtn.addEventListener('click', setAsap);
  dateInput.addEventListener('focus', setScheduled);

  function setAsap() {
    typeInput.value = 'asap';
    dateTimeInputField.classList.remove('active-type');
    asapBtn.classList.add('active');
    datePicker.clear();

    grayIco?.classList.remove('hide');
    whiteIco?.classList.add('hide');
  }

  function setScheduled() {
    typeInput.value = 'scheduled';
    dateTimeInputField.classList.add('active-type');
    asapBtn.classList.remove('active');

    grayIco?.classList.add('hide');
    whiteIco?.classList.remove('hide');
  }
}

// cart

function initCartClearing() {
  const productsList = qs('.cart__products-list');
  if (!productsList) return;

  const mainContent = qs('.page-content');
  const emptyBlock = qs('.empty-block');
  const clearCartBtn = qs('[data-action="clear-cart"]');

  clearCartBtn?.addEventListener('click', clearCart);

  productsList.addEventListener('click', event => {
    const btn = event.target.closest('[data-action="remove"]');
    if (!btn) return;

    const item = btn.closest('.product-item');
    if (!item) return;

    removeItem(item);
  });

  function clearCart() {
    try {
      qsa('.product-item', productsList).forEach(item => item.remove());
      checkEmptyState();
    } catch (err) {
      console.error('Ошибка очистки корзины:', err);
    }
  }

  function removeItem(element) {
    element.remove();
    checkEmptyState();
  }

  function checkEmptyState() {
    if (!qs('.product-item', productsList)) {
      showEmptyBlock(mainContent, emptyBlock);
    }
  }
}

// password

function initPasswordVisibility() {
  qsa('.password-toggle').forEach(toggle => {
    const input = qs('input', toggle.closest('.input-group'));
    const icoShow = qs('.password-ico_show', toggle);
    const icoHide = qs('.password-ico_hide', toggle);

    if (!input) return;

    toggle.addEventListener('click', () => {
      const visible = input.type === 'password';

      input.type = visible ? 'text' : 'password';

      icoShow?.classList.toggle('hidden', visible);
      icoHide?.classList.toggle('hidden', !visible);
    });
  });
}

// reset password

function initCodeInput() {
  const inputsBlock = qs('.code-inputs');
  if (!inputsBlock) return;

  const inputs = qsa('.code-input', inputsBlock);
  const hiddenInput = qs('#full-code');

  if (!inputs.length || !hiddenInput) return;

  inputs.forEach((input, index) => {
    input.addEventListener('input', event => {
      event.target.value = event.target.value.replace(/\D/g, '').slice(0, 1);

      if (event.target.value && index < inputs.length - 1) {
        inputs[index + 1].focus();
      }

      updateCode();
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Backspace' && !input.value && index > 0) {
        inputs[index - 1].focus();
      }
    });
  });

  inputsBlock.addEventListener('paste', event => {
    event.preventDefault();

    const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, inputs.length);

    inputs.forEach((input, index) => {
      input.value = paste[index] || '';
    });

    updateCode();

    const nextIndex = Math.min(paste.length, inputs.length - 1);
    inputs[nextIndex].focus();
  });

  function updateCode() {
    hiddenInput.value = inputs.map(input => input.value).join('');
  }
}

// forms

function initAccountForms() {
  const phoneInput = qs('input[type="tel"]');

  if (!phoneInput || typeof IMask === 'undefined') return;

  IMask(phoneInput, {
    mask: '+7 (000) 000-00-00',
  });
}

// burger menu

function initBurgerMenu() {
  const burgerBtns = qsa('.burger-btn');
  const burgerMenu = qs('.mobile-burger-menu');

  if (!burgerBtns.length || !burgerMenu) return;

  const navMenu = qs('.header__nav', burgerMenu);
  const categoriesMenu = qs('.categories-aside', burgerMenu);

  if (!navMenu || !categoriesMenu) return;

  let currentMenu = null;

  burgerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetMenu = btn.dataset.menu;

      if (currentMenu === targetMenu) {
        closeMenu();
        return;
      }

      if (burgerMenu.classList.contains('show')) {
        switchMenu(targetMenu);
        setActive(burgerBtns, btn);
        currentMenu = targetMenu;
        return;
      }

      openMenu(targetMenu, btn);
    });
  });

  function openMenu(menu, btn) {
    burgerMenu.classList.add('show');
    document.body.classList.add('no-scroll');

    switchMenu(menu);
    setActive(burgerBtns, btn);

    currentMenu = menu;
  }

  function closeMenu() {
    burgerMenu.classList.remove('show');
    document.body.classList.remove('no-scroll');

    burgerBtns.forEach(btn => btn.classList.remove('active'));

    currentMenu = null;
  }

  function switchMenu(menu) {
    const isNav = menu === 'nav';

    navMenu.classList.toggle('show', isNav);
    categoriesMenu.classList.toggle('show', !isNav);
  }
}

// validation funcs

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function validatePassword(value) {
  return Boolean(value && String(value).length >= 6);
}

function validatePasswordMatch(password, confirm) {
  return password === confirm;
}

function validateCode(value, length = 4) {
  return new RegExp(`^\\d{${length}}$`).test(String(value || ''));
}

function showFieldError(form, fieldName, message) {
  const input = qs(`[name="${fieldName}"]`, form);
  if (!input) return;

  const fieldBlock = getFieldBlock(input);
  if (!fieldBlock) return;

  fieldBlock.classList.add('has-error');

  const errorEl = qs('.form-error', fieldBlock);
  if (errorEl) errorEl.textContent = message;
}

function showFormError(form, message) {
  let el = qs('.form-error--form', form);

  if (!el) {
    el = document.createElement('div');
    el.className = 'form-error form-error--form';
    form.append(el);
  }

  el.textContent = message;

  qsa('input', form).forEach(input => {
    setFieldState(input, true);
  });
}

function setFieldState(input, isError) {
  const fieldBlock = getFieldBlock(input);
  if (!fieldBlock) return;

  fieldBlock.classList.toggle('has-error', isError);
}

function clearFieldError(form, fieldName) {
  const input = qs(`[name="${fieldName}"]`, form);
  if (!input) return;

  clearInputError(input);
}

function clearFormError(form, clearFields = true) {
  const el = qs('.form-error--form', form);
  if (el) el.textContent = '';

  if (clearFields) {
    qsa('input', form).forEach(input => {
      setFieldState(input, false);
    });
  }
}

// catalog selectors
document.addEventListener("DOMContentLoaded", function () {

  const sort = document.querySelector("[data-sort-select]");
  if (!sort) return;

  const dropdown = sort.querySelector("[data-dropdown]");
  const trigger = sort.querySelector("[data-trigger]");
  const current = sort.querySelector("[data-current-sort]");
  const hidden = document.getElementById("products-orderby");
  const container = document.querySelector(".catalog__products");

  if (!hidden || !container) return;

  function loadProducts(orderby) {

    const url = new URL(window.location.pathname, window.location.origin);
    url.searchParams.set("orderby", orderby);

    fetch(url.toString(), {
      method: "GET",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
    })
      .then(r => r.text())
      .then(html => {

        const doc = new DOMParser().parseFromString(html, "text/html");
        const newBlock = doc.querySelector(".catalog__products");

        if (newBlock) {
          container.innerHTML = newBlock.innerHTML;
        }
      });
  }

  sort.querySelectorAll("[data-value]").forEach(item => {

    item.addEventListener("click", function () {

      const value = this.dataset.value;
      const text = this.textContent.trim();

      hidden.value = value;
      current.textContent = text;

      dropdown.classList.remove("open");

      loadProducts(value);
    });

  });

});

// search

window.addEventListener("load", function () {

  var $input = $("#search-input");
  var searchUrl = $input.data("url");

  $input.autocomplete({

    minLength: 2,

    open: function () {
      $(".header__search").addClass("is-open");
      $(".ui-autocomplete").addClass("is-visible");
    },

    close: function () {
      $(".header__search").removeClass("is-open");
      $(".ui-autocomplete").removeClass("is-visible");
    },

    source: function (request, response) {

      $.ajax({
        url: searchUrl,
        dataType: "json",
        data: { term: request.term },

        success: function (data) {

          response($.map(data, function (item) {
            return {
              label: item.label,
              value: item.label,
              url: item.producturl,
              image: item.productpictureurl
            };
          }));

        }
      });

    },

    select: function (event, ui) {
      if (ui.item && ui.item.url) {
        window.location.href = ui.item.url;
      }
    }

  });

  $.ui.autocomplete.prototype._renderItem = function (ul, item) {

    return $("<li>")
      .append(`
      <div class="search-item">
        <img src="${item.image || ''}" />
        <span>${item.label}</span>
        <div class="search-item__arrow"><img src="/Themes/MgurmanTheme/Content/images/search-arrow.svg" /></div>
      </div>
    `)
      .appendTo(ul);

  };

  document.querySelector(".header__search-btn")
    ?.addEventListener("click", function () {

      const term = $("#search-input").val()?.trim();

      if (!term)
        return;

      window.location.href =
        `/search?q=${encodeURIComponent(term)}`;
    });

  $(document).on("click", function (e) {
    if (!$(e.target).closest(".header__search").length) {
      $(".header__search").removeClass("is-open");
    }
  });

  $input.on("keydown", function (e) {

    if (e.key !== "Enter")
      return;

    const menu = $(".ui-autocomplete:visible");
    const activeItem = menu.find(".ui-state-active");

    if (activeItem.length)
      return;

    const term = $(this).val()?.trim();

    if (!term)
      return;

    window.location.href = `/search?q=${encodeURIComponent(term)}`;

    e.preventDefault();
  });

  // validation fix
  $.extend($.validator.messages, {
    email: "Введите корректный email адрес"
  });
});

// Buy func for catalog
document.addEventListener('click', function (e) {

  const btn = e.target.closest('.product__card-buy');
  if (!btn) return;

  e.preventDefault();

  const card = btn.closest('.product__card');
  if (!card) return;

  const productId = btn.dataset.productid;

  const counter = card.querySelector('.product-counter');
  const input = card.querySelector('.counter-value');

  const unit = (counter?.dataset.unit || 'piece').trim().toLowerCase();

  let quantity = 1;

  if (unit === 'kg') {

    const displayValue = Number(
      String(input.value).replace(',', '.')
    );

    if (Number.isFinite(displayValue)) {
      quantity = Math.round(displayValue * 10);
    }

  } else {

    quantity = parseInt(input.value, 10) || 1;
  }

  const url =
    `/addproducttocart/catalog/${productId}/1/${quantity}`;

  AjaxCart.addproducttocart_catalog(url);
});

// init

onReady(() => {
  initSliders();
  initCounters();
  initCartCounters();
  initSortSelect();
  initCustomSelectors();
  initSelectOutsideClick();
  initPagination();
  initOrdersSelect();
  initOrdersList();
  initDetailsInfo();
  initCheckoutSection();
  initDeliveryTimePick();
  initCartClearing();
  initPasswordVisibility();
  initCodeInput();
  initAccountForms();
  initBurgerMenu();
  initOrdersFilters();
});

// Re-init counters after cart update
function bootCartUI() {
  initCounters();
  initCartCounters();
}

document.addEventListener('DOMContentLoaded', function () {
  bootCartUI();
});

document.addEventListener('submit', function (e) {
  if (e.target && e.target.id === 'shopping-cart-form') {
    setTimeout(function () {
      bootCartUI();
    }, 300);
  }
});

document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'updatecart') {
    setTimeout(function () {
      bootCartUI();
    }, 300);
  }
});

function onePageCheckoutAdditionalFields() {
  var address2 = $('#BillingNewAddress_Address2');
  var separator = '; ';
  var array = [];

  var paymentValue = $('.payment-items input:checked').val();
  var paymentLabels = {
    'pay_cash': 'Наличными курьеру',
    'pay_card': 'Картой курьеру',
    'pay_online': 'Картой онлайн'
  };
  if (paymentValue && paymentLabels[paymentValue]) {
    array.push('Метод оплаты: ' + paymentLabels[paymentValue]);
  }

  var deliveryValue = $('input[name="pd_d-type"]:checked').val();
  var deliveryLabels = {
    '1': 'В ближайшее время',
    '2': 'В выбранное время',
    '3': 'Экспресс доставка'
  };
  if (deliveryValue && deliveryLabels[deliveryValue]) {
    array.push('Доставить заказ: ' + deliveryLabels[deliveryValue]);
  }

  var missingValue = $('input[name="pd_missing"]:checked').val();
  var missingLabels = {
    'replace': 'Связаться и согласовать замену',
    'analog': 'Заменить товар на аналогичный',
    'skip': 'Пропустить отсутствующий товар'
  };
  if (missingValue && missingLabels[missingValue]) {
    array.push('При отсутствии товара: ' + missingLabels[missingValue]);
  }

  var promoStr = $('#PaymentPromo_Input1').val().trim();
  if (promoStr && promoStr.length >= 3 && promoStr.length <= 10) {
    array.push('Промокод: ' + promoStr.toUpperCase());
  }

  var comment = $('#onepagecheckout__order_comment').val();
  if (comment && comment.trim().length > 0) {
    array.push('Комментарий к заказу: ' + comment);
  }

  address2.val(array.join(separator));
}

function updateAddress() {
  var chosenCity = document.querySelector('input[name="chosenCity"]:checked');
  if (chosenCity) {
    var addressInput = document.getElementById('BillingNewAddress_Address1');
    var addressValue = chosenCity.value + ' ' + addressInput.value;
    addressInput.value = addressValue;
  }
}

function initOrdersFilters() {

  const ordersContainer = document.querySelector('.orders__list');

  if (!ordersContainer) {
    return;
  }


  const orders = Array.from(
    ordersContainer.querySelectorAll('.order-item')
  );


  const statusButtons = document.querySelectorAll('.orders-select__btn');


  const sortSelect = document.querySelector('[data-name="orders-sort"]');


  const sortTrigger = sortSelect?.querySelector('.custom-select__trigger');


  const sortOptions = sortSelect?.querySelectorAll('.custom-select__option');


  const sortInput = sortSelect?.querySelector('input[type="hidden"]');



  let currentStatus = 'all';

  let currentSort = 'new';



  function renderOrders() {


    let filteredOrders = orders.filter(order => {


      if (currentStatus === 'all') {
        return true;
      }


      return order.dataset.status === currentStatus;

    });



    filteredOrders.sort((a, b) => {


      const dateA = Number(a.dataset.date);

      const dateB = Number(b.dataset.date);



      if (currentSort === 'new') {

        return dateB - dateA;

      }


      return dateA - dateB;


    });



    orders.forEach(order => {

      order.style.display = 'none';

    });



    filteredOrders.forEach(order => {

      order.style.display = '';

      ordersContainer.appendChild(order);

    });


  }




  statusButtons.forEach(button => {


    button.addEventListener('click', function () {


      statusButtons.forEach(btn => {

        btn.classList.remove('active');

      });


      this.classList.add('active');


      currentStatus = this.dataset.status;


      renderOrders();


    });


  });





  sortOptions?.forEach(option => {


    option.addEventListener('click', function () {


      currentSort = this.dataset.value;



      if (sortInput) {

        sortInput.value = currentSort;

      }



      if (sortTrigger) {

        sortTrigger.textContent = this.textContent;

      }



      renderOrders();


    });


  });





  renderOrders();

}