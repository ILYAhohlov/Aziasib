
# 🚀 Руководство по развертыванию OptBazar

## Структура проекта
```
OptBazar/
├── server/index.js     # Backend API (Express)
├── src/               # Frontend (React + TypeScript)
├── build/             # Собранный фронтенд
└── uploads/           # Загрузки (не включены в архив)
```

## 🔧 Переменные окружения

Создайте файл `.env` со следующими переменными:

```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Supabase
SUPABASE_URL=https://pdlhdxjsjmcgojzlwujl.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key

# Server
PORT=5000
NODE_ENV=production
```

## 🚀 Развертывание на Render.com

### 1. Подготовка GitHub репозитория
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/optbazar.git
git push -u origin main
```

### 2. Настройка на Render
1. Зайдите на [render.com](https://render.com)
2. Подключите GitHub аккаунт
3. Создайте новый **Web Service**
4. Выберите ваш репозиторий
5. Настройки:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/index.js`
   - **Environment**: Node
   - **Instance Type**: Free

### 3. Добавьте переменные окружения
В разделе Environment на Render добавьте все переменные из `.env`

## 🌐 Развертывание на Railway

### 1. Подготовка
```bash
npm install -g @railway/cli
railway login
```

### 2. Деплой
```bash
railway new
railway add
railway up
```

### 3. Настройка переменных
```bash
railway variables set MONGODB_URI="your_connection_string"
railway variables set SUPABASE_URL="your_supabase_url"
# ... остальные переменные
```

## 🔄 Альтернативный вариант - разделение фронт/бэк

### Фронтенд на Vercel
1. Разверните только папку `build/` на Vercel
2. Настройте проксирование API на внешний сервер

### Бэкенд на Railway/Render
1. Создайте отдельный репозиторий только с `server/`
2. Разверните как API сервер

## 📱 Telegram Bot Setup

После развертывания:
1. Обновите webhook URL вашего Telegram бота
2. Настройте Web App URL в BotFather
3. Проверьте CORS настройки для нового домена

## 🔧 Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev & node server/index.js

# Сборка для продакшена
npm run build
```

## 🐛 Устранение неполадок

### Ошибки MongoDB
- Проверьте строку подключения
- Убедитесь что IP разрешен в MongoDB Atlas

### Ошибки Supabase
- Проверьте ключи API
- Настройте CORS для нового домена

### Проблемы с CORS
Добавьте в `server/index.js`:
```javascript
app.use(cors({
  origin: ['https://yourdomain.com', 'https://yourapp.vercel.app'],
  credentials: true
}));
```

## 📞 Поддержка

При возникновении проблем проверьте:
1. Логи сервера
2. Переменные окружения
3. Сетевые настройки
4. Версии Node.js (рекомендуется 18+)
