================================================================================
  FORJA — Platformă de Fitness & Wellness
================================================================================


0. SUMAR EXECUTIV
--------------------------------------------------------------------------------
FORJA este un prototip de platformă SaaS de fitness și wellness, construit
ca Design Validation Prototype — o implementare completă a experienței
utilizatorului înainte de a investi în infrastructura de producție.

Proiectul demonstrează un produs pentru 4 tipuri de utilizatori (Atlet,
Coach, Nutriționist, Admin), cu ~30 de fluxuri funcționale complete,
toate alimentate de un strat de date simulate conform specificației
API-ului, astfel încât întreaga experiență să poată fi evaluată în lipsa
unui backend. Această abordare este deliberată (a se vedea secțiunea 2)
și corespunde exact fazei pe care o parcurge tema de laborator:
validarea template-urilor statice înainte de implementarea serverului.


8. INSTRUCȚIUNI DE RULARE
--------------------------------------------------------------------------------

Cu Node.js 
────────────────────────────────────
  1. npm install
  2. npm run dev
  3. Deschide http://localhost:5173

Nu este necesar un fișier .env. Aplicația detectează automat absența
unui backend și comută pe mock layer.


10. NAVIGARE ÎN SITE
--------------------------------------------------------------------------------

LANDING PAGE (pagina de start):
  Deschide public/landing.html sau accesează http://localhost:5173/landing.html
  De aici poți naviga prin:
    - Meniul din nav (Ecosistem, Planuri, Echipe, Mobile App, FAQ, Contact)
    - Pe mobil: hamburger menu în stânga
    - Butoanele "Alege planul tău" și "Cum funcționează" din hero
    - Secțiunea "Demo Roluri" — click pe orice card te duce direct în aplicație
    - Footer: Despre noi, Recenzii, Termeni, Confidențialitate (modale)

AUTENTIFICARE:
  Accesează /login sau click pe "Autentificare" din nav.
  3 moduri de intrare:
    - Login clasic (email + parolă)
    - Register (wizard în 3 pași: rol → plan → date profil)
    - Try Demo (click pe unul din cele 4 carduri de rol — intri instant)


NAVIGARE ÎN APLICAȚIE (după login):
  Sidebar-ul din stânga conține toate paginile disponibile per rol.

  ATLET (/app):
    Overview → Workout → Nutriție → Somn → Feed → Echipe →
    Provocări → Chat → Planurile mele → Achievements → Discover →
    Mesaje directe → Profil

  COACH (/coach):
    Overview → Sportivi → Antrenamente → Mesaje → Chat →
    Echipe → Discover → Profil public

  NUTRIȚIONIST (/nutritionist):
    Overview → Clienți → Template-uri → Chat →
    Echipe → Discover → Profil public

  ADMIN (/admin):
    Overview → Utilizatori → Inbox → Mesaje directe →
    Moderare → Setări → Securitate

  CONTACT (/contact):
    Accesibil din nav-ul landing-ului și din orice pagină.
    Conține formular, hartă, date de contact și social media.

  GALERIE:
    Secțiunea "FORJA ÎN ACȚIUNE" din landing — se derulează
    automat la 3 secunde cu dots, progress bar și pause-on-hover.


11. ORIGINALITATE — DE CE FORJA NU EXISTĂ ÎNCĂ PE PIAȚĂ
--------------------------------------------------------------------------------

Am căutat înainte să încep și nu am găsit o platformă care să facă
ce face FORJA. Există aplicații bune, dar fiecare rezolvă doar o
bucată din problemă:

  - MyFitnessPal / FatSecret — tracking individual de calorii și mese,
    dar fără coach, fără echipe, fără planuri primite de la un specialist.
  - Trainerize / TrueCoach — instrumente pentru coachi, dar atletul
    nu are un dashboard propriu complet, iar nutriționistul lipsește.
  - Eat This Much / Mealime — generatoare de planuri alimentare,
    dar fără legătură cu antrenamentul sau cu un nutriționist real.
  - Strava / Fitbit — tracking de activitate, dar fără componenta
    de coaching, nutriție sau echipă coordonată.

