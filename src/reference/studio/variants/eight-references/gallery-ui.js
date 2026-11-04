const tabs = document.querySelector('.step-buttons');
if (tabs) {
  const buttons = [...tabs.querySelectorAll('button')];
  const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
  function showStep(current) {
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === current));
      panels[index].hidden = index !== current;
    });
  }
  tabs.addEventListener('click', event => {
    const index = buttons.indexOf(event.target.closest('button'));
    if (index !== -1) showStep(index);
  });
  showStep(1);
  tabs.hidden = false;
}

const reviewTrack = document.querySelector('#review-cards');
const reviewControls = document.querySelector('.review-controls');
if (reviewTrack && reviewControls) {
  const cards = [...reviewTrack.children];
  const previous = reviewControls.querySelector('[data-review-step="-1"]');
  const next = reviewControls.querySelector('[data-review-step="1"]');
  const status = reviewControls.querySelector('[role="status"]');
  const offset = card => card.offsetLeft - cards[0].offsetLeft;
  function currentCard() {
    return cards.reduce((nearest, card, index) =>
      Math.abs(offset(card) - reviewTrack.scrollLeft) < Math.abs(offset(cards[nearest]) - reviewTrack.scrollLeft)
        ? index : nearest, 0);
  }
  function updateReviews() {
    const index = currentCard();
    previous.disabled = index === 0;
    next.disabled = index === cards.length - 1;
    status.textContent = `${index + 1} / ${cards.length}`;
  }
  reviewControls.addEventListener('click', event => {
    const step = Number(event.target.closest('[data-review-step]')?.dataset.reviewStep);
    if (!step) return;
    const card = cards[currentCard() + step];
    if (card) reviewTrack.scrollTo({ left: offset(card) });
  });
  reviewTrack.addEventListener('scroll', updateReviews, { passive: true });
  updateReviews();
  reviewControls.hidden = false;
}
