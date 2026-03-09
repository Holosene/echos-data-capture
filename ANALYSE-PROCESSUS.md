# ÉCHOS / ECOS — Analyse du processus de création

> **Projet** : Traduire des données environnementales brutes (captures sonar + traces GPS) en présences volumétriques perceptibles
> **Période** : 9 février 2026 → 9 mars 2026 (28 jours)
> **~200+ commits** sur 13 branches

---

## 1. CHRONOLOGIE DES COMMITS — Phases narratives

### Phase A — Genèse et infrastructure (9–10 février)

| Date | Commit | Ce qui change visuellement |
|------|--------|---------------------------|
| 09/02 15:58 | `c670fef` feat: ECHOS — full architecture with client-side sonar volume pipeline | **Tout part de là.** Une SPA vide avec l'architecture : monorepo, pipeline sonar, types TypeScript. Rien de visible encore, juste le squelette. |
| 09/02 16:16–17:37 | `94c3b26`→`a28176c` fix: GitHub Pages deploy, Vite build | Lutte technique pour faire fonctionner le déploiement. L'écran est encore blanc/en erreur. |
| 09/02 22:03 | `829c723` feat: complete UI/UX redesign — OpenSea-inspired marketplace aesthetic | **Premier visuel.** Interface sombre type marketplace/galerie. C'est encore une coquille vide sans données sonar. |
| 09/02 22:44 | `f200c67` feat: complete FR/EN i18n, SVG icons, stepper redesign | Le stepper apparaît : Importer → Configurer → Générer → Visualiser. Interface bilingue FR/EN. |
| 10/02 01:19 | `256af80` feat: add logo, favicon, gallery and hero images | **Première identité visuelle.** Logo, images de galerie (captures sonar), hero image sur la homepage. |
| 10/02 01:14 | `4b943ea` feat: light mode, layout redesign, lowercase "échos", SVG assets | Bascule en mode clair. Le nom passe en minuscules : « échos ». |
| 10/02 01:54 | `d35a7ff` fix: revert to dark mode | **Retour au mode sombre** — le mode clair ne convenait pas. Premier va-et-vient esthétique. |
| 10/02 19:52 | `8987232` feat: mobile UX overhaul, inline docs, gallery zoom | La page d'accueil devient un vrai site navigable avec galerie, docs inline, zoom sur images. |

> **Moment charnière** : Le projet est encore un site vitrine. Il n'y a pas encore de moteur volumétrique fonctionnel.

### Phase B — Premier moteur volumétrique V2 « conique » (23–24 février)

| Date | Commit | Ce qui change visuellement |
|------|--------|---------------------------|
| 23/02 10:38 | `cbca335` feat: ECHOS V2 — Probabilistic Conic Acoustic Projection Engine | **Rupture majeure.** Le cœur du projet apparaît : un moteur de projection conique probabiliste qui transforme les frames vidéo sonar en données volumétriques 3D. On voit pour la première fois un volume 3D à l'écran. |
| 23/02 13:00 | `0681767` fix: Mode A/B rendering + UX simplifiée auto-intelligente | Deux modes de rendu apparaissent. L'interface détecte automatiquement les zones sonar. |
| 23/02 13:25 | `c05a319` fix: WebGL shader + UX V1-style crop visuel | Le crop visuel permet de sélectionner la zone sonar à projeter. L'image du sondeur est visible. |
| 23/02 14:11 | `872fd45` Improve volume fidelity: increase fps + grid resolution | Les volumes deviennent plus détaillés. |
| 23/02 14:22 | `6a62312` Mode A: live temporal playback instead of static baked volume | **Le volume bouge.** Au lieu d'un bloc statique, on voit le volume se construire frame par frame en temps réel. |
| 23/02 14:55 | `7bb5c36` V2 upgrade: shader lighting, camera presets, slices, exports | Éclairage par shaders, préréglages de caméra (face, dessus, côté), coupes 2D, export NRRD. Le viewer devient riche. |
| 23/02 15:44 | `b115bd0` UX overhaul: scrollable homepage, frontal view, smooth playback | La homepage devient scrollable avec les sections. Vue frontale du volume par défaut. |
| 23/02 16:50 | `2d30a19` Branding overhaul, color palette update | Nouvelle palette de couleurs. Identité visuelle cohérente avec SVGs « texte-titre ». |