Niciuna nu le pune pe toate într-un singur ecosistem unde atletul,
coach-ul și nutriționistul văd aceleași date, comunică în timp real
și lucrează pe aceleași obiective. În practică, un sportiv serios
jonglează 3-4 aplicații separate + un grup de WhatsApp cu coach-ul.
FORJA pleacă de la premisa că asta e ineficient și propune un singur
login, un singur dashboard, o singură sursă de adevăr.

Pe lângă ideea de produs, contribuțiile tehnice personale includ:
  - Sistem de design construit de la zero (fără Bootstrap/Tailwind),
    cu paletă de culori contextuală per rol
  - Landing page scris integral în HTML/CSS/JS nativ, cu particle
    network pe canvas și galerie cu auto-scroll custom
  - Mock layer de 960 de linii care simulează un backend complet,
    folosind pattern-ul API-first development
  - Dark mode funcțional pe toate cele 30+ pagini
  - Arhitectură feature-sliced, nu organizare pe tip de fișier


2. DE CE UN "MOCK BACKEND" ÎN LOC DE BACKEND REAL
--------------------------------------------------------------------------------

Răspunsul are doua straturi:



A) REPLICAREA PATTERN-ULUI "API-FIRST DEVELOPMENT"
   În dezvoltarea modernă de produs, echipele definesc contractul API-ului
   (endpoints, payload-uri, erori posibile) ÎNAINTE de a scrie serverul.
   Frontend-ul este apoi construit contra unui "mock server" care
   respectă contractul, iar backend-ul real este implementat în paralel.
   Această metodologie se numește API-first development și este
   folosită de Stripe, Shopify, Linear și majoritatea platformelor SaaS
   moderne.

   FORJA implementează exact acest pattern: fișierul mockData.js (960
   linii) definește contractul complet al API-ului — ~30 de endpoint-uri
   grupate pe domenii funcționale (auth, user, coach, nutritionist,
   admin, messages, feed, public). Migrarea la un backend real ar
   însemna doar înlocuirea acestui fișier cu apeluri HTTP reale, fără
   modificări în paginile UI.

B) VALIDAREA EXPERIENȚEI UTILIZATORULUI ÎN FAZA DE PROTOTIP
   Scopul acestui tip de livrabil este să răspundă la întrebarea:
   "merită să investim în backend-ul real?" — nu să fie backend-ul
   real. Un investitor, un manager de produs sau un evaluator academic
   poate parcurge integral toate cele 4 fluxuri (Atlet, Coach,
   Nutriționist, Admin) în mai puțin de 10 minute, fără a instala nimic
   în afara unui browser modern. Un backend real ar adăuga ore de setup
   pentru zero informație suplimentară despre calitatea design-ului.

MECANISMUL TEHNIC AL MOCK LAYER-ULUI:
Clientul HTTP (Axios) este configurat cu un interceptor care detectează
absența unei variabile VITE_API_URL în mediu și redirectează automat
request-urile către funcția mockRoute() din mockData.js. Din perspectiva
componentelor UI, request-urile se comportă identic cu cele reale:
promise-uri cu status 200, payload-uri structurate, erori simulabile.
Nu există cod "dacă e demo, fă X; dacă e real, fă Y" împrăștiat prin
pagini — separarea este completă, la nivelul clientului HTTP.



3. DE CE ARHITECTURĂ HYBRID: HTML STATIC + REACT SPA
--------------------------------------------------------------------------------
FORJA conține două straturi distincte:

  - Landing page (public/landing.html, public/landing.css): HTML5,
    CSS3 și JavaScript nativ, 100% static.
  - Aplicația propriu-zisă (src/): React 19 + Vite, Single Page
    Application.

Această separare nu este un compromis, ci un pattern arhitectural numit
în industrie "Islands Architecture" sau "Multi-page + SPA hybrid".

