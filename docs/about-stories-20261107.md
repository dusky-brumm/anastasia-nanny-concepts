# Знакомство с Анастасией · 7 ноября 2026

Изменён только блок знакомства и его управление. Три оформления переключаются кнопками 1–3 над блоком и сохраняются в ссылке `?about=1`, `?about=2`, `?about=3`.

1. **Фотоальбом:** голубой фон во всю ширину, ограниченный контент, зернистые голубая и шалфейная подложки как на главном экране, этюд с блокнотом.
2. **Личное письмо:** молочная карточка с аккуратной рисованной рамкой, арочная фотография и веточка мелком.
3. **Линия истории:** меловая линия и главы; на достаточно высоких широких экранах блок закрепляется, четыре истории меняются по ходу естественной прокрутки. Колесо и сенсорная прокрутка не перехватываются. На узких/низких экранах и при уменьшении движения используется обычный слайдер.

Слайды меняются каждые 6,5 секунды, пока блок виден. Есть пауза, стрелки, меловые точки, клавиатура и горизонтальный свайп. Автосмена приостановлена при скрытой вкладке, управлении с клавиатуры и системной настройке уменьшения движения. Во время закреплённой истории слайды зависят только от прокрутки. Ссылка «К этапам подбора» позволяет пройти дальше сразу.

Высота резервирует самый длинный текст, чтобы соседние блоки не прыгали. Фотографии и четыре исходных текста сохранены.

## Новые изображения

Созданы встроенным ImageGen. Оригинальные PNG скопированы в `C:/Users/Нат/Documents/ChatGPT/Anastasia/artifacts/about-stories-20261107/originals/`. Используемые копии находятся в `src/site/artwork/illustrations/`, входят в библиотеку и ZIP. Прозрачность сохранена; существующие иллюстрации не заменялись.

### Блокнот

Файл: `about-notebook-20261107.png`

```text
Use case: illustration-story. Asset: elegant dry-chalk illustration for an Anastasia nanny selection website, beside authentic portrait photographs on pale blue #e7f1f6 or milk #fcfcfa. Draw a small open personal notebook, one wooden pencil resting diagonally, a very simple airy leafy twig emerging beside it, with a single loose curved line trailing out to the right. Match the reference's restrained, sophisticated hand-drawn wax/chalk medium: visible broken granular crayon strokes, broad softly dry lines, minimal cross-hatching, ample empty space. Muted slate blue #658392, sage #8d9f84, tiny cream and warm ochre accents. Simple elegant adult editorial sketch, no cartoon face, no cute childhood doodles, no 3D or watercolor. One isolated composition, centered, all objects fully contained with wide margins. True transparent background; no solid backdrop, shadow plate, fake checkerboard, lettering or watermark. Landscape 3:2.
```

### Веточка

Файл: `about-branch-20261107.png`

```text
Use case: illustration-story. Transparent isolated decorative illustration for a refined personal nanny selection website. A single elegantly curved botanical branch, seven elongated leaves and three tiny seed pods, with one open loose slate-blue chalk loop gently crossing its stem. Composition is very airy and asymmetrical, designed for the lower outer corner of a real portrait photograph, fully visible with generous transparent margins. Adult editorial dry pastel/crayon sketch: thick broken grainy strokes on rough paper, subtly visible pressure variation, sparse hatching, beautiful simple confident linework. Restrained sage green #8d9f84 and slate blue #658392, a tiny muted ochre accent, creamy highlights. Flat isolated drawing; no photorealism, watercolor, vector-smooth strokes, childish doodles, lettering, borders, drop shadows, glow or mist. True alpha transparency, no background color. Square image.
```

## Проверка

Проверены три оформления, автосмена, пауза, ручное управление, прокрутка вперёд и назад и выход к следующему блоку. Мобильная раскладка проверена на 390 и 320 px; все десять исторических заголовочных шрифтов на 320 px помещаются без переполнения. Сборка, проверки ресурсов и существующие тесты вместе с проверками индексов историй запускаются перед публикацией.