> **Moment charnière** : On voit pour la première fois des données sonar réelles transformées en volume 3D navigable dans le navigateur.

### Phase C — La guerre des axes (24–25 février)

C'est la phase la plus chaotique et la plus révélatrice du processus. Le volume 3D s'affiche mais **les axes sont inversés** — la profondeur est sur le mauvais axe, le temps sur le mauvais plan. S'ensuit une bataille de 48h avec des dizaines de commits de correction et de reverts.

| Date | Commit | Ce qui se passe |
|------|--------|-----------------|
| 24/02 14:16 | `8949b3c` Offload preprocessing to Web Worker | Optimisation : le calcul passe en Web Worker (le thread principal ne gèle plus). |
| 24/02 14:38–15:22 | `55601d6`→`d1c68da` Restore volume renderer to X state | **3 restaurations successives** à des états antérieurs. Le renderer casse à chaque tentative. |
| 24/02 16:04 | `8fa86d5` Fix Y↔Z axis inversion | Premier fix d'axes. Mais ça recasse. |
| 24/02 16:15 | `722c4b0` Add interactive 3D volume calibration tool | Outil de calibration secret (appuyer 5× sur B). Tentative de résoudre le problème d'orientation par l'interface. |
| 24/02 17:24 | `15d55a4` Add built-in calibration tool (press b x5) | L'outil de calibration évolue, Ctrl+S pour sauvegarder la pose. |
| 24/02 18:13 | `beb081c` feat: add scan version selector (V1 classic / V2 conic) | **Coexistence V1/V2** — on garde les deux moteurs en parallèle par précaution. |
| 24/02 18:37–18:53 | `df618d9`→`8d0a20e` 3 reverts successifs | Panique. Restauration à des états antérieurs, puis re-restauration à l'état le plus récent. |
| 24/02 20:43 | `24d1e05` feat: refonte UX scan page — suppression V1 | **V1 est supprimée.** On mise tout sur V2. |
| 24/02 22:17–23:17 | `42b7a0d`→`a6948d3` 5 commits de remapping d'axes | Réarrangement systématique des axes : temporal→Y, depth→Z, lateral→X. Chaque commit corrige un mapping. |
| 25/02 00:08 | `b4545de` refactor: rebuild volume engine — decouple box shape from data mapping | **Refonte architecturale** : séparation de la forme géométrique et du mapping de données. |
| 25/02 08:09 | `fd1a814` feat: add .echos-vol snapshot format | Format de fichier propriétaire `.echos-vol` pour sauvegarder/charger des volumes instantanément. |
| 25/02 09:23–11:52 | 12 commits de fix/revert | **La séquence la plus intense.** Fix → casse → revert → re-fix → revert massif → restauration. On voit le commit `71b638f` "annuler tous les commits après Deploy #130". |
| 25/02 13:37 | `5ca657d` fix: remove shader permutation matrix — use direct UVW sampling | **Le déclic.** Au lieu de permuter les axes dans un système complexe, utilisation directe de l'échantillonnage UVW dans le shader. Simplicité qui résout le problème. |
| 25/02 17:27 | `2929d91` fix: stabilize volume dimension pipeline — remove all Y/Z swaps | **Stabilisation finale.** Suppression de TOUS les swaps d'axes. Convention unique : X=latéral, Y=track, Z=profondeur. |
| 25/02 18:30–21:04 | `156ac70`→`0223f6b` 10 commits de calibration fine | Ajustements fins du pipeline : voxelIdx, Data3DTexture, camera presets. |