JUSTIFICAREA TEHNICĂ:
  - Landing page-ul trebuie să se încarce INSTANT pentru vizitatori
    anonimi (potențiali clienți). Un bundle React de 1.2 MB ar adăuga
    ~800 ms de hidrare pe conexiuni medii — inacceptabil pentru o
    pagină de marketing care are o singură șansă să capteze atenția.
  - SEO-ul funcționează corect doar pe HTML static. Majoritatea
    crawler-elor (Googlebot face excepție parțială, dar Bing, DuckDuckGo,
    LinkedIn, WhatsApp, Twitter preview-uri) nu execută JavaScript.
  - Aplicația, în schimb, are nevoie de interactivitate complexă
    (routing client-side, state management, animații, formulare cu
    validare), ceea ce justifică costul bundle-ului React — dar doar
    DUPĂ ce utilizatorul s-a logat și este angajat cu produsul.

REFERINȚE ÎN INDUSTRIE:
  - Vercel.com — landing static, dashboard React SPA
  - Stripe.com — landing static, dashboard aplicație separată
  - Linear.app — landing static, aplicație SPA
  - Notion.so — landing static, editor SPA




4. ARHITECTURĂ DETALIATĂ
--------------------------------------------------------------------------------

4.1. TEHNOLOGII
  Frontend (landing):  HTML5, CSS3 (custom properties, grid, flexbox,
                       animations, media queries, clamp, backdrop-filter),
                       JavaScript ES6+ nativ (fără dependențe externe).
  Frontend (app SPA):  React 19 (hooks, context, lazy loading, error
                       boundaries), React Router v6 (client-side routing
                       cu ProtectedRoute per rol), Vite 5 (build tool,
                       HMR, code splitting).
  Client HTTP:         Axios cu interceptoare pentru autentificare JWT
                       și redirect automat către mock layer.
  Animații & UI:       Framer Motion (tranziții pagini, wizards),
                       Recharts (grafice în admin), Lucide React (iconuri).
  Chat în timp real:   Socket.io-client (pregătit pentru backend real,
                       simulat complet în modul mock).
  Styling:             Sistem propriu de design bazat pe CSS custom
                       properties (:root), fără framework UI extern
                       (fără Bootstrap, Tailwind, Material UI etc.).

4.2. STRUCTURA FOLDERELOR
  FORJA/
  +-- public/                      Conținut static servit ca-atare
  |   +-- landing.html             Homepage (HTML nativ)
  |   +-- landing.css              Stiluri landing (~2200 linii)
  |   +-- mobile.html              Pagină promoțională Mobile App
  |   +-- mobile.css
  |   +-- img/                     Imagini, badge-uri SVG, assets
  |
  +-- src/                         Aplicația React
  |   +-- app/
  |   |   +-- AppRouter.jsx        Rutare cu protecție pe roluri
  |   |
  |   +-- features/                Organizare pe domenii funcționale
  |   |   +-- auth/                Login, Register Wizard, Edit Profile
  |   |   +-- user/                Dashboard Atlet (10 pagini)
  |   |   +-- coach/               Dashboard Coach (5 pagini)
  |   |   +-- nutritionist/        Dashboard Nutriționist (3 pagini)
  |   |   +-- admin/               Panou administrare (6 pagini)
  |   |   +-- shared/              Contact, Discover, DM, Pro Profile
  |   |   +-- marketing/           Landing redirect
  |   |
  |   +-- shared/                  Cod partajat între feature-uri
  |       +-- api/                 Client HTTP, endpoints, mock data
  |       |   +-- client.js        Configurație Axios + interceptori
  |       |   +-- endpoints.js     Constante pentru toate rutele
  |       |   +-- mockData.js      Strat de date simulate (960 linii)
  |       |   +-- auth.api.js      Request-uri autentificare
  |       |   +-- coach.api.js
  |       |   +-- nutritionist.api.js
  |       |   +-- admin.api.js
  |       |   +-- athlete.api.js
  |       |   +-- messages.api.js
  |       |   +-- feed.api.js
  |       |   +-- public.api.js
  |       +-- ui/                  Componente reutilizabile
  |       |   +-- Sidebar.jsx      Navigație unificată per rol
  |       |   +-- Modal.jsx
  |       |   +-- Drawer.jsx
  |       |   +-- ConfirmModal.jsx
  |       |   +-- ErrorBoundary.jsx
  |       |   +-- SplashScreen.jsx
  |       |   +-- ProtectedRoute.jsx
  |       |   +-- ThemeToggle.jsx   Dark mode provider
  |       |   +-- animations/      AnimatedPage, ScrollReveal, CountUp,
  |       |                        AnimatedRing, Sparkline, ConfettiBurst
  |       +-- config/
  |       |   +-- roleHome.js      Redirect per rol după login
  |       +-- styles/              CSS global
  |           +-- index.css
  |           +-- darkmode.css
  |           +-- sidebar.css
  |           +-- animations.css
  |           +-- mobile.css
  |           +-- modal.css
  |
  +-- index.html                   Shell-ul SPA (rădăcină React)
  +-- package.json
  +-- vite.config.js
  +-- vercel.json                  Config deployment (fallback SPA)
  +-- .env.example
  +-- readme.txt                   Acest document


