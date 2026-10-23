# Ingliz Tili Kursi CRM 🎓

O'quv markazlari va ingliz tili kurslari uchun to'liq CRM tizimi.

- **Backend**: FastAPI + SQLite / SQLAlchemy
- **Frontend**: React + Vite + TailwindCSS + TanStack Query

---

## 📁 Loyiha tuzilmasi

```
CRM/
├── backend/                  # FastAPI API server
│   ├── models/               # SQLAlchemy modellari
│   ├── routers/              # API yo'nalishlari (endpoints)
│   ├── schemas/              # Pydantic schemalar
│   ├── database.py           # DB ulanish sozlamalari
│   ├── main.py               # Asosiy dastur nuqtasi
│   ├── requirements.txt      # Python kutubxonalari
│   └── README.md
│
├── frontend/                 # React frontend ilovasi
│   ├── src/                  # Komponentlar, sahifalar va hooklar
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── .gitignore
└── README.md
```

---

## 🚀 Ishga tushirish

### 1. Backend

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```
API hujjati:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Brauzerda: [http://localhost:5173](http://localhost:5173)

---

## ✨ Funksiyalar

- **O'quvchilar**: Qo'shish, tahrirlash, o'chirish, qidirish
- **Guruhlar**: CRUD, guruh o'quvchilari ro'yxati
- **Dars jadvali**: Dars kunlari va soatlari
- **Davomat**: Davomatni belgilash, hisobotlar
- **To'lovlar**: To'lovlarni kiritish, qarzdorlar ro'yxati
- **Baholar**: Baholash va o'rtacha ball tahlili
- **Hisobotlar**: Umumiy statistika va oylik daromad hisoboti
