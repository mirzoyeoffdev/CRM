# Ingliz Tili Kursi CRM 🎓

O'quvchilarni boshqarish uchun to'liq CRM tizimi. **FastAPI + SQLite** asosida qurilgan.

## Ishga tushirish

```bash
# 1. Paketlarni o'rnatish
pip install -r requirements.txt

# 2. Serverni ishga tushirish
uvicorn main:app --reload
```

## API hujjati

Server ishga tushgach, quyidagi manzillarda API hujjatini ko'ring:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Funksiyalar

| Modul | Endpointlar |
|-------|------------|
| O'quvchilar | Qo'shish, tahrirlash, o'chirish, qidirish |
| Guruhlar | CRUD, guruh o'quvchilari ro'yxati |
| Yozilish | Guruhga qo'shish/chiqarish, sig'im tekshiruvi |
| Davomat | Belgilash, guruh/o'quvchi hisoboti, % ko'rsatkich |
| To'lovlar | Kiritish, qarzdorlar ro'yxati |
| Baholar | Kiritish, o'rtacha ball hisoboti |
| Jadval | Dars kunlari va vaqtlari |
| Hisobotlar | Umumiy statistika, oylik daromad, to'liq o'quvchi hisoboti |

## Loyiha tuzilmasi

```
CRM/
├── main.py          # FastAPI ilovasi
├── database.py      # SQLite/SQLAlchemy sozlamalari
├── requirements.txt
├── models/          # SQLAlchemy ORM modellari
├── schemas/         # Pydantic validatsiya schemalar
└── routers/         # API endpointlar
```