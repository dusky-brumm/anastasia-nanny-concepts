# Настя — индивидуальный подбор няни

[Сайт](https://dusky-brumm.github.io/anastasia-nanny-concepts/) · [Конструктор](https://dusky-brumm.github.io/anastasia-nanny-concepts/studio.html) · [Библиотека блоков](https://dusky-brumm.github.io/anastasia-nanny-concepts/blocks.html) · [Пять маршрутов](https://dusky-brumm.github.io/anastasia-nanny-concepts/routes.html).

На главной странице — рекомендованная сборка из девяти блоков: хедер, первый экран, услуга, об Анастасии, маршрут, стоимость и условия, отзывы, заявка, футер. В конструкторе у каждого блока пять композиций; доступны шесть пастельных палитр, четыре согласованных набора шрифтов и пять начальных сборок. В библиотеке можно сравнить варианты блока и перенести выбранный в конструктор.

Контент ограничен шириной 1120 px. На телефоне блоки перестраиваются в одну колонку, настройки конструктора раскрываются отдельной кнопкой, а раздел библиотеки выбирается из компактного списка. Основной шрифтовой набор — Manrope + Golos Text; альтернативы — Lora + Golos Text, Prata + Manrope, Tinos + Manrope. Для каждого набора настроены размеры, переносы и межбуквенное расстояние. Рукописный Caveat используется только в записке.

Палитры меняют всю страницу. Шрифты размещены локально, лицензии приложены. Фотографии в новых композициях взяты из предоставленных оригиналов: рамки, скотч, записка и фотоальбом собраны отдельными HTML/CSS-элементами. Предусмотрены видимый фокус, управление меню и диалогами с клавиатуры, небольшие эффекты наведения и системное уменьшение движения.

Ссылка на `preview.html` сохраняет девять вариантов в параметре `layout`, палитру в `palette` и набор шрифтов в `font`. Она открывает страницу без панели конструктора. В localStorage сохраняются только настройки дизайна. Контактные данные из формы в ссылку и localStorage не попадают. При смене оформления заполненные поля формы сохраняются. Старые ссылки `?route=1…5` меняют маршрут в рекомендованной сборке, а явно заданный `layout` имеет приоритет.

## Контакты и условия

Telegram Анастасии: [@inyfid](https://t.me/inyfid). Отзывы: [канал Анастасии](https://t.me/anastasiadoroninaa).

Стоимость проверена по [посту об условиях](https://t.me/anastasiadoroninaa/123) 2 ноября 2026: один месячный оклад няни, предоплата 25 000 ₽, окончательный расчёт после одной-двух пробных недель; неограниченное количество анкет и гарантия бесплатной замены шесть месяцев.

Главная может отправлять имя, контакт и текст заявки в личный Telegram Анастасии через бота. До подключения обработчика форма готовит черновик для ручной отправки. Этот же вариант доступен, если сервер не подтвердил доставку. Настройка бота, обработчика и публикация описаны в [инструкции](server/README.md). Для работы формы нужен JavaScript.

## Исходники

- `src/reference/studio/` — модель выбора, 45 HTML-композиций, шаблоны страниц, интерфейс и стили.
- `src/reference/request.js` — общий формат сообщения для новой и сохранённой версии сайта.
- `src/reference/journeys.js` и `journeys.css` — HTML-маршруты с векторными стрелками; пятый вариант с результатами этапов находится в `studio/render.js`.
- `scripts/build-reference.mjs` — сборка с версией ресурсов по хешу исходников.
- `out/` — результат сборки и единственная публикуемая директория.
- `.openai/hosting.json` — сохранённая идентичность частного Site и директория публикации.

Ранее воспроизведённый образец сохранён отдельно: [страница по образцу](https://dusky-brumm.github.io/anastasia-nanny-concepts/reference.html) и [четыре первоначальных маршрута](https://dusky-brumm.github.io/anastasia-nanny-concepts/reference-routes.html). В этой сохранённой версии горный и групповой снимки вырезаны из исходного макета и имеют ограниченную детализацию. Фотографии опубликованы с разрешения пользователя.

Старые исходники, материалы и локальные архивы сохранены. Галереи прежних концепций не входят в текущую публикацию. `/next.html` перенаправляет на главную. GitHub Pages публикуется из корня ветки `codex/github-pages`; её дерево берётся из `HEAD:out`. Исходники находятся в `main`.

## SEO

Для индексации предназначена главная страница услуги. Конструктор, библиотеки, чистые превью и сохранённые образцы получают `noindex, follow`. Канонические адреса не содержат параметров оформления и версии ресурсов. Главная содержит один H1, описание услуги, стоимость, пять ответов на частые вопросы в исходном HTML и связанную JSON-LD-разметку Person / Service / WebSite / WebPage. Выдуманные адреса, рейтинги и фиксированная цена услуги не добавлены: 25 000 ₽ — предоплата, а не полная стоимость.

Метаданные и публичный адрес задаются в `src/reference/studio/seo.js`, контакты и FAQ — в `content.js`. При переходе на свой домен нужно изменить `seoConfig.url` и пересобрать сайт. `areaServed` пока не задан: город или регион необходимо подтвердить у Анастасии, затем отразить в содержимом и разметке.

[Карта сайта](https://dusky-brumm.github.io/anastasia-nanny-concepts/sitemap.xml) содержит только главную. Её можно отправить в Google Search Console и Яндекс Вебмастер после подтверждения владения; подключения и отправки в этой задаче не выполнялись. Токены подтверждения и счётчики не добавлены.

Важно для текущего GitHub Pages: поисковые роботы читают `robots.txt` только в корне домена. Корневой `https://dusky-brumm.github.io/robots.txt` на момент проверки 3 ноября 2026 возвращает 404; файл проекта `/anastasia-nanny-concepts/robots.txt` не управляет обходом домена. В сборке он сохранён как шаблон для размещения сайта в корне собственного домена. Сейчас исключение служебных страниц работает через HTML `noindex`; закрывать их от обхода через `Disallow` не следует, иначе робот не увидит метатег. См. [документацию Google по noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing) и [Яндекса по robots.txt](https://yandex.ru/support/webmaster/en/controlling-robot/robots-txt).

Для ссылок в мессенджерах добавлена обложка 1200 × 630 и метаданные Open Graph / Twitter Card. PNG хранится в репозитории; при изменении текста её можно заново создать в PowerShell 7 командой `./scripts/make-social-card.ps1`, затем выполнить обычную сборку.

## Локальная работа и проверка

Нужны Node.js 20+ и Python 3. Зависимости npm не требуются.

```sh
npm run build
python -m http.server 4194 --bind 127.0.0.1 --directory out
```

Параметр `?capture=1` дожидается шрифтов, изображений и отрисовки для снимков. После крупных изменений и перед push:

```sh
npm run check
npm test
git diff --check
```

Статическая проверка охватывает ресурсы, шрифты, якоря, уникальность ID, синтаксис CSS/JS, девять блоков главной и 45 вариантов библиотеки, канонические адреса, индексацию, JSON-LD, FAQ, обложку и sitemap. 13 тестов проверяют общий текст заявки, сохранность выбранной сборки в ссылке, повреждённые настройки, совместимость старых маршрутов, изолированное изменение блока, контраст всех палитр на трёх фонах и SEO-шаблоны.

Визуальные проверки, скриншоты и дизайнерская критика находятся локально в `../../reference-work/studio/` и `../../reference-work/type-refine-20261102/` и не публикуются.


## Three refined directions — 3 November 2026

The new review page is `designs.html`. It presents live desktop/mobile previews and links to three complete, independent compositions:

- `refined/sky.html` — «Воздух»: milk/blue palette, sans-serif headings with Lora accents, right-hand portrait, open service and process layouts.
- `refined/story.html` — «История»: warm editorial layout, left-hand portrait, serif headings, vertical process and a contrasting contact section.
- `refined/garden.html` — «Рядом»: centered introduction, natural green palette, a photographic strip and a clearly separated pricing section.

Source files are in `src/reference/refined/` and `src/reference/designs.html`; the existing build copies them into `out/`. Shared navigation and browser-local message composition live in `refined/shared.js`. Forms never submit automatically, are disabled until their handler is installed, and invalidate an old draft when inputs change. Existing design URLs and the page builder remain available; the current homepage links to the new gallery.

Validation: existing build, static/SEO checks and all 14 existing tests passed. Browser review covered complete desktop pages, narrow mobile views, intermediate widths, mobile menus, pricing anchors, all three form integrations and draft invalidation. Corrected 320px overflow, image aspect ratios, small-label contrast and missing spaces around hidden line breaks. Temporary QA frames are excluded from publication.


## Rebuilt directions — 3 November 2026

The second review rejected the earlier three variants. The new series replaces their presentation code and the comparison page:

- `rework/method.html` — «По делу»: large Golos headings, a small author portrait and a concrete description of the detailed profiles the family receives.
- `rework/photo.html` — «Живой кадр»: a wide original family photograph below the headline, open sections and a row-based price table.
- `rework/contrast.html` — «Контраст»: a dark-green introductory composition, large Lora headings, rectangular portrait and pale-blue service/contact sections.

`designs.html` shows one full-size working page at a time with accessible tabs and desktop/phone sizes. `designs-v1.html` preserves the preceding comparison. All earlier page URLs remain available. Source is in `src/reference/rework`; the three desktop first-screen previews are in its `previews/` directory.

The current service facts and actual photographs are retained. The Telegram form only prepares a local message for the visitor to copy and send; it clears the old draft when the inputs change. Native mobile menus, anchor navigation, all three form integrations and the gallery controls were checked in the browser. Layout overflow was checked at nominal iframe widths 320, 390, 768, 1440, 1920 and 2560. Corrections include the biography photo height in the method page and a full-width readable introduction on the contrast page at phone widths. Desktop first screens and full method/contrast pages were reviewed; the photo page was reviewed in viewport sections because the browser's full-page screenshot operation timed out.

The existing 14 regression tests pass. Before packaging, run the build and static/SEO checks with the temporary responsive QA harness removed. Publication uses the existing owner-private Site. GitHub synchronization remains blocked by the previously returned integration write-access 403; no GitHub write retry is part of this round.