> **Moment charnière** : Cette crise des axes a duré ~48h et représente ~60 commits. C'est le cœur du processus d'expérimentation.

### Phase D — Trois modes de rendu simultanés (26 février)

| Date | Commit | Ce qui change visuellement |
|------|--------|---------------------------|
| 26/02 00:02 | `fc05a48` fix: stack all frames into volume for Mode A | Mode A fonctionnel : volume statique complet empilé frame par frame. |
| 26/02 13:57 | `9a046c3` perf: optimize generation pipeline — LUT bilateral, sorting network median | Pipeline 2× plus rapide. |
| 26/02 14:03 | `b16f714` feat: 3 quality presets (Rapide / Équilibré / Complet) | L'utilisateur choisit la qualité avant de générer. |
| 26/02 14:54–16:34 | `289810a`→`f22ca30` Expériences skew/rotation/sliding window | Tentatives de correction de cisaillement, animation par fenêtre glissante, translation physique du volume. **Toutes abandonnées.** |
| 26/02 16:38–16:59 | `ca6bedf`→`cbf6353` 3 tentatives de playback temporel | Essai de lecture temporelle Mode A → revert → essai sur Mode B → revert. |
| 26/02 17:03 | `b2d2d42` feat: dual rendering engines — Rendu A (static) + Rendu B (sliding window) | **Architecture bi-moteur.** Deux approches coexistent. |
| 26/02 17:21 | `82670ff` feat: add Mode C — classic volumetric engine | **Trois moteurs !** Mode C restaure le moteur volumétrique classique de `cdef367`. |
| 26/02 18:45–18:51 | `5e7cf28`→`536c18d` Apply default calibrations B + C | Calibrations sauvegardées pour chaque mode. |
| 26/02 21:25 | `7693aec` feat: multi-mode simultaneous rendering | **Les 3 volumes s'affichent côte à côte.** Trois interprétations différentes des mêmes données sonar. |
| 26/02 22:56 | `9cb2e92` fix: restore exact per-mode engine configs | Stabilisation des configurations. |
| 26/02 23:54 | `113d012` feat: generate all 3 modes simultaneously | Génération simultanée des 3 modes en un clic. |

> **Moment charnière** : Le projet passe d'un seul volume à trois interprétations simultanées. C'est conceptuellement le moment le plus fort.

### Phase E — Redesign UI « Viewer » et polish (27 février)

| Date | Commit | Ce qui change visuellement |
|------|--------|---------------------------|
| 27/02 13:32 | `4890d93` refactor: rename ECHOS → ECOS | Le projet change de nom. Nettoyage identitaire. |
| 27/02 14:25 | `99c8045` feat: redesign VolumeViewer with two-stage UI | **UI à deux étapes** : Stage 1 = vue galerie (les 3 volumes en grille), Stage 2 = vue détail (un volume en plein écran avec outils). |
| 27/02 14:46 | `7fb5242` feat: 4-column grid layout for VolumeViewer | Grille 4 colonnes : 3 volumes + panneau carte/info. |
| 27/02 16:23 | `bc2e16b` VolumeViewer comprehensive UI overhaul — 15 fixes | 15 corrections UI d'un coup. |
| 27/02 16:56 | `bc96cc3` feat: strict presentation position, remove Structures | Le mode « Structures » est supprimé. Les volumes sont verrouillés en position de présentation. |
| 27/02 17:24 | `a12ac54` feat: Ctrl+S snaps all volumes to presentation poses | Ctrl+S = tous les volumes reviennent à leur pose de présentation. |
| 27/02 17:55–23:26 | 15 commits de polish UI | Carte Leaflet, sliders, typographie, espacement, bordures, thème, calibration, noms des volumes (« Cône », « Bloc », « Tracé »). |

### Phase F — Performance, mobile et finitions (28 février – 9 mars)

