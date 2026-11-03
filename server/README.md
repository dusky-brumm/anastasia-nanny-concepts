# Заявки с сайта в Telegram

## 1. Создайте бота и получите ID личного чата Анастасии

1. Откройте [@BotFather](https://t.me/BotFather), отправьте `/newbot` и сохраните выданный токен.
2. Передайте Анастасии ссылку на бота. Пусть она откроет его со своего аккаунта, нажмёт **Start** и отправит боту контрольное слово, которое вы ей сообщите.
3. В PowerShell 7 выполните команды ниже. Ввод токена скрыт. Найдите строку с контрольным словом и возьмите её `ChatId`. Используйте новый бот без вебхука и выполните команду в течение 24 часов после сообщения.

```powershell
$botToken = Read-Host 'Токен Telegram-бота' -MaskInput
try {
    $updates = Invoke-RestMethod "https://api.telegram.org/bot$botToken/getUpdates"
    $updates.result | ForEach-Object {
        if ($_.message.chat.type -eq 'private') {
            [pscustomobject]@{
                ChatId = $_.message.chat.id
                Username = $_.message.from.username
                Text = $_.message.text
            }
        }
    }
} catch {
    Write-Warning 'Telegram не вернул обновления. Проверьте токен и повторите.'
} finally {
    Remove-Variable botToken
}
```

См. [инструкцию Telegram по созданию бота](https://core.telegram.org/bots/tutorial) и [описание getUpdates](https://core.telegram.org/bots/api#getupdates).

## 2. Разверните обработчик в Cloudflare

Откройте терминал в корне проекта. Для команд понадобятся Node.js и аккаунт Cloudflare.

```powershell
Set-Location server
npx wrangler@4 login
npx wrangler@4 deploy
npx wrangler@4 secret put TELEGRAM_BOT_TOKEN
npx wrangler@4 secret put TELEGRAM_CHAT_ID
Set-Location ..
```

Каждая команда `secret put` попросит вставить соответствующее значение. Сохраните HTTPS-адрес `workers.dev` из вывода команды `deploy`. До добавления обоих секретов сервер возвращает 503. Для своего домена или локального прогона добавьте соответствующий origin (схема, хост и порт без пути) в `SITE_ORIGINS` через запятую и повторите `deploy`. Для текущего GitHub Pages нужный origin уже указан.

См. [развёртывание Workers](https://developers.cloudflare.com/workers/get-started/guide/) и [настройку секретов](https://developers.cloudflare.com/workers/configuration/secrets/).

## 3. Подключите сайт и проверьте доставку

1. В `src/reference/studio/request-endpoint.js` укажите HTTPS-адрес Worker с окончанием `/request`. Это публичный адрес. Токен и ID чата вводятся только на шаге 2.
2. В корне проекта выполните `npm run build`, `npm run check` и `npm test`. Опубликуйте обновлённый каталог `out/` в корень ветки `codex/github-pages` по текущей схеме GitHub Pages. Сохраните исходники в `main`.
3. Откройте главную опубликованного сайта и отправьте заявку с вымышленными данными и словом «Тест». Проверьте появление подтверждения на сайте и сообщения с именем, контактом и текстом в личном чате Анастасии с ботом.

Автоматическая доставка включается на главной после заполнения адреса. В конструкторе, галереях и на странице по образцу форма готовит черновик. Если сервер или Telegram не подтвердит доставку, главная сохранит введённые данные в форме и предложит ручную отправку. Заявки передаются через Worker в Telegram. Отдельной базы заявок нет.
