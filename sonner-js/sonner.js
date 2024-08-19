function getAsset(type) {
  const ICONS = {
    success: `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" height="20" width="20">
    <path
      fill-rule="evenodd"
      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
      clip-rule="evenodd"
    />
  </svg>`,
    error: `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewbox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
      clip-rule="evenodd"
    />
  </svg>`,
    info: `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fill-rule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
      clip-rule="evenodd"
    />
  </svg>`,
    warning: `
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    height="20"
    width="20"
  >
    <path
      fill-rule="evenodd"
      d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
      clip-rule="evenodd"
    />
  </svg>`,
    loading: `<div class="toaster-loader-wrapper">${new Array(12).fill('<div class="line"></div>').join('\n')}</div>`,
  };

  return ICONS[type] || null;
}

// Definição de variáveis e funções necessárias
const VIEWPORT_OFFSET = '32px';
const VISIBLE_TOASTS_AMOUNT = 3;
const GAP = 14;
const TOAST_LIFETIME = 4000;
const TIME_BEFORE_UNMOUNT = 200;
const TOAST_WIDTH = 356;
const DEFAULT_POSITION = 'bottom-right';

// Função básica de toast
function basicToast(content, { description = '', type, action } = {}) {
  const wrapper = document.querySelector('#toaster-wrapper');
  if (!wrapper) {
    throw new Error('No wrapper element found, please follow documentation');
  }

  if (!document.getElementById('toaster-list')) {
    renderToaster();
  }

  updatePosition();
  updateRichColors();

  const { toast } = createToast(content, { description, type, action });

  return toast;
}

function renderToaster() {
  const el = document.querySelector('#toaster-wrapper');
  const ol = document.createElement('ol');
  el.append(ol);

  const [y, x] = getPositionAttributes(el, DEFAULT_POSITION);
  const richColors = el.getAttribute('data-rich-colors') === 'true';
  const expand = el.getAttribute('data-expand') === 'true';
  const position = el.getAttribute('data-position') || DEFAULT_POSITION;

  ol.outerHTML = `
    <ol
      data-sonner-toaster="true"
      data-theme="light"
      data-x-position="${x}"
      data-y-position="${y}"
      ${richColors ? 'data-rich-colors="true"' : ''}
      ${expand ? 'data-expand="true"' : ''}
      data-position="${position}"
      id="toaster-list"
      style="--front-toast-height: 0px; --offset: ${VIEWPORT_OFFSET}; --width: ${TOAST_WIDTH}px; --gap: ${GAP}px; ${getPositionStyles(y, x)}">
    </ol>`;

  registerMouseOver();
}

function getPositionStyles(y, x) {
  let styles = '';
  if (y === 'top') {
    styles += `top: ${VIEWPORT_OFFSET};`;
  } else if (y === 'bottom') {
    styles += `bottom: ${VIEWPORT_OFFSET};`;
  }

  if (x === 'left') {
    styles += `left: ${VIEWPORT_OFFSET};`;
  } else if (x === 'center') {
    styles += `left: 50%; transform: translateX(-50%);`;
  } else if (x === 'right') {
    styles += `right: ${VIEWPORT_OFFSET};`;
  }

  return styles;
}

function updatePosition() {
  const list = document.getElementById('toaster-list');
  const [y, x] = getPositionAttributes(list.parentElement, DEFAULT_POSITION);
  
  if (x !== list.getAttribute('data-x-position') || y !== list.getAttribute('data-y-position')) {
    updateElementAttributes(list, { 'data-x-position': x, 'data-y-position': y });
    
    Array.from(list.children).forEach(el => {
      updateElementAttributes(el, { 'data-x-position': x, 'data-y-position': y });
    });
  }
}

function updateRichColors() {
  const list = document.getElementById('toaster-list');
  const richColors = list.parentElement.getAttribute('data-rich-colors') || '';
  if (list.getAttribute('data-rich-colors') !== richColors) {
    list.setAttribute('data-rich-colors', richColors);
  }
}

function registerMouseOver() {
  const ol = document.getElementById('toaster-list');
  const expandAlways = ol.parentElement.getAttribute('data-expand') === 'true';

  if (expandAlways) {
    // Se expand for verdadeiro, manter todos os toasts expandidos
    Array.from(ol.children).forEach(el => {
      el.setAttribute('data-expanded', 'true');
    });
    return;
  }

  // Lógica normal de mouseover/mouseleave
  ol.addEventListener('mouseenter', () => {
    Array.from(ol.children).forEach(el => {
      if (el.getAttribute('data-expanded') === 'true') return;
      el.setAttribute('data-expanded', 'true');
      clearRemoveTimeout(el);
    });
  });

  ol.addEventListener('mouseleave', () => {
    Array.from(ol.children).forEach(el => {
      if (el.getAttribute('data-expanded') === 'false') return;
      el.setAttribute('data-expanded', 'false');
      registerRemoveTimeout(el);
    });
  });
}