4.3. DECIZII DE DESIGN SOFTWARE

ORGANIZARE PE FEATURES, NU PE TIPURI DE FIȘIERE:
  Structura features/ grupează codul după domeniu funcțional (coach/,
  nutritionist/ etc.) în loc să-l organizeze după tip (pages/,
  components/, services/). Această alegere este cunoscută în industrie
  drept "feature-sliced architecture" și este preferată în aplicații
  SaaS medii-mari pentru că menține cuplajul strâns între componentele
  care lucrează împreună și permite ștergerea unui întreg feature
  prin ștergerea unui singur folder.

SISTEM DE DESIGN CUSTOM, FĂRĂ BOOTSTRAP/TAILWIND:
  Toate culorile, spacing-urile, tipografia sunt definite în :root ca
  variabile CSS. Paleta este contextuală pe rol:
      Atlet        -> lime   (#B8ED00)   "performanță personală"
      Coach        -> blue   (#1A52FF)   "conducere"
      Nutriționist -> purple (#7B2FBE)   "expertiză"
      Admin        -> coral  (#FF5577)   "control sistem"
  Tipografia folosește Barlow Condensed (display), Barlow (body),
  Outfit (secundar), Syne Mono (tehnic). Dark mode este complet
  implementat și persistat în localStorage.

SEPARAREA CLIENT HTTP - MOCK LAYER - FEATURE CODE:
  Niciun fișier din features/ nu știe dacă datele vin de la un server
  real sau de la mock layer. Toate request-urile trec prin axios
  client -> interceptor -> fie fetch real, fie mockRoute(). Această
  separare înseamnă că migrarea la backend real se face prin setarea
  unei variabile de mediu (VITE_API_URL) - fără modificări în UI.





6. MODULE IMPLEMENTATE - DETALII
--------------------------------------------------------------------------------

6.1. AUTENTIFICARE (Login / Register / Edit Profile)
     ───────────────────────────────────────────────
  LoginPage.jsx conține 3 tab-uri distincte:
    - Login standard (username/email + parolă)
    - Register (lansează wizard-ul)
    - Try demo (4 conturi pre-configurate, selecție vizuală pe rol)

  RegisterWizard.jsx este un wizard animat în 3 pași, cu câmpuri
  contextuale:
    Pas 1: Alegere rol (Athlete / Coach / Nutritionist)
    Pas 2: Alegere plan (doar pentru Athlete: Free / Pro / Team)
    Pas 3: Date profil - câmpurile diferă pe rol:
           - Athlete: greutate, înălțime, obiectiv principal
           - Coach: specializare, ani experiență, bio
           - Nutritionist: specializare, certificări, bio
  Validare client-side: email cu regex, parolă min. 4 caractere,
  confirmare parolă, câmpuri obligatorii.

  ProfilePage.jsx (Edit Profile):
    - Editare nume, greutate, avatar
    - Upload imagine avatar (cu validare size < 5 MB)
    - Alternativ: selectare culoare din 8 teme predefinite (avatar
      generat prin ui-avatars.com)
    - 8 obiective editabile: calorii zilnice, proteine, carbohidrați,
      grăsimi, apă, pași, somn, greutate target


6.2. HOMEPAGE (public/landing.html)
     ──────────────────────────────
  Pagină de marketing completă, HTML/CSS/JS nativ, fără framework.
  Secțiuni (în ordinea pe pagină):
    - Nav fixă cu hamburger menu mobile
    - Ticker animat cu mesaje scroll
    - Hero: particle network pe canvas (60 particule conectate),
      floating orbs, titlu cu efect glitch, CTA-uri
    - "Ecosistem" (features)
    - Dashboard preview interactiv
    - Planuri (Free / Pro / Team)
    - Marketplace echipe
    - Demo roluri (cards care lansează direct login-ul demo)
    - Galerie imagini cu auto-scroll (secțiunea 6.6)
    - FAQ
    - CTA final
    - Footer cu linkuri legale și policy modals

  Animații CSS native: reveal-on-scroll, counter animation, online
  pulse, gradient backgrounds, cubic-bezier tranziții.


6.3. PAGINĂ PRINCIPALĂ - Dashboard Atlet (OverviewPage.jsx)
     ─────────────────────────────────────────────────────
  Pagina la care utilizatorul atlet aterizează după login. Conține:
    - HeroCard cu salut personalizat și Daily Score Ring:
      SVG animat care afișează un scor calculat real-time din 4
      metrici (hidratare, scor somn, progres workout, aport caloric),
      cu culoare contextuală (verde peste 75, albastru 45-75, roșu
      sub 45).
    - 4 KPI Cards cu sparklines (grafice linie miniaturale):
      Calorii azi, Hidratare (click pentru +1 pahar apă), Pași,
      Scor somn.
    - Workout card cu exerciții interactive (toggle completed).
    - Macro breakdown cu progress bars per macronutrient.
    - Activity feed recent.


6.4. PAGINI ADMINISTRARE (features/admin/)
     ─────────────────────────────────────
  6 pagini distincte, toate funcționale, toate cu date bogate:

    AdminOverviewPage  Dashboard cu KPI financiari (venit lună, an,
                       profit net), grafic istoric 6 luni, top
                       profesioniști, statistici roluri și planuri.

    AdminUsersPage     Tabel cu toate conturile; căutare după nume/
                       email/echipă, filtrare pe rol, paginare,
                       ștergere user cu ConfirmModal.

    AdminInboxPage     Unifică mesajele de contact și înscrierile
                       pe waitlist. Filtrare pe tip și status,
                       marcare citit.

    AdminManagePage    Moderare echipe și profesioniști din
                       marketplace. Expandare detalii, ștergere
                       postări și comentarii din feed.

    AdminSettingsPage  4 feature flags cu toggle: public signup,
                       waitlist, contact form, maintenance mode.
                       Salvare către /admin/settings.

    AdminSecurityPage  Audit log cu 15 evenimente istorice: login-uri,
                       moderare, schimbări setări, rambursuri.
                       Filtrare pe tip și status.


6.5. CONTACT
     ───────
  Pagina dedicată (src/features/shared/pages/ContactPage.jsx):
       formular HTML5 cu tag <form> și validare client-side (regex
       email, minim caractere), hartă Google Maps în iframe, 4
       carduri de date (adresă, email, telefon, program), 3 linkuri
       social media (Facebook, Instagram, X/Twitter).


6.6. GALERIE IMAGINI (în landing.html)
     ─────────────────────────────────
  Secțiunea #gallery-section conține 8 slide-uri fitness/wellness cu
  caption overlay și etichete de categorie. Mecanismul de auto-scroll
  este implementat nativ:

    var INTERVAL = 3000;  // exact cerința din PDF
    autoTimer = setInterval(function(){ idx++; go(); startProg(); },
                            INTERVAL);


9. CONTURI DEMO PENTRU TESTARE
--------------------------------------------------------------------------------
Pe pagina de Login există tab-ul "Try demo" cu 4 conturi pre-configurate.