| Date | Commit | Ce qui change visuellement |
|------|--------|---------------------------|
| 28/02 10:12 | `67214e6` feat: memory optimization + SlicePanel redesign + test button | Bouton « Tester » qui charge des fichiers exemples. Panneau de coupes 2D redessiné. |
| 28/02 10:24 | `7ac0960` perf: eliminate GPU texture churn | Les animations deviennent fluides (plus de clignotement). |
| 28/02 11:28 | `d3837ea` perf: fix cache corruption, dirty-flag rendering | Rendu conditionnel. Le GPU ne travaille que quand c'est nécessaire. |
| 28/02 14:02 | `10f231b` fix: crop SVGs, RAF playback, test loading indicator | Playback via requestAnimationFrame (fluidité maximale). |
| 28/02 15:47 | `263d426` feat: comprehensive mobile responsive update | **Version mobile complète.** |
| 28/02 16:44 | `e9a60ac` feat: major UI polish — remove stats, add guillemets | Suppression des stats techniques. Ajout de guillemets français « ». |
| 28/02 17:14–18:22 | `d6d2ddc`→`285db45` 5 commits mobile scan | Page scan mobile : layout scrollable, bouton flottant, crop compact. |
| 05/03 21:29 | `2d3ecdb` fix: floating CTA, 80% scale homepage | CTA flottant, homepage à 80%. |
| 07/03 20:03 | `ab300c9` fix: replace IntersectionObserver with scroll listener | Dernier fix de compatibilité. |
| **09/03 00:40** | **`ab6d3a5`** feat: real quality improvements — CLAHE, tricubic sampling, gradient lighting, percentile normalization | **Dernier commit.** Améliorations qualitatives majeures : égalisation d'histogramme adaptative (CLAHE), échantillonnage tricubique, éclairage par gradient, normalisation par percentiles. Les volumes sont visuellement plus riches et détaillés. |

---

## 2. ÉTAPES CLÉS DU PROCESSUS

### Étape 1 — Le squelette conceptuel
- **Commit** : `c670fef` (9 février 15:58)
- **À l'écran** : Rien de visible. Un README et une architecture de code.
- **Signification** : Tout le modèle mental est déjà là : pipeline sonar → volume → visualisation 3D. Le concept précède le visuel.

### Étape 2 — La coquille habitée
- **Commit** : `829c723` → `8987232` (9–10 février)
- **À l'écran** : Un site web sombre avec galerie d'images sonar, texte manifeste, navigation scrollable, logo. Mais aucun traitement de données.
- **Signification** : Le cadre narratif et esthétique est posé avant que la technique ne fonctionne. On crée l'écrin avant l'objet.

### Étape 3 — Le premier volume (la rupture)
- **Commit** : `cbca335` (23 février 10:38)
- **À l'écran** : Un volume 3D apparaît dans le navigateur, généré à partir d'une vidéo sonar. C'est brut, les axes sont probablement faux, mais on voit une forme tridimensionnelle issue de données acoustiques réelles.
- **Signification** : Le passage du 2D au 3D. L'image sonar plate devient un objet spatial navigable. C'est ici que « la donnée prend corps ».

### Étape 4 — La crise des axes (le moment pivot)
- **Commits** : `8fa86d5` → `5ca657d` (24–25 février, ~60 commits)
- **À l'écran** : Le volume existe mais il est « tordu » — la profondeur est à l'horizontale, le temps est sur le mauvais plan. On voit des commits frénétiques de swap X↔Y, Y↔Z, des reverts, des restaurations à des états antérieurs, un outil de calibration caché. Puis soudain, la solution simple : échantillonnage UVW direct dans le shader.
- **Signification** : L'expérimentation à l'état pur. Le moment où la complexité accumulée est remplacée par une solution élégante. Pour le portfolio : montrer les captures « avant » (volume déformé) et « après ».

