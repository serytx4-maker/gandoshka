# 🚀 Деплой на Netlify

## Шаг 1: Залей на GitHub (если еще не сделал)

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/твой-username/название-репо.git
git push -u origin main
```

---

## Шаг 2: Деплой на Netlify

1. Открой [netlify.com](https://netlify.com)
2. Нажми **"Sign up"** или **"Log in"** (лучше через GitHub)
3. Нажми **"Add new site"** → **"Import an existing project"**
4. Выбери **"Deploy with GitHub"**
5. Авторизуй Netlify (если попросит)
6. Найди свой репозиторий и нажми на него

---

## Шаг 3: Настрой сборку

На странице настройки:

**Build settings:**
- Build command: `npm run build`
- Publish directory: `.next`

**Environment variables** (нажми "Add environment variables"):

1. **Переменная 1:**
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: `https://твой-проект.supabase.co`

2. **Переменная 2:**
   - Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: `твой_anon_ключ`

Нажми **"Deploy"**

---

## Шаг 4: Подожди 3-5 минут

Netlify соберет проект. Увидишь:
- 🔨 Building...
- ✅ Published!

Получишь URL типа: `https://твой-проект.netlify.app`

---

## Шаг 5: Настрой Supabase

1. Открой Supabase → **Authentication** → **URL Configuration**
2. В **Site URL** добавь: `https://твой-проект.netlify.app`
3. В **Redirect URLs** добавь: `https://твой-проект.netlify.app/**`
4. Сохрани

---

## 🎉 Готово!

Открой свой URL и проверь:
- ✅ Регистрация работает
- ✅ Загрузка треков работает
- ✅ Плеер работает

---

## 📝 Обновление сайта

Когда захочешь обновить:

```bash
git add .
git commit -m "Описание изменений"
git push
```

Netlify автоматически пересоберет сайт!

---

## 🐛 Если что-то не работает

### Ошибка при сборке
- Проверь что переменные окружения добавлены
- Site settings → Environment variables

### Ошибка "Invalid API key"
- Проверь переменные в Netlify
- Убедись что нет лишних пробелов

### Не работает регистрация
- Проверь Site URL в Supabase
- Должен совпадать с Netlify URL

### Страница 404
- Netlify → Site settings → Build & deploy
- Добавь файл `netlify.toml` (см. ниже)

---

## 📄 Файл netlify.toml (если нужен)

Создай файл `netlify.toml` в корне проекта:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

Потом:
```bash
git add netlify.toml
git commit -m "Add netlify config"
git push
```

---

## 💡 Переименовать сайт

1. Netlify → Site settings → General
2. Site details → Change site name
3. Введи новое имя → Save

URL изменится на `https://новое-имя.netlify.app`

Не забудь обновить URL в Supabase!

---

Всё! Теперь твой музыкальный стриминг онлайн 🎵
