# VÖRÖS CSILLAG PROJEKT — AKTA 001

Interaktív, filmszerű „titkos akta” élmény egy ajándékutalványhoz. A nyomtatott utalványon lévő QR-kód erre az oldalra visz.

Tiszta HTML + CSS + vanilla JavaScript. Nincs build, nincs backend, nincs adatbázis, nincs API-kulcs, nincs analitika vagy követés, nincs hang. A betűtípusok helyben vannak (`fonts/`), így az oldal semmilyen külső szerverhez nem fordul.

## Jelenetek

1. **Elfogott adás:** fekete képernyő, villogó piros jelzőfény, gépelt üzenetek, analóg zavar.
2. **Megérkezik az akta:** piros dosszié emelkedik elő a sötétből. Az **AKTA MEGNYITÁSA** gombra (vagy a dossziéra) koppintva lecsavarodik a zsinór, kinyílik a fedőlap, és kiemelkedik a lap.
3. **Feloldás:** a **TITKOSÍTÁS FELOLDÁSA** gombra piros szkennersugár fut végig. Eltűnnek a kitakarások, és rácsapódik a **FELOLDVA** pecsét. A MEGBÍZÓ mező végig kitakarva marad („titok marad.”).
4. **Küldetési eligazítás:** a személyes üzenet, az időpont-egyeztetési telefonszám (koppintásra hív), majd a **BELÉPŐ MEGTEKINTÉSE** gomb.
5. **Belépő:** digitális ajándékbelépő, VCS-001 sorozatszámmal. Ez az ajándék jelképes ábrázolása, nem hivatalos jegy.

Visszatérő látogatónál a nyitóképernyőn megjelenik a **KÖZVETLENÜL AZ AKTÁHOZ →** gomb. A végén az **↺ ÚJRAJÁTSZÁS** újraindítja az élményt.

## Fájlok

```
index.html   – a teljes tartalom (szemantikus HTML, inline SVG grafikák)
style.css    – megjelenés, animációk, mobil elrendezés
script.js    – a jelenetek vezérlése; a tetején a CONFIG blokk
fonts/       – Space Grotesk, IBM Plex Mono, Courier Prime, Caveat (WOFF2 + OFL licencek)
.nojekyll    – a GitHub Pages ne futtasson Jekyllt
```

## Személyre szabás

Nyisd meg a `script.js`-t. A tetején lévő `CONFIG` blokkban minden szöveg átírható:

```js
const CONFIG = {
  recipientName: 'Szakács-Paál Erzsébet',
  museumName: 'Vörös Csillag Múzeum',
  missionName: 'Vörös Csillag',
  city: 'Sepsiszentgyörgy',
  guests: 2,
  missionId: 'VÖRÖS-CSILLAG-001',
  ticketSerial: 'VCS-001',
  fileNumber: '001',
  coordinates: '45°52′ É · 25°47′ K',
  contactPhone: '+40 726 709 755',
  message: [ 'Kedves Erzsébet!', '…', '…', '…' ]
};
```

A nevet, a monogramot (pl. „SZ.-P. E.”), a nagybetűs változatokat és a telefonlinket a script magától állítja elő. Az `index.html`-ben lévő szövegek csak tartalékok arra az esetre, ha a JavaScript nem futna.

## Telepítés GitHub Pages-re

### A) Böngészőből

1. github.com → **New repository** → név: `project-red-star` → **Public** → **Create repository**.
2. **Add file → Upload files**: húzd be a mappa *tartalmát* (`index.html`, `style.css`, `script.js`, `README.md`, `.nojekyll`, `fonts/` mappa) → **Commit changes**.
3. **Settings → Pages** → *Build and deployment* → Source: **Deploy from a branch** → Branch: **main**, mappa: **/ (root)** → **Save**.
4. 1–2 perc múlva él: `https://FELHASZNALONEV.github.io/project-red-star/`

### B) Parancssorból (git + GitHub CLI)

```bash
git init -b main && git add . && git commit -m "Akta 001"
```

```bash
gh repo create project-red-star --public --source . --push
```

```bash
gh api -X POST repos/FELHASZNALONEV/project-red-star/pages -f "source[branch]=main" -f "source[path]=/"
```

Minden útvonal relatív (`style.css`, `fonts/…`), ezért az oldal alkönyvtárból (`/project-red-star/`) is hibátlanul működik.

## Tesztelés

- Helyben: `python -m http.server 8000`, majd http://localhost:8000
- Ha a telefonon vagy a gépen be van kapcsolva a „Mozgás csökkentése” (Reduce Motion), az oldal animációk nélkül, azonnal mutat minden tartalmat. A teljes, animált változat ilyenkor is kipróbálható a `?motion=full` végződéssel: `…/project-red-star/?motion=full`
- Ha a JavaScript nem töltődik be, az oldal 5 másodperc után statikus, olvasható aktára vált.

## Adatvédelem

- `noindex, nofollow`: a keresők nem indexelik.
- Nincs süti, nincs analitika, nincs külső kérés.
- A `localStorage` csak egyetlen jelzőt tárol (`rs001.complete`), hogy visszatéréskor felajánlja a gyors ugrást.
- A megbízó neve sehol nem szerepel a kódban.

## Licencek

A betűtípusok a SIL Open Font License 1.1 alatt állnak; a licencszövegek a `fonts/` mappában vannak.
