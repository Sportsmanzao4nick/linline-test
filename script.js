const menuButton = document.querySelector('.header__menu-list');

if (menuButton) {
  const img = menuButton.querySelector('img');

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.classList.toggle('is-open');

    if (img) {
      img.src = isOpen
        ? './public/icons/close.svg'
        : './public/icons/menu.svg';
    }
  });
}
