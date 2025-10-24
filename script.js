const menuButton = document.querySelector('.header__menu-list');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.querySelector('.header');
const menuList = document.getElementById('mobileMenuList');

const getMobileInner = () => mobileMenu ? mobileMenu.querySelector('.mobile-menu__inner') : null;
const activePanelStack = [];
const activePanelTriggerStack = [];

let sharedSubPanel = null;
let sharedSubUl = null;
let sharedPanelTitle = null;
let sharedPanelBackBtn = null;

function renderMenuItems(items, parentUl) {
  if (!items || !Array.isArray(items)) return;
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'mobile-menu__item';

    const type = (item && item.type) ? String(item.type).toLowerCase() : null;
    const hasChildren = item.children && Array.isArray(item.children) && item.children.length;

    let resolvedType = type;
    if (!resolvedType) {
      if (hasChildren) resolvedType = 'dropdown';
      else resolvedType = 'link';
    }

    if (resolvedType === 'link') {
      const a = document.createElement('a');
      a.href = item.href || '#';
      a.textContent = item.title || '';
      li.appendChild(a);

    } else if (resolvedType === 'dropdown') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mobile-menu__toggle';
      btn.textContent = item.title || '';
      btn.setAttribute('aria-expanded', 'false');
      li.appendChild(btn);

      const subUl = document.createElement('ul');
      subUl.className = 'mobile-menu__sublist';
      renderMenuItems(item.children, subUl, item.title);
      li.appendChild(subUl);

      btn.addEventListener('click', () => {
        const opened = subUl.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });

    } else if (resolvedType === 'submenu') {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mobile-menu__item mobile-menu__item-panel';
      btn.textContent = item.title || '';
      btn.setAttribute('aria-expanded', 'false');
      btn.addEventListener('click', () => openPanel(item, btn));
      li.appendChild(btn);

    } else {
      const a = document.createElement('a');
      a.href = item.href || '#';
      a.textContent = item.title || '';
      li.appendChild(a);
    }

    parentUl.appendChild(li);
  });
}

function createPanel(item) {
  const mobileInner = getMobileInner();
  if (!mobileInner) return null;

  if (sharedSubPanel) {
    if (sharedSubUl) {
      sharedSubUl.innerHTML = '';
      renderMenuItems(item.children, sharedSubUl);
    }
    if (sharedPanelTitle) sharedPanelTitle.textContent = item.title || '';
    activePanelStack.push(sharedSubPanel);
    return sharedSubPanel;
  }

  const panel = document.createElement('div');
  panel.className = 'mobile-subpanel';

  const header = document.createElement('div');
  header.className = 'mobile-subpanel__header';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'mobile-subpanel__back';
  backBtn.innerHTML = `
    <span class="mobile-subpanel__back-round" aria-hidden="true">
      <img src="./public/icons/arrow-down.svg" alt="back" />
    </span>
  `;
  backBtn.addEventListener('click', () => closePanel());

  const title = document.createElement('div');
  title.className = 'mobile-subpanel__title';
  title.textContent = item.title || '';

  header.appendChild(backBtn);
  header.appendChild(title);
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'mobile-subpanel__content';

  const ul = document.createElement('ul');
  ul.className = 'mobile-menu__list mobile-subpanel__list';
  renderMenuItems(item.children, ul, item.title);
  content.appendChild(ul);
  panel.appendChild(content);

  mobileInner.appendChild(panel);
  activePanelStack.push(panel);
  return panel;
}

function openPanel(item, triggerBtn) {
  const panel = createPanel(item);
  if (!panel) return;
  activePanelTriggerStack.push(triggerBtn || null);
  const currentTrigger = activePanelTriggerStack[activePanelTriggerStack.length - 1];
  if (currentTrigger) currentTrigger.setAttribute('aria-expanded', 'true');
  requestAnimationFrame(() => panel.classList.add('is-open'));
  requestAnimationFrame(() => {
    const back = panel.querySelector('.mobile-subpanel__back');
    if (back) back.focus();
  });
}