### Étape 5 — Les trois voix (moment conceptuel fort)
- **Commit** : `7693aec` → `113d012` (26 février)
- **À l'écran** : Trois volumes côte à côte, générés à partir des mêmes données sonar : **Cône** (projection conique probabiliste), **Bloc** (empilement temporel), **Tracé** (lecture temporelle classique). Trois morphologies différentes pour les mêmes données environnementales.
- **Signification** : La donnée n'a pas une seule « traduction » volumétrique. Le projet montre la multiplicité des interprétations possibles. C'est le concept central pour l'ENSAD.

### Étape 6 — La version aboutie
- **Commit** : `ab6d3a5` (9 mars 00:40)
- **À l'écran** : Interface sombre polie avec 3 volumes haute qualité (CLAHE, tricubique, éclairage gradient), grille 4 colonnes, carte GPS Leaflet, coupes 2D, export NRRD, playback temporel fluide, version mobile. Guillemets français, typographie soignée.
- **Signification** : L'outil est complet : de la capture sonar brute à la présence volumétrique perceptible, en passant par le web.

---

## 3. PISTES ABANDONNÉES

### Branches mortes
| Branche | Durée de vie | Ce qui a été tenté | Pourquoi abandonné |
|---------|-------------|--------------------|--------------------|
| `claude/fix-vite-build-pages-K4cum` | 09/02, 4 commits | Build Vite, UI "OpenSea-inspired", i18n | Fusionné partiellement, approche UI abandonnée |
| `claude/add-favicon-logos-jtuZm` | 10–11/02, 8 commits | Logos PNG, dark/light mode toggle | Remplacé par SVGs propres. Hyphen vs underscore (`logotype_dark` vs `logotype-dark`) a causé des bugs. |
| `claude/architecture-design-review-gx20W` | 23/02, 5 commits | Upload/delete du dossier public entier via GitHub UI | Erreur de manipulation. Fichiers uploadés puis supprimés. |
| `claude/continue-development-EALWd` | 24–25/02, ~50 commits | Moteur volumétrique V2 avec `axisMapping`, `dataRotation`, `dataMapping permutation`, `.echos-vol` format | **La piste la plus riche en expérimentation.** Système complexe de permutation d'axes et rotation des données. Abandonné au profit de l'échantillonnage UVW direct. |
| `claude/continue-dev-wip-DMtWB` | 25–26/02, ~15 commits | Swaps `voxelIdx`, `Data3DTexture` params, spatial track position | Tentatives de corriger le pipeline par le bas (données) plutôt que par le haut (shader). |
| `claude/fix-mobile-scan-buttons-5iEUw` | 23–25/02, ~30 commits | Fix mobile, crop, rendering, branding | Fusionné en partie. Beaucoup de travail UI jeté. |
| `claude/backup-v1-5iEUw` / `claude/backup-v2-5iEUw` | 24/02 | Sauvegardes de sécurité avant refonte | Branches de secours. Montrent la peur de casser ce qui marche. |

### Fichiers/features supprimés
- **`volume-snapshot.ts`** (`.echos-vol` format) : Format binaire propriétaire pour sauvegarder les volumes. Créé, supprimé, recréé, re-supprimé 4 fois.
- **Mode V1 (classique)** : Coexistait brièvement avec V2 (`beb081c`), supprimé dans `24d1e05`.
- **Mode "Structures"** : Supprimé dans `bc96cc3`, remplacé par les positions de présentation.
- **Système `axisMapping` + `dataRotation`** : Un système complexe de rotation/permutation des données dans le moteur. Supprimé dans `b79558c`.
- **`adaptive-threshold.ts`** : Seuillage adaptatif, créé puis supprimé.
- **Animations skew/sliding window/translation** (`289810a`→`f22ca30`) : 6 commits d'expériences de déformation et d'animation. Tout reverté.
- **Données synthétiques de test** (`a23b4a7`→`c57150a`) : Générateur de données de test créé puis retiré au profit de vrais fichiers exemples.
- **Mode clair** (`4b943ea`→`d35a7ff`) : Testé et abandonné en quelques heures.

### Reverts remarquables
On compte **au moins 15 reverts explicites** dans l'historique. Les plus significatifs :
- `71b638f` "annuler tous les commits après Deploy #130" — rollback massif
- `94da7f2` "annuler tous les commits après Deploy #140" — second rollback
- `fa097a2` "restaurer l'état exact de f192ee0" — troisième restauration
- `f22ca30` "undo rotation, skew, axisMapping, and sliding window experiments" — abandon de toute une direction

---

## 4. STACK TECHNIQUE

### Langages
| Technologie | Rôle |
|-------------|------|
| **TypeScript** | Langage principal (tout le projet) |
| **GLSL** (via Three.js) | Shaders volumétriques : raymarching, éclairage gradient, transfer functions |
| **HTML/CSS** | Interface web, responsive mobile |

### Frameworks et librairies
| Librairie | Version | Rôle dans le projet |
|-----------|---------|---------------------|
| **React** | 18.2 | Interface utilisateur réactive (SPA) |
| **Three.js** | 0.183 | Moteur 3D WebGL : `Data3DTexture`, mesh volumétrique, caméra orbit, rendu raymarching |
| **Vite** | 5.1 | Bundler et serveur de développement |
| **React Router** | 6.22 | Navigation SPA (HomePage, ScanPage, WizardPage, etc.) |
| **Leaflet** | 1.9.4 | Carte interactive GPS (affichage de la trace du bateau) |

### Architecture monorepo
```
echos-data-capture/
├── apps/web/           ← Application React (SPA)
│   └── src/
│       ├── engine/     ← Moteurs de rendu volumétrique (2 versions : conic + classic)
│       ├── components/ ← UI React (VolumeViewer=1869 lignes, CropStep, CalibrationPanel...)
│       ├── pages/      ← Pages (Home, Scan, Wizard, Map, Docs, Manifesto)
│       ├── workers/    ← Web Worker pour le pipeline de calcul
│       ├── i18n/       ← Traductions FR/EN
│       ├── store/      ← État global
│       └── theme/      ← Thème sombre/clair
└── packages/
    ├── core/           ← Pipeline de traitement (projection conique, GPX, sync, preprocessing)
    └── ui/             ← Composants UI partagés
```

### Pipeline de données (le cœur technique)
1. **Import** : Vidéo sonar (.mp4) + trace GPS (.gpx) optionnelle
2. **Extraction** : Frames vidéo extraites via `<canvas>` + `requestAnimationFrame`
3. **Crop** : Détection automatique de la zone sonar dans l'image (auto-détection de profondeur)
4. **Preprocessing** : Filtrage bilatéral (LUT), médiane (sorting network), CLAHE (égalisation adaptative)
5. **Projection** : Projection conique probabiliste (`conic-projection.ts`) — simule le faisceau acoustique conique du sondeur
6. **Volume** : Données empilées en `Float32Array` → `Data3DTexture` Three.js
7. **Rendu** : Raymarching GLSL avec éclairage gradient, transfer function couleur, échantillonnage tricubique
8. **Export** : Format NRRD (compatible logiciels de visualisation scientifique)

### APIs et standards
- **Web Workers API** : Calcul parallèle hors thread principal
- **WebGL 2.0** (via Three.js) : Rendu volumétrique GPU
- **Canvas API** : Extraction de frames vidéo
- **GPX** (XML) : Format standard de traces GPS
- **NRRD** : Format d'export volumétrique scientifique
- **GitHub Pages** : Hébergement statique

---

## 5. CAPTURES RECOMMANDÉES POUR LE PORTFOLIO ENSAD

### Capture 1 — « L'écrin vide » (Phase A)
- **Checkout** : `git checkout 8987232`
- **Quoi capturer** : La homepage avec galerie d'images sonar, texte manifeste, navigation. Montrer qu'il y a d'abord un cadre narratif et esthétique.
- **Pour le dossier** : « J'ai d'abord construit le récit avant de construire l'outil. »

