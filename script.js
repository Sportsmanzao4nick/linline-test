const menuButton = document.querySelector('.header__menu-list');
const mobileMenu = document.getElementById('mobileMenu');
const header = document.querySelector('.header');
const menuList = document.getElementById('mobileMenuList');

function renderMenuItems(items, parentUl) {
  if (!items || !Array.isArray(items)) return;
  items.forEach(item => {
    const li = document.createElement('li');
    li.className = 'mobile-menu__item';

    if (item.children && Array.isArray(item.children) && item.children.length) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mobile-menu__toggle';
      btn.textContent = item.title || '';
      btn.setAttribute('aria-expanded', 'false');
      li.appendChild(btn);

      const subUl = document.createElement('ul');
      subUl.className = 'mobile-menu__sublist';
      renderMenuItems(item.children, subUl);
      li.appendChild(subUl);

      btn.addEventListener('click', () => {
        const opened = subUl.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', opened ? 'true' : 'false');
      });

    } else {
      const a = document.createElement('a');
      a.href = '#';
      a.textContent = item.title || '';
      li.appendChild(a);
    }

    parentUl.appendChild(li);
  });
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
