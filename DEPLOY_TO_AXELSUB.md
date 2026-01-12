# 🚀 Személyre Szabott RockHost Deployment - axelsub.hu

## 📋 RockHost Adatok

- **Domain**: `axelsub.hu`
- **Felhasználónév**: `c95837axelsub`
- **Szerver**: `wh06.rackhost.hu`
- **FTP Host**: `wh06.rackhost.hu` vagy `ftp.axelsub.hu`
- **SSH Host**: `wh06.rackhost.hu`

---

## 🔥 GYORS DEPLOYMENT - Lépésről Lépésre

### STEP 1: FileZilla FTP Feltöltés 📤

#### 1.1 FileZilla Telepítése (ha nincs)

Töltsd le: https://filezilla-project.org/download.php?type=client

#### 1.2 FileZilla Csatlakozás

Nyisd meg FileZilla-t és add meg:

```
Host: ftp.axelsub.hu
  (vagy: wh06.rackhost.hu)
Username: c95837axelsub
Password: [A RockHost jelszavad]
Port: 21
```

Kattints **Quickconnect**-re

#### 1.3 Fájlok Feltöltése

**Bal oldal** (Local): Navigálj ide:
```
c:\Users\alexs\Downloads\Anime-Streamer\Anime-Streamer\rockhost-deploy\
```

**Jobb oldal** (Remote): Navigálj ide:
```
/public_html/
```

Vagy ha van külön könyvtár:
```
/public_html/anime-streamer/
```

**Húzd át az ÖSSZES fájlt és mappát** a bal oldalról a jobb oldalra!

⏱️ Ez **5-10 percet** vehet igénybe a feltöltés.

---

### STEP 2: SSH Kapcsolat a Szerverhez 🔐

#### 2.1 PowerShell vagy CMD Megnyitása

Nyomd meg: `Win + R`, írd be: `powershell`, Enter

#### 2.2 SSH Csatlakozás

```bash
ssh c95837axelsub@wh06.rackhost.hu
```

**Írd be a jelszavad** amikor kéri.

#### 2.3 Navigálj a Feltöltött Könyvtárba

```bash
cd ~/public_html/anime-streamer
```

---

### STEP 3: Node.js Dependencies Telepítése 📦

```bash
npm install
```

---

### STEP 4: Environment Változók (.env fájl) 🔐

#### 4.1 Hozz létre .env fájlt

```bash
nano .env
```

#### 4.2 Másold be ezt (CSERÉLD KI az [YOUR-PASSWORD] részt!):

```env
# Node környezet
NODE_ENV=production

# Port
PORT=5000

# PostgreSQL Database URL (Supabase)
DATABASE_URL=postgresql://postgres.fqfuhookqcgpmujmanig:[YOUR-PASSWORD]@aws-1-eu-west-1.pooler.supabase.com:6543/postgres

# Session Secret - Generálj egy hosszú, véletlenszerű stringet
SESSION_SECRET=axel-sub-secret-32-chars-long-random-string

# Domain
ALLOWED_HOSTS=axelsub.hu,www.axelsub.hu
```

#### 4.3 Mentés és Kilépés

- Mentés: `Ctrl+O`, majd Enter
- Kilépés: `Ctrl+X`

---

### STEP 5: Build az Alkalmazást 🏗️

```bash
npm run build
```

---

### STEP 6: Database Migráció 🗄️

```bash
npm run db:push
```

---

### STEP 7: PM2 Telepítése és Indítás ▶️

```bash
npm install -g pm2
pm2 start dist/index.cjs --name anime-streamer-axelsub
pm2 save
```

---

### STEP 8: Tesztelés! 🎉

Nyisd meg böngészőben: `https://axelsub.hu`

---

## ✅ Deployment Checklist

- [ ] Fájlok feltöltve
- [ ] `npm install` lefutott
- [ ] `.env` fájl kész (DATABASE_URL-ben a jelszavad benne van!)
- [ ] `npm run build` sikeres
- [ ] `npm run db:push` sikeres
- [ ] PM2 fut
- [ ] Honlap betöltődik!

**Sok sikert! 🚀✨**