function createToast(message, { description, type, action, position } = {}) {
  const list = document.getElementById('toaster-list');
  const expandAlways = list.parentElement.getAttribute('data-expand') === 'true';
  const toastPosition = list.parentElement.getAttribute('data-position') || DEFAULT_POSITION;
  const { toast, id } = renderToast(list, message, { description, type, action, position: toastPosition });

  setTimeout(() => {
    if (list.children.length > 0) {
      const el = list.children[0];
      const height = el.getBoundingClientRect().height;

    el.setAttribute('data-mounted', 'true');
    el.setAttribute('data-initial-height', `${height}`);
    el.style.setProperty('--initial-height', `${height}px`);
    list.style.setProperty('--front-toast-height', `${height}px`);

    if (expandAlways) {
      el.setAttribute('data-expanded', 'true');
    }

    refreshProperties();
    registerRemoveTimeout(el);
  }
  }, 16);

  return { toast, id };
}

function applyToastStyles(toast, type) {
  const root = document.documentElement;

  const resolvedType = type === 'promise' ? 'normal' : type || 'normal';

  toast.style.backgroundColor = getComputedStyle(root).getPropertyValue(`--${resolvedType}-bg`).trim();
  toast.style.borderColor = getComputedStyle(root).getPropertyValue(`--${resolvedType}-border`).trim();
  toast.style.color = getComputedStyle(root).getPropertyValue(`--${resolvedType}-text`).trim();
}

function removeToast(id) {
  const toast = document.querySelector(`.toast[data-id="${id}"]`);
  if (toast) {
    removeElement(toast);
  }
}

// Renderiza o toast na tela
function renderToast(list, content, { description, type, action, position } = {}) {
  const toast = document.createElement('li');
  const id = genid();
  const count = list.children.length;
  const asset = getAsset(type) || '';

  const closeButtonHtml = createCloseButton(id, type);
  const actionHtml = action ? createActionButton(action) : '';

  toast.innerHTML = `
    ${closeButtonHtml}
    ${asset ? `<div data-icon="">${asset}</div>` : ''}
    <div data-content="">
      <div data-title="">${content}</div>
      ${description ? `<div data-description="">${description}</div>` : ''}
    </div>
    ${actionHtml}`;

  toast.classList.add('toast');
  updateElementAttributes(toast, {
    'data-id': id,
    'data-type': type || '',
    'data-position': position || 'bottom-right',
    'data-removed': 'false',
    'data-mounted': 'false',
    'data-front': 'true',
    'data-expanded': 'false',
    'data-index': '0',
    'data-y-position': list.getAttribute('data-y-position') || position.split('-')[0],
    'data-x-position': list.getAttribute('data-x-position') || position.split('-')[1],
    style: `--index: 0; --toasts-before: 0; --z-index: ${count}; --offset: 0px; --initial-height: 0px;`
  });

  list.prepend(toast);

  applyToastStyles(toast, type);

  return { toast, id };
}

function createActionButton(action) {
  return `
    <button class="toast-action-button" onclick="(${action.onClick.toString()})()"
      style="
        border-radius: 4px;
        padding-left: 8px;
        padding-right: 8px;
        height: 24px;
        font-size: 12px;
        color: var(--normal-bg);
        background: var(--normal-text);
        margin-left: auto;
        margin-right: 0px;
        margin-top: 0px;
        border: none;
        cursor: pointer;
        outline: none;
        display: flex;
        align-items: center;
        flex-shrink: 0;
        transition: opacity .4s, box-shadow .2s;
      ">
      ${action.label}
    </button>`;
}

function updateToast(id, message, type) {
  const toast = document.querySelector(`.toast[data-id="${id}"]`);

  if (toast) {
    // Atualizar o conteúdo e o tipo do toast
    toast.querySelector('[data-title]').textContent = message;
    toast.setAttribute('data-type', type);

    // Atualizar o estilo do toast
    applyToastStyles(toast, type);

    // Atualizar o ícone, se necessário
    const asset = getAsset(type);
    if (asset) {
      const iconContainer = toast.querySelector('[data-icon]');
      if (iconContainer) {
        iconContainer.innerHTML = asset;
      }
    }

    // Atualizar o botão de fechar com as novas cores
    const closeButtonHtml = createCloseButton(id, type);
    const existingCloseButton = toast.querySelector('.toast-close-button');
    if (existingCloseButton) {
      existingCloseButton.outerHTML = closeButtonHtml;
    }
  }
}