function closePanel() {
  if (activePanelStack.length === 0) return;
  const panel = activePanelStack.pop();
  panel.classList.remove('is-open');
  const p = panel;
  p.addEventListener('transitionend', function onEnd() {
    p.removeEventListener('transitionend', onEnd);
    if (p.parentNode) p.parentNode.removeChild(p);
  });
  const trigger = activePanelTriggerStack.pop();
  if (trigger) {
    try { trigger.setAttribute('aria-expanded', 'false'); } catch (e) {}
    try { trigger.focus(); } catch (e) {}
  }
}

function loadMenuFromJson() {
  if (!menuList) return;
  const data = window.MENU_DATA;
  if (data && Array.isArray(data.menu)) {
    menuList.innerHTML = '';
    renderMenuItems(data.menu, menuList);
  } else {
    console.warn('MENU_DATA not found or invalid - using fallback menu');
    menuList.innerHTML = '<li class="mobile-menu__item"><a href="#">Главная</a></li>';
  }
}

loadMenuFromJson();

const proceedMenuLogic = () => {
  if (!menuButton) return;

  const img = menuButton.querySelector('img');

  const toggleMenu = (isOpen) => {
    menuButton.classList.toggle('is-open', isOpen);
    document.body.classList.toggle('mobile-menu-open', isOpen);

    if (mobileMenu) {
      mobileMenu.classList.toggle('is-open', isOpen);
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
    }

    if (img) {
      img.src = isOpen
        ? './public/icons/close.svg'
        : './public/icons/menu.svg';
    }

    if (!isOpen) {
      while (activePanelStack.length) closePanel();
      if (sharedSubPanel && sharedSubPanel.parentNode) {
        try { sharedSubPanel.parentNode.removeChild(sharedSubPanel); } catch (e) {}
      }
      sharedSubPanel = null;
      sharedSubUl = null;
      sharedPanelTitle = null;
      sharedPanelBackBtn = null;
    } else {
      const mobileInner = getMobileInner();
      if (mobileInner && !sharedSubPanel) {
        sharedSubPanel = document.createElement('div');
        sharedSubPanel.className = 'mobile-subpanel';

        const header = document.createElement('div');
        header.className = 'mobile-subpanel__header';

        sharedPanelBackBtn = document.createElement('button');
        sharedPanelBackBtn.type = 'button';
        sharedPanelBackBtn.className = 'mobile-subpanel__back';
        sharedPanelBackBtn.innerHTML = `
          <span class="mobile-subpanel__back-round" aria-hidden="true">
            <img src="./public/icons/arrow-down.svg" alt="back" />
          </span>
        `;
        sharedPanelBackBtn.addEventListener('click', () => {
          sharedSubPanel.classList.remove('is-open');
          if (sharedSubUl) sharedSubUl.innerHTML = '';
          const trigger = activePanelTriggerStack.pop();
          if (trigger) {
            try { trigger.setAttribute('aria-expanded', 'false'); } catch (e) {}
            try { trigger.focus(); } catch (e) {}
          }
        });

        sharedPanelTitle = document.createElement('div');
        sharedPanelTitle.className = 'mobile-subpanel__title';
        sharedPanelTitle.textContent = '';

        header.appendChild(sharedPanelBackBtn);
        header.appendChild(sharedPanelTitle);
        sharedSubPanel.appendChild(header);

        const content = document.createElement('div');
        content.className = 'mobile-subpanel__content';

        sharedSubUl = document.createElement('ul');
        sharedSubUl.className = 'mobile-menu__list mobile-subpanel__list';
        content.appendChild(sharedSubUl);
        sharedSubPanel.appendChild(content);

        mobileInner.appendChild(sharedSubPanel);
      }
    }
  };

  if (mobileMenu && header) {
    const updateMenuPosition = () => {
      const headerHeight = header.offsetHeight;
      mobileMenu.style.top = `${headerHeight}px`;
      mobileMenu.style.height = `${Math.max(0, window.innerHeight - headerHeight)}px`;
    };

    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('orientationchange', updateMenuPosition);
    updateMenuPosition();

    menuButton.addEventListener('click', () => {
      const isOpen = !menuButton.classList.contains('is-open');
      toggleMenu(isOpen);
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') toggleMenu(false);
    });

  } else {
    menuButton.addEventListener('click', () => {
      const isOpen = !menuButton.classList.contains('is-open');
      toggleMenu(isOpen);
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', proceedMenuLogic);
} else {
  proceedMenuLogic();
}
