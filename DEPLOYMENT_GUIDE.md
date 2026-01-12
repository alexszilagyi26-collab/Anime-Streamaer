# 🚀 RockHost Deployment Útmutató - Anime Streaming Weboldal

Ez az útmutató lépésről lépésre végigvezet az anime streaming weboldal RockHost-ra való feltöltésén.

## 📋 Előfeltételek

Mielőtt elkezdenéd, győződj meg róla, hogy az alábbiakkal rendelkezel:

- ✅ RockHost fiók aktív hosting csomaggal
- ✅ Node.js 20+ támogatás a hosting szerveren
- ✅ PostgreSQL adatbázis hozzáférés (vagy Supabase fiók)
- ✅ SSH/FTP hozzáférés a szerverhez
- ✅ Git telepítve (opcionális, de ajánlott)

## 🗄️ 1. Lépés: Adatbázis Beállítása

### Supabase Használata (Ajánlott)

Ha Supabase-t használsz az adatbázishoz:

1. Menj a [Supabase Dashboard](https://app.supabase.com)-ra
2. Válaszd ki a projektedet
3. Menj a **Settings** → **Database** menüpontba
4. Másold ki a **Connection String** értékét (URI formátum)
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. Tartsd biztonságos helyen, nemsokára szükség lesz rá!

### RockHost PostgreSQL (Alternatíva)

Ha RockHost saját PostgreSQL szolgáltatását használod:

1. Jelentkezz be a RockHost control panelbe
2. Hozz létre egy új PostgreSQL adatbázist
3. Jegyezd fel az adatbázis adatokat:
   - Hoszt
   - Port
   - Adatbázis név
   - Felhasználónév
   - Jelszó

## 📦 2. Lépés: ProjektLocal Build

Először készítsd el a production buildet a helyi gépen:

```powershell
# Navigálj a projekt könyvtárába
cd c:\Users\alexs\Downloads\Anime-Streamer\Anime-Streamer

# Telepítsd a függőségeket (ha még nem tetted)
npm install

# Készítsd el a production buildet
npm run build
```

Sikeres build után egy `dist` mappa fog létrejönni a következő fájlokkal:
- `dist/index.cjs` - A bundled backend szerver
- `dist/client/` - A frontend static fájlok

## 🌐 3. Lépés: Fájlok Feltöltése RockHost-ra

### SSH-val (Ajánlott)

```bash
# Kapcsolódj SSH-val a szerverhez
ssh felhasznalonev@rockhost-szerver.com

# Hozz létre egy könyvtárat az alkalmazásnak
mkdir -p ~/anime-streamer
cd ~/anime-streamer

# Töltsd le a projektfájlokat (módszer 1: Git)
git clone <repository-url> .

# vagy töltsd fel SCP-vel (módszer 2)
# A helyi gépedről futtasd:
# scp -r c:\Users\alexs\Downloads\Anime-Streamer\Anime-Streamer/* felhasznalonev@rockhost-szerver.com:~/anime-streamer/
```

### FTP-vel

1. Használj egy FTP klienst (pl. FileZilla)
2. Kapcsolódj a RockHost FTP szerverhez
3. Töltsd fel az **összes** projektfájlt a szerverre
4. Győződj meg róla, hogy a következők feltöltésre kerültek:
   - `package.json`
   - `dist/` mappa (ha már buildelted locally)
   - `node_modules/` **VAGY** futtasd `npm install`-t a szerveren
   - `shared/` mappa
   - `server/` mappa (ha nem buildelted locally)

## 🔐 4. Lépés: Környezeti Változók Beállítása

Hozz létre egy `.env` fájlt a szerver projekt gyökerében:

```bash
# SSH-n keresztül
cd ~/anime-streamer
nano .env
```

Másold be a következőket (és töltsd ki a saját értékeiddel):

```env
# Node környezet
NODE_ENV=production

# Port (RockHost általában megadja)
PORT=5000

# PostgreSQL Connection String
# Supabase példa:
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres

# vagy RockHost PostgreSQL:
# DATABASE_URL=postgresql://db_user:db_password@localhost:5432/anime_streamer_db

# Session Secret (generálj egy véletlenszerű stringet)
SESSION_SECRET=valami-nagyon-biztonsagos-es-veletlensz3ru-string-123456
```

**Mentsd el** a fájlt (Ctrl+O, Enter, Ctrl+X nano-ban).

## 🏗️ 5. Lépés: Build és Telepítés a Szerveren

Ha még nem buildelted locally, vagy a szerveren szeretnéd buildolni:

```bash
# SSH-n keresztül
cd ~/anime-streamer

# Telepítsd a függőségeket
npm install --production=false

# Készíts buildet
npm run build

# Telepítsd csak a production függőségeket
npm prune --production
```

## 🔄 6. Lépés: Adatbázis Migráció

Futtasd a Drizzle migrációkat az adatbázis sémák létrehozásához:

```bash
# SSH-n keresztül
cd ~/anime-streamer

# Push-old a sémát az adatbázisba
npm run db:push
```

Ez létrehozza az összes szükséges táblát és kapcsolatot az adatbázisban.

## ▶️ 7. Lépés: Alkalmazás Indítása

### Kézi Indítás (Teszteléshez)

```bash
# SSH-n keresztül
cd ~/anime-streamer
npm run start
```

Az alkalmazás most fut a `PORT` környezeti változóban megadott porton (alapértelmezetten 5000).

### PM2-vel (Ajánlott Production-höz)

PM2 egy process manager, amely újraindítja az alkalmazást crash esetén:

```bash
# Telepítsd PM2-t globálisan (ha még nincs)
npm install -g pm2

# Indítsd az alkalmazást PM2-vel
pm2 start dist/index.cjs --name "anime-streamer"

# Állítsd be az auto-start-ot reboot után
pm2 startup
pm2 save

# Ellenőrizd a státuszt
pm2 status

# Nézd a logokat
pm2 logs anime-streamer
```

### Systemd Service (Alternatíva)

Ha nincs PM2, használhatsz systemd service-t is. Hozz létre egy `/etc/systemd/system/anime-streamer.service` fájlt:

```ini
[Unit]
Description=Anime Streamer Website
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/home/your-username/anime-streamer
Environment="NODE_ENV=production"
Environment="PORT=5000"
EnvironmentFile=/home/your-username/anime-streamer/.env
ExecStart=/usr/bin/node /home/your-username/anime-streamer/dist/index.cjs
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Majd:

```bash
sudo systemctl daemon-reload
sudo systemctl enable anime-streamer
sudo systemctl start anime-streamer
sudo systemctl status anime-streamer
```

## 🌍 8. Lépés: Webszerver Konfiguráció (Nginx/Apache)

### Nginx Reverse Proxy

Ha RockHost Nginx-et használ, add hozzá ezt a konfigurációt:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Apache Reverse Proxy (.htaccess)

Ha RockHost Apache-ot használ, egy `.htaccess` fájl került létrehozásra a projekt gyökerében.

Győződj meg róla, hogy az Apache `mod_proxy` és `mod_proxy_http` modulok engedélyezve vannak:

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

## ✅ 9. Lépés: Ellenőrzés és Tesztelés

### Alapvető Ellenőrzés

1. **Szerver Fut-e?**
   ```bash
   pm2 status
   # vagy
   sudo systemctl status anime-streamer
   ```

2. **Port Listening?**
   ```bash
   netstat -tuln | grep 5000
   # vagy
   ss -tuln | grep 5000
   ```

3. **Böngészőben Tesztelés**
   - Nyisd meg: `http://your-domain.com`
   - Ellenőrizd, hogy betöltődik-e az oldal
   - Próbálj bejelentkezni/regisztrálni
   - Nézz végig néhány anime-t

### Hibakeresés

**1. Nem tölt be az oldal:**
```bash
# Nézd meg a logokat
pm2 logs anime-streamer
# vagy
sudo journalctl -u anime-streamer -f
```

**2. Adatbázis kapcsolódási hiba:**
- Ellenőrizd a `DATABASE_URL`-t a `.env` fájlban
- Teszteld a kapcsolatot:
  ```bash
  psql "postgres://user:password@host:port/database"
  ```

**3. Port conflict:**
- Ellenőrizd, hogy nem használja-e más alkalmazás a portot
- Változtasd meg a `PORT` értékét a `.env`-ben

## 🔒 10. Lépés: Biztonsági Beállítások (Opcionális de Ajánlott)

### SSL/TLS (HTTPS)

Let's Encrypt ingyenes SSL tanúsítvány:

```bash
# Certbot telepítése
sudo apt-get install certbot python3-certbot-nginx

# SSL tanúsítvány beszerzése
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Firewall

```bash
# UFW firewall beállítása
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

## 📊 Hasznos PM2 Parancsok

```bash
# Alkalmazás újraindítása
pm2 restart anime-streamer

# Alkalmazás leállítása
pm2 stop anime-streamer

# Alkalmazás törlése a PM2-ből
pm2 delete anime-streamer

# Logok megtekintése
pm2 logs anime-streamer

# Monitorozás
pm2 monit

# Összes PM2 app listája
pm2 list
```

## 🎉 Kész!

Az anime streaming weboldalad most már él a RockHost-on! 

### Következő Lépések

- 🎨 Testre szabhatod a design-t
- 📱 Mobilra optimalizálhatod
- 📊 Analytics hozzáadása (pl. Google Analytics)
- 🔔 Push értesítések implementálása
- 💾 Backup stratégia kialakítása

## ❓ Gyakori Problémák és Megoldások

| Probléma | Megoldás |
|----------|----------|
| "Cannot find module" hiba | Futtasd újra: `npm install --production=false` |
| Port már használatban | Változtasd meg a `PORT` értékét |
| Adatbázis connection timeout | Ellenőrizd a firewall és a DATABASE_URL-t |
| 502 Bad Gateway | Az alkalmazás nem fut, indítsd újra PM2-vel |
| Static fájlok nem töltődnek be | Ellenőrizd a `dist/client/` mappát |

## 📞 Kapcsolat és Segítség

Ha elakadtál, ellenőrizd:
- RockHost support dokumentáció
- Projekt GitHub repository (ha van)
- Supabase dokumentáció: https://supabase.com/docs

---

**Sok sikert a deployment-hez! 🚀✨**
