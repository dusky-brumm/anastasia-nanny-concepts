const tabs = document.querySelector('.step-buttons');
if (tabs) {
  const buttons = [...tabs.querySelectorAll('button')];
  const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
  const navigation = tabs.closest('.screening-navigation');
  let currentStep = 0;
  function showStep(current) {
    currentStep = (current + buttons.length) % buttons.length;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-pressed', String(index === currentStep));
      panels[index].hidden = index !== currentStep;
    });
    navigation.querySelector('.step-status').textContent = `${currentStep + 1} из ${buttons.length}`;
  }
  tabs.addEventListener('click', event => {
    const index = buttons.indexOf(event.target.closest('button'));
    if (index !== -1) showStep(index);
  });
  navigation.addEventListener('click', event => {
    const change = Number(event.target.closest('[data-step-change]')?.dataset.stepChange);
    if (change) showStep(currentStep + change);
  });
  showStep(0);
  navigation.hidden = false;
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