### Capture 2 — « Le premier volume » (Phase B)
- **Checkout** : `git checkout cbca335`
- **Quoi capturer** : Charger une vidéo sonar et voir le premier volume 3D apparaître. Capturer le moment où le volume se matérialise dans le viewer.
- **Pour le dossier** : « Le passage de la donnée plate à l'objet spatial. La donnée prend corps. »

### Capture 3 — « Le volume qui ne tient pas en place » (Phase C — crise des axes)
- **Checkout** : `git checkout 8fa86d5` puis `git checkout 722c4b0` puis `git checkout 5ca657d`
- **Quoi capturer** : Trois captures montrant le même volume avec les axes inversés/corrigés. L'outil de calibration caché (5× B). Le code avec tous les swaps X↔Y.
- **Pour le dossier** : « L'expérimentation comme méthode. 60 commits en 48h pour trouver que la solution était de simplifier. »

### Capture 4 — « Trois voix pour les mêmes données » (Phase D)
- **Checkout** : `git checkout 113d012`
- **Quoi capturer** : Les trois volumes côte à côte (Cône, Bloc, Tracé) générés depuis les mêmes données. Vue de face, vue de côté, vue de dessus.
- **Pour le dossier** : « Une même donnée environnementale, trois présences volumétriques différentes. La traduction n'est jamais neutre. »

### Capture 5 — « L'interface de transformation » (Phase E)
- **Checkout** : `git checkout 641f09d`
- **Quoi capturer** : Le wizard complet : import vidéo → crop sonar → choix qualité → génération (avec barre de progression) → viewer 4 colonnes. La carte GPS. Les coupes 2D.
- **Pour le dossier** : « L'outil comme geste de traduction : chaque étape est un choix d'interprétation. »

### Capture 6 — « La version aboutie » (Phase F)
- **Checkout** : `git checkout ab6d3a5` (HEAD actuel)
- **Quoi capturer** : Volumes haute qualité avec CLAHE + tricubique. Un volume en plein écran, rotation lente. Détail des textures volumétriques. Version mobile.
- **Pour le dossier** : « Le résultat final : des présences volumétriques perceptibles, accessibles depuis n'importe quel navigateur. »

### Capture 7 — « Le cimetière des expériences » (Pistes abandonnées)
- **Quoi capturer** : Screenshots du graph git (`git log --graph`), captures des commits de revert, code barré des swaps d'axes. La branche `EALWd` avec ses 50 commits.
- **Pour le dossier** : « Le processus n'est pas linéaire. Chaque impasse nourrit la solution finale. »

### Capture bonus — « Le code comme matière »
- **Quoi capturer** : Le fichier `shaders.ts` (205 lignes de GLSL), le fichier `conic-projection.ts`, le pipeline-worker. Le code lui-même comme texture visuelle.
- **Pour le dossier** : « Le code est le médium. Le shader GLSL est la brosse qui peint les volumes. »

---

## Résumé narratif pour l'ENSAD

> Ce projet est né d'une question simple : **comment rendre perceptible ce qui est invisible ?** Un sondeur acoustique produit des images 2D de fonds marins. Ce sont des données brutes, des colonnes de pixels encodant des échos sonores. Le projet ECOS les transforme en **objets volumétriques 3D** navigables dans un navigateur web.
>
> Le processus de création, documenté par 200+ commits sur 28 jours, révèle une méthode expérimentale intense : le cadre esthétique a précédé la technique (Phase A), le premier volume a surgi de manière brute et déformée (Phase B), une crise de 48h sur l'orientation des axes a mené à une simplification radicale (Phase C), puis l'idée de montrer **trois interprétations simultanées** des mêmes données est apparue comme évidence conceptuelle (Phase D).
>
> Le résultat n'est pas un volume unique, mais **trois présences volumétriques** — Cône, Bloc, Tracé — issues des mêmes données environnementales. C'est une proposition sur la traduction : elle n'est jamais neutre, elle est toujours un choix de forme.
