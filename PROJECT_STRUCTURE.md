# Структура проекта FunPay Pro

## Обзор

Полнофункциональное браузерное расширение для торговли на FunPay.com с backend сервером для обработки данных.

## Структура файлов

```
funpay-pro-extension/
│
├── manifest.json                     # Конфигурация расширения (Manifest V3)
├── package.json                      # NPM конфигурация корневого проекта
├── .gitignore                        # Git ignore файл
│
├── README.md                         # Основная документация
├── INSTALLATION.md                   # Руководство по установке
├── USAGE.md                          # Руководство по использованию
├── PROJECT_STRUCTURE.md              # Этот файл
│
├── src/                              # Исходный код расширения
│   │
│   ├── background/                   # Фоновые процессы
│   │   ├── service-worker.js        # Главный service worker (управление)
│   │   └── analytics-engine.js      # Движок анализа цен и рекомендаций
│   │
│   ├── content/                      # Content scripts (внедрение в FunPay)
│   │   ├── content-script.js        # Логика интеграции с сайтом
│   │   └── content-styles.css       # Стили для внедряемых элементов
│   │
│   ├── popup/                        # Popup UI (иконка расширения)
│   │   ├── popup.html               # Структура popup
│   │   ├── popup.js                 # Логика popup
│   │   └── popup.css                # Стили popup
│   │
│   ├── options/                      # Страница настроек
│   │   ├── options.html             # Структура страницы настроек
│   │   ├── options.js               # Логика настроек
│   │   └── options.css              # Стили настроек
│   │
│   ├── dashboard/                    # Полноэкранный Dashboard
│   │   ├── dashboard.html           # Структура dashboard
│   │   ├── dashboard.js             # Логика dashboard + Chart.js
│   │   └── dashboard.css            # Стили dashboard
│   │
│   ├── lib/                          # Библиотеки и утилиты
│   │   ├── storage.js               # IndexedDB обёртка для хранения
│   │   ├── api.js                   # API клиент для backend
│   │   ├── auth.js                  # Управление аутентификацией через cookies
│   │   ├── notifications.js         # Система уведомлений
│   │   └── utils.js                 # Вспомогательные функции
│   │
│   └── icons/                        # Иконки расширения
│       ├── icon16.png               # 16x16 иконка
│       ├── icon48.png               # 48x48 иконка
│       ├── icon128.png              # 128x128 иконка
│       └── README.md                # Инструкции по иконкам
│
└── backend/                          # Backend API сервер
    │
    ├── package.json                  # NPM конфигурация backend
    ├── server.js                     # Express сервер
    ├── .env.example                  # Пример конфигурации
    │
    ├── routes/                       # API маршруты
    │   ├── competitors.js           # /api/competitors/* endpoints
    │   ├── analysis.js              # /api/analysis/* endpoints
    │   └── prices.js                # /api/prices/* endpoints
    │
    └── services/                     # Бизнес-логика
        ├── scraper.js               # Парсинг данных FunPay
        ├── price-analyzer.js        # Анализ цен и рекомендации
        └── trend-analyzer.js        # Анализ трендов и прогнозы
```

## Компоненты расширения

### 1. Background (Service Worker)

**service-worker.js** - главный координатор:
- Управление жизненным циклом расширения
- Обработка alarms для периодических задач
- Координация между компонентами
- Обработка сообщений от content scripts и popup
- Автоматическое обновление данных
- Управление уведомлениями

**analytics-engine.js** - аналитический движок:
- Расчёт рекомендованных цен
- Различные стратегии ценообразования
- Анализ конкурентов
- Статистические расчёты (медиана, перцентили)
- Прогнозирование оптимального времени продажи

### 2. Content Scripts

**content-script.js** - интеграция с FunPay.com:
- Внедрение плавающей кнопки на сайт
- Извлечение данных со страниц (товары, цены, продавцы)
- Отображение панели анализа
- Взаимодействие с DOM FunPay
- Мониторинг изменений страницы

**content-styles.css** - стили для внедряемых элементов:
- Плавающая кнопка с градиентом
- Анимированная панель анализа
- Адаптивный дизайн
- Без конфликтов с FunPay стилями

### 3. Popup

**Быстрый доступ** к основным функциям:
- Статистика (товары, цены, конкуренты)
- Быстрые действия (анализ, обновление, экспорт)
- Статус расширения
- Навигация в Dashboard и настройки

### 4. Dashboard

**Полноценная панель управления**:
- **Обзор**: Общая статистика, графики, активность
- **Мои товары**: Таблица товаров, массовые операции
- **Конкуренты**: Карточки конкурентов, отслеживание
- **Аналитика**: Графики (Chart.js), тренды, инсайты
- **Автоматизация**: Настройка автоматических действий
- **Настройки**: Конфигурация расширения

### 5. Options

**Страница настроек**:
- Параметры автоматизации
- Стратегии ценообразования
- Управление уведомлениями
- Backend конфигурация
- Импорт/Экспорт данных

### 6. Libraries

**storage.js** - IndexedDB:
- Object stores: competitors, priceHistory, products, analytics, settings
- CRUD операции
- Индексы для быстрого поиска
- Экспорт/импорт всей базы

**api.js** - API клиент:
- Интеграция с backend сервером
- Парсинг страниц FunPay
- Получение рекомендаций
- Обновление цен

**auth.js** - Аутентификация:
- Извлечение cookies FunPay
- Проверка авторизации
- Управление сессией
- Authenticated запросы

**notifications.js** - Уведомления:
- Chrome Notifications API
- Различные типы уведомлений
- Приоритеты и действия
- Управление очередью

**utils.js** - Утилиты:
- Форматирование (цены, даты, время)
- Математика (статистика, проценты)
- Экспорт/импорт (JSON, CSV)
- Валидация данных

