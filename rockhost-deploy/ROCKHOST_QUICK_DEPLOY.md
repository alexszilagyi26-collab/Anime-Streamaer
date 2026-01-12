# 🚀 RockHost Feltöltési Útmutató - Gyors Deploy

Mivel Node.js nincs telepítve a helyi gépen, a buildet közvetlenül a RockHost szerveren fogjuk elkészíteni.

## 📋 Amit Szükség Van

- ✅ RockHost fiók SSH vagy FTP hozzáféréssel
- ✅ Supabase DATABASE_URL (vagy RockHost PostgreSQL)
- ✅ RockHost szerver domain név

## 🔥 Option 1: SSH Deploy (Ajánlott)

### 1. Csatlakozz SSH-val

Nyiss egy PowerShell vagy CMD terminált és kapcsolódj:

```bash
ssh felhasználónév@rockhost-szerver.hu
```

### 2. Készítsd elő a könyvtárat

```bash
mkdir -p ~/anime-streamer
cd ~/anime-streamer
```

### 3A. Git Clone (Ha van Git repository)

Ha a projekted GitHub-on vagy GitLab-on van:

```bash
git clone https://github.com/your-username/Anime-Streamer.git .
```

### 3B. Kézi Feltöltés (Ha nincs Git)

**Helyi gépről** (új PowerShell ablak):

```powershell
# SCP-vel töltsd fel az összes fájlt (kivéve node_modules)
scp -r "c:\Users\alexs\Downloads\Anime-Streamer\Anime-Streamer\*" felhasználónév@rockhost-szerver.hu:~/anime-streamer/
```

**VAGY használj WinSCP-t vagy FileZilla-t** az FTP feltöltéshez.

### 4. Environment Változók Beállítása (Szerveren)

```bash
cd ~/anime-streamer

# Hozz létre .env fájlt
nano .env
```

Másold be (cseréld ki a valódi értékekkel):

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
SESSION_SECRET=$(openssl rand -base64 32)
```

Mentés: `Ctrl+O`, Enter, `Ctrl+X`

### 5. Dependencies Telepítése

```bash
npm install
```

### 6. Build Készítése

```bash
npm run build
```

### 7. Database Migráció

```bash
npm run db:push
```

### 8. PM2 Telepítése és Indítás

```bash
# PM2 telepítése globálisan
npm install -g pm2

# Alkalmazás indítása
pm2 start dist/index.cjs --name anime-streamer

# Auto-start beállítása
pm2 startup
pm2 save

# Ellenőrzés
pm2 status
pm2 logs anime-streamer
```

### 9. Nginx/Apache Beállítás

**Ha Nginx van:**

```bash
sudo nano /etc/nginx/sites-available/anime-streamer
```

Másold be a `nginx.conf.example` tartalmát, majd:

```bash
sudo ln -s /etc/nginx/sites-available/anime-streamer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Ha Apache van:**

A `.htaccess` fájl már a projekt gyökerében van, csak add meg a domain-hez.

### 10. Kész! 🎉

Nyisd meg böngészőben: `http://your-domain.com`

---

## 🔥 Option 2: FTP Upload + RockHost cPanel

### 1. Töltsd fel a fájlokat FTP-vel

**FileZilla használatával:**

1. Host: `ftp.rockhost-szerver.hu`
2. Felhasználónév: `your_username`
3. Jelszó: `your_password`
4. Port: `21`

Töltsd fel az alábbi mappákat/fájlokat:
- ✅ `client/`
- ✅ `server/`
- ✅ `shared/`
- ✅ `script/`
- ✅ `package.json`
- ✅ `package-lock.json`
- ✅ `tsconfig.json`
- ✅ `vite.config.ts`
- ✅ `tailwind.config.ts`
- ✅ `drizzle.config.ts`
- ✅ `postcss.config.js`
- ✅ `components.json`
- ✅ `.htaccess`
- ✅ `.env.example`
- ❌ **NE töltsd fel:** `node_modules/`, `.git/`, `dist/`, `.env`

### 2. RockHost cPanel-ben

1. Lépj be a RockHost cPanel-be
2. Menj a **Terminal** vagy **SSH Access** részhez
3. Navigálj a könyvtárba ahol feltöltötted:

```bash
cd ~/public_html/anime-streamer
# vagy
cd ~/anime-streamer
```

### 3. Kövesd a 4-10. lépéseket az Option 1-ből

---

## 🌐 RockHost Specifikus Beállítások

### Domain Beállítás

1. RockHost cPanel → **Domains**
2. Add meg a domain-t vagy subdomain-t
3. Állítsd be a document root-ot
4. Ha Nginx van, állíts be reverse proxy-t a 5000-es portra

### SSL Tanúsítvány

1. RockHost cPanel → **SSL/TLS**
2. Let's Encrypt ingyenes tanúsítvány
3. Vagy használd a RockHost Auto SSL funkciót

---

## 🆘 Troubleshooting

### Port foglalt

```bash
# Ellenőrizd mi használja a portot
netstat -tuln | grep 5000

# Változtasd meg a portot a .env-ben
nano .env
# PORT=5001
```

### Build hiba

```bash
# Próbáld újra tiszta node_modules-kal
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database connection hiba

```bash
# Teszteld a connection string-et
psql "$DATABASE_URL"
```

---

## 📞 További Segítség

Ha elakadtál:

1. Ellenőrizd a PM2 logokat: `pm2 logs anime-streamer`
2. Nézd a teljes deployment guide-ot: `DEPLOYMENT_GUIDE.md`
3. Futtasd a deployment check scripteket

---

**Sok sikert a deployment-hez! 🚀**
