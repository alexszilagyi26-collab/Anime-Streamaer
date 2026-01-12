# 🎬 Anime Streamer

Modern, gyors és reszponzív anime streaming platform built with React, TypeScript, Express, és PostgreSQL.

## ✨ Funkciók

- 🎯 Modern, felhasználóbarát interfész
- 🔐 Biztonságos felhasználói authentikáció
- 📺 Anime böngészés és streaming
- 💾 PostgreSQL adatbázis Drizzle ORM-mel
- 🎨 TailwindCSS styling
- ⚡ Vite build tool gyors fejlesztéshez
- 📱 Teljesen reszponzív design

## 🚀 Gyors Kezdés

### Előfeltételek

- Node.js 20 vagy újabb
- PostgreSQL adatbázis (vagy Supabase fiók)
- npm vagy yarn package manager

### Telepítés

1. **Klónozd a repository-t**
   ```bash
   git clone <repository-url>
   cd Anime-Streamer
   ```

2. **Telepítsd a függőségeket**
   ```bash
   npm install
   ```

3. **Környezeti változók beállítása**
   
   Másold a `.env.example` fájlt `.env` néven:
   ```bash
   copy .env.example .env
   ```
   
   Töltsd ki a `.env` fájlban a szükséges értékeket:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   SESSION_SECRET=your-secure-random-string
   NODE_ENV=development
   PORT=5000
   ```

4. **Adatbázis migráció**
   ```bash
   npm run db:push
   ```

5. **Indítsd el a development szervert**
   ```bash
   npm run dev
   ```

6. **Nyisd meg böngészőben**
   
   Navigálj a `http://localhost:5000` címre

## 📦 Build és Production

### Production Build Készítése

```bash
npm run build
```

Ez létrehozza a `dist/` mappát az alábbi tartalmakkal:
- `dist/index.cjs` - Bundled backend szerver
- `dist/client/` - Frontend static fájlok

### Production Szerver Indítása

```bash
npm run start
```

### Deployment Ellenőrzés

Mielőtt deployolnál, futtasd a deployment check scriptet:

**Windows:**
```bash
.\deployment-check.bat
```

**Linux/Mac:**
```bash
chmod +x deployment-check.sh
./deployment-check.sh
```

## 🌐 Deployment

Részletes deployment útmutatóért lásd: **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

### Gyors Deployment Áttekintés

1. **Build készítése**
   ```bash
   npm run build
   ```

2. **Fájlok feltöltése** a hosting szerverre (SSH/FTP)

3. **Environment változók beállítása** a szerveren (`.env` fájl)

4. **Dependencies telepítése** a szerveren
   ```bash
   npm install --production
   ```

5. **Adatbázis migráció**
   ```bash
   npm run db:push
   ```

6. **Alkalmazás indítása** PM2-vel vagy systemd-vel
   ```bash
   pm2 start dist/index.cjs --name anime-streamer
   ```

### Támogatott Hosting Platformok

- ✅ RockHost
- ✅ VPS (DigitalOcean, Linode, stb.)
- ✅ Cloud Platforms (AWS, Google Cloud, Azure)
- ✅ Replit (development/demo)

## 🗄️ Adatbázis

A projekt PostgreSQL-t használ Drizzle ORM-mel. Támogatott adatbázis szolgáltatások:

- Supabase (ajánlott)
- Neon Database
- Railway
- Helyi PostgreSQL
- RockHost PostgreSQL

### Database Parancsok

```bash
# Push schema az adatbázisba
npm run db:push

# TypeScript típus ellenőrzés
npm run check
```

## 🛠️ Fejlesztés

### Elérhető Scriptek

```bash
npm run dev        # Development szerver indítása
npm run build      # Production build készítése
npm run start      # Production szerver indítása
npm run check      # TypeScript típusok ellenőrzése
npm run db:push    # Database schema push
```

### Projekt Struktúra

```
Anime-Streamer/
├── client/              # Frontend React alkalmazás
│   ├── public/          # Static assets
│   ├── src/             # React komponensek és logika
│   └── index.html       # HTML entry point
├── server/              # Backend Express szerver
│   ├── index.ts         # Szerver belépési pont
│   ├── routes.ts        # API routes
│   ├── db.ts            # Database kapcsolat
│   └── ...
├── shared/              # Közös típusok és schema
│   ├── schema.ts        # Drizzle database schema
│   └── routes.ts        # Route típusok
├── dist/                # Build output (git ignored)
├── .env                 # Environment változók (git ignored)
├── .env.example         # Environment változók példa
├── package.json         # Dependencies és scripts
└── DEPLOYMENT_GUIDE.md  # Deployment útmutató
```

## 🔐 Biztonság

- Soha ne commitolj `.env` fájlt!
- Használj erős `SESSION_SECRET` értéket
- Production-ben használj HTTPS-t
- Rendszeresen frissítsd a függőségeket
- Állíts be rate limiting-et az API-hoz

## 📚 Dokumentáció

- [Deployment Guide](DEPLOYMENT_GUIDE.md) - Részletes deployment útmutató
- [.env.example](.env.example) - Environment változók referencia

## 🧪 Tesztelés

### Helyi Production Build Tesztelése

```bash
# Build készítése
npm run build

# Production mód indítása
npm run start

# Böngészőben nyisd meg
# http://localhost:5000
```

## 🤝 Közreműködés

1. Fork-old a projektet
2. Hozz létre egy feature branch-et (`git checkout -b feature/AmazingFeature`)
3. Commit-old a változtatásokat (`git commit -m 'Add some AmazingFeature'`)
4. Push-old a branch-re (`git push origin feature/AmazingFeature`)
5. Nyiss egy Pull Request-et

## 📄 Licenc

MIT License - lásd a LICENSE fájlt a részletekért

## 💬 Támogatás

Ha problémád van vagy kérdésed, nyiss egy issue-t a GitHub repository-ban.

## 🎉 Köszönetnyilvánítás

- React Team
- Express.js
- Drizzle ORM
- TailwindCSS
- Vite

---

**Készítve ❤️-tel anime rajongóknak**