## Backend сервер

### Архитектура

**Express.js REST API** с разделением на слои:
- Routes (маршруты) → обработка HTTP запросов
- Services (сервисы) → бизнес-логика
- Middleware → CORS, logging, error handling

### API Endpoints

#### Competitors (`/api/competitors`)
- `POST /scrape` - Парсинг конкурентов по категории
- `POST /track` - Добавить конкурента для отслеживания
- `GET /:id` - Получить данные конкурента

#### Analysis (`/api/analysis`)
- `POST /prices` - Анализ цен и рекомендации
- `POST /trending` - Трендовые товары
- `POST /optimal-time` - Оптимальное время продажи
- `GET /trends` - Рыночные тренды

#### Prices (`/api/prices`)
- `POST /update` - Обновить цену товара
- `POST /bulk-update` - Массовое обновление
- `GET /history/:productId` - История цен

### Services

**scraper.js** - Парсинг FunPay:
- Извлечение данных о товарах
- Информация о продавцах
- Цены и характеристики
- Cheerio для парсинга HTML

**price-analyzer.js** - Анализ цен:
- Статистический анализ
- Расчёт рекомендаций
- Стратегии ценообразования
- Анализ трендов

**trend-analyzer.js** - Анализ трендов:
- Прогнозирование цен
- Определение сезонности
- Расчёт спроса
- Анализ волатильности

## Хранение данных

### IndexedDB Stores

1. **competitors**
   - Данные о конкурентах
   - Индексы: productId, timestamp

2. **priceHistory**
   - История изменения цен
   - Индексы: productId, timestamp

3. **products**
   - Информация о товарах
   - Индексы: category, lastUpdated

4. **analytics**
   - Аналитические данные
   - Индексы: type, date

5. **settings**
   - Настройки расширения
   - Key-value хранилище

### Chrome Storage

Используется для:
- Настройки расширения
- Кеш для быстрого доступа
- Синхронизация между компонентами

## Коммуникация между компонентами

### Message Passing

```javascript
// Content Script → Background
chrome.runtime.sendMessage({
  action: 'getCompetitors',
  category: 'gaming'
});

// Background → Content Script
chrome.tabs.sendMessage(tabId, {
  action: 'highlightProducts',
  productIds: [...]
});
```

### Events и Alarms

```javascript
// Периодические задачи
chrome.alarms.create('updatePrices', { periodInMinutes: 15 });
chrome.alarms.create('checkCompetitors', { periodInMinutes: 30 });
```

## Потоки данных

### 1. Анализ страницы FunPay

```
Пользователь на FunPay.com
    ↓
Content Script извлекает данные
    ↓
Отправка в Background
    ↓
Background → Backend API
    ↓
Backend парсит и анализирует
    ↓
Результаты → Background
    ↓
Background → Content Script
    ↓
Отображение в панели анализа
```

### 2. Автоматическое обновление

```
Alarm триггерится каждые 15 минут
    ↓
Background проверяет настройки
    ↓
Получает список товаров из IndexedDB
    ↓
Запрашивает данные конкурентов (Backend)
    ↓
Рассчитывает рекомендации
    ↓
Отправляет уведомления
    ↓
Опционально: обновляет цены
```

### 3. Работа с Dashboard

```
Пользователь открывает Dashboard
    ↓
Dashboard.js загружает данные из IndexedDB
    ↓
Запрашивает свежие данные (Background API)
    ↓
Рендерит графики (Chart.js)
    ↓
Отображает таблицы и статистику
    ↓
Пользователь выполняет действия
    ↓
Данные обновляются в IndexedDB
    ↓
Синхронизация с Backend
```

## Технологии

### Frontend
- **ES6 Modules** - модульная структура кода
- **IndexedDB** - клиентская база данных
- **Chart.js** - графики и визуализация
- **Chrome Extension API** - основной функционал
- **Fetch API** - HTTP запросы
- **CSS Grid/Flexbox** - современная вёрстка

### Backend
- **Node.js 16+** - серверная платформа
- **Express.js 4** - веб-фреймворк
- **Axios** - HTTP клиент
- **Cheerio** - парсинг HTML
- **CORS** - кроссдоменные запросы

## Безопасность

### Расширение
- Cookies только для FunPay.com
- Локальное хранение данных
- Никакой отправки на внешние серверы
- Manifest V3 (более безопасный)

### Backend
- CORS настроен правильно
- Rate limiting (рекомендуется добавить)
- Валидация входных данных
- Обработка ошибок

## Производительность

### Оптимизации
- Lazy loading для Dashboard
- Debounce для поиска
- Throttle для scroll событий
- IndexedDB индексы
- Кеширование результатов

### Мониторинг
- Console logging для отладки
- Отслеживание ошибок
- Метрики производительности

## Масштабируемость

### Текущая архитектура поддерживает:
- Тысячи товаров в базе
- Десятки конкурентов
- Годы истории цен
- Множество пользователей (Backend)

### Возможные улучшения:
- Добавить кеш-слой (Redis)
- Использовать PostgreSQL для Backend
- WebSocket для real-time обновлений
- Worker threads для тяжёлых операций

## Тестирование

### Рекомендуемые тесты:
- Unit тесты для utils.js
- Integration тесты для API
- E2E тесты для UI
- Performance тесты

### Инструменты:
- Jest - для unit тестов
- Puppeteer - для E2E
- Chrome DevTools - для отладки

## Документация

- **README.md** - общий обзор и Quick Start
- **INSTALLATION.md** - детальная установка
- **USAGE.md** - руководство пользователя
- **PROJECT_STRUCTURE.md** - этот файл

## Лицензия

MIT License - см. LICENSE файл

---

Последнее обновление: 2024-11-09