function promiseToast(promise, { loading, success, error }) {
  // Criar o toast inicial com a mensagem de loading
  const { toast, id } = createToast(loading, { type: 'loading' });

  // Quando a promise for resolvida com sucesso
  promise.then(
    (result) => {
      const successMessage = typeof success === 'function' ? success(result) : success;
      updateToast(id, successMessage, 'success');
    },
    (err) => {
      const errorMessage = typeof error === 'function' ? error(err) : error;
      updateToast(id, errorMessage, 'error');
    }
  );
}

// Definindo estilos para o botão de ação
const style = document.createElement('style');
style.innerHTML = `

.toast-action-button {
  margin-top: 10px;
  background: transparent;
  border: none;
  color: var(--action-color, blue);
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;
}
`;

function createCloseButton(id, type) {
  const toasterElement = document.querySelector('#toaster-wrapper [data-sonner-toaster]');

  // Resolve o tipo para 'normal' caso seja 'promise' ou se não houver tipo
  const resolvedType = type === 'promise' || !type ? 'normal' : type;

  // Obtém as cores para o botão de fechar
  const backgroundColor = getComputedStyle(toasterElement).getPropertyValue(`--${resolvedType}-bg`).trim();
  const borderColor = getComputedStyle(toasterElement).getPropertyValue(`--${resolvedType}-border`).trim();
  const color = getComputedStyle(toasterElement).getPropertyValue(`--${resolvedType}-text`).trim();

  return `
    <button class="toast-close-button" onclick="removeToast('${id}')" 
      style="
        background-color: ${backgroundColor || '#fff'};
        border: 1px solid ${borderColor || '#ccc'};
        color: ${color || '#000'};
        position: absolute; 
        top: -10px; 
        left: -10px; 
        border-radius: 50%; 
        width: 20px; 
        height: 20px; 
        cursor: pointer; 
        font-size: 14px; 
        line-height: 18px; 
        text-align: center; 
        padding: 0;
      ">
      &times;
    </button>`;
}

function refreshProperties() {
  const list = document.getElementById('toaster-list');

  let heightsBefore = 0;
  let removed = 0;

  Array.from(list.children).forEach((el, i) => {
    if (el.getAttribute('data-removed') === 'true') {
      removed++;
      return;
    }

    const idx = i - removed;
    updateElementAttributes(el, {
      'data-index': `${idx}`,
      'data-front': idx === 0 ? 'true' : 'false',
      'data-visible': idx < VISIBLE_TOASTS_AMOUNT ? 'true' : 'false',
    });
    el.style.setProperty('--index', `${idx}`);
    el.style.setProperty('--toasts-before', `${idx}`);
    el.style.setProperty('--offset', `${GAP * idx + heightsBefore}px`);
    el.style.setProperty('--z-index', `${list.children.length - i}`);
    heightsBefore += Number(el.getAttribute('data-initial-height'));
  });
}

function registerRemoveTimeout(el) {
  const tid = setTimeout(() => {
    removeElement(el);
  }, TOAST_LIFETIME);
  el.setAttribute('data-remove-tid', `${tid}`);
}

function clearRemoveTimeout(el) {
  const tid = el.getAttribute('data-remove-tid');
  if (tid != null) clearTimeout(+tid);
}

function removeElement(el) {
  el.setAttribute('data-removed', 'true');
  refreshProperties();

  const tid = setTimeout(() => {
    el.parentElement?.removeChild(el);
  }, TIME_BEFORE_UNMOUNT);
  el.setAttribute('data-unmount-tid', `${tid}`);
}

function getPositionAttributes(element, defaultPosition) {
  return (element.getAttribute('data-position') || defaultPosition).split('-');
}

function updateElementAttributes(element, attributes) {
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
}

function genid() {
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function shouldShowCloseButton() {
  const wrapper = document.getElementById('toaster-wrapper');
  return wrapper && wrapper.hasAttribute('closeButton');
}

// Definindo o objeto `toast` e as funções disponíveis
const toast = {
  default: (message, options = {}) => basicToast(message, options),
  message: (message, options = {}) => basicToast(message, options),
  success: (message, options = {}) => basicToast(message, { ...options, type: 'success' }),
  info: (message, options = {}) => basicToast(message, { ...options, type: 'info' }),
  warning: (message, options = {}) => basicToast(message, { ...options, type: 'warning' }),
  error: (message, options = {}) => basicToast(message, { ...options, type: 'error' }),
  loading: (message, options = {}) => basicToast(message, { ...options, type: 'loading' }),
  promise: (promise, data) => promiseToast(promise, data),
  custom: (content, options = {}) => basicToast(content, options)
};

window.toast = toast;

// Exemplo de inicialização (coloque isso onde for necessário)
/* document.addEventListener('DOMContentLoaded', () => {
  toast.success('This is a success message!');
  toast.error('This is an error message!');
  toast.info('This is an info message!');
  toast.warning('This is a warning message!');
});

document.head.appendChild(style); */