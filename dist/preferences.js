const key = 'anastasia-design-favorites-v1';
let memory = [];
let storageUnavailable = false;

export function getFavorites() {
  if (storageUnavailable) return [...new Set(memory)];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) memory = saved.filter(id=>typeof id==='string' && /^(?:next-)?\d{2}-[a-z]+$/.test(id));
  } catch { storageUnavailable = true; }
  return [...new Set(memory)];
}

export function toggleFavorite(id) {
  const favorites = new Set(getFavorites());
  if (favorites.has(id)) favorites.delete(id); else favorites.add(id);
  memory = [...favorites];
  try { localStorage.setItem(key, JSON.stringify(memory)); } catch { storageUnavailable = true; }
  window.dispatchEvent(new CustomEvent('favoriteschange'));
  return favorites.has(id);
}

export function initFavorites(root = document) {
  const update = () => {
    const saved = new Set(getFavorites());
    root.querySelectorAll('[data-favorite-id]').forEach(button=>{
      const active = saved.has(button.dataset.favoriteId);
      button.setAttribute('aria-pressed',String(active));
      button.textContent = active ? '♥ В избранном' : '♡ В избранное';
      const name=button.dataset.favoriteName||button.dataset.favoriteId;
      button.setAttribute('aria-label',`${active?'Убрать':'Добавить'} вариант «${name}» ${active?'из избранного':'в избранное'}`);
    });
  };
  root.querySelectorAll('[data-favorite-id]').forEach(button=>button.addEventListener('click',()=>{
    const added = toggleFavorite(button.dataset.favoriteId);
    const status = document.querySelector('#favorite-status');
    if (status) status.textContent = added ? 'Вариант добавлен в избранное на этом устройстве.' : 'Вариант удалён из избранного.';
  }));
  window.addEventListener('favoriteschange',update);
  window.addEventListener('storage',event=>{if(event.key===key)update();});
  update();
}
