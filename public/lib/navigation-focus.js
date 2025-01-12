document.addEventListener('focusout', (e) => {
  sessionStorage.removeItem('last-focus-selector');
  sessionStorage.removeItem('last-focus-page');
});
document.addEventListener('focusin', (e) => {
  if (e.target instanceof HTMLElement) {
    let selector = e.target.localName;
    const name = e.target.getAttribute('name');
    if (name) {
      selector = e.target.localName + `[name="${name}"]`;
    }
    for (let el = e.target.parentElement; el && el !== document.body; el = el.parentElement) {
      selector = el.localName + ' ' + selector;
    }
    sessionStorage.setItem('last-focus-selector', selector);
    sessionStorage.setItem('last-focus-page', location.pathname);
  }
});

if (sessionStorage.getItem('last-focus-page') === location.pathname) {
  const selector = sessionStorage.getItem('last-focus-selector');
  if (selector) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLElement) {
      if (document.readyState === 'complete') {
        el.focus();
      } else {
        document.addEventListener("readystatechange", () => el.focus());
      }
    }
  }
} else {
  sessionStorage.removeItem('last-focus-selector');
  sessionStorage.removeItem('last-focus-page');
}