# MVP_SPEC.md - Spécifications Techniques

## 1. Stack Technique

*   **Frontend:** React (avec Vite)
*   **Gestion d'état:** Zustand
*   **Stockage local:** IndexedDB (via `idb`)
*   **Styling:** Inline CSS / CSS-in-JS (pas de framework UI pour le moment)

## 2. Structure du Projet (MVP)

*   `src/components/`: Composants React UI (ex: Timeline, TrackBlock, Inspector).
*   `src/store/`: Stores Zustand (un store principal `useProjectStore`).
*   `src/storage/`: Logique de persistance (IndexedDB, `subscribe` au store).
*   `src/utils/`: Fonctions pures et helpers (ex: conversions `beat` <-> `px`).
*   `docs/`: Documentation (MASTER_PLAN, MVP_SPEC, TICKETS).

## 3. Spécifications par Ticket

*   **Ticket #01: Layout & Boot**
    *   Layout CSS Grid: `250px 1fr 300px`.
    *   État initial "mocké" dans `useProjectStore`.
    *   `useEffect` dans `App.jsx` pour charger depuis IndexedDB et `subscribe` aux changements.
    *   Clé de stockage unique dans `projectDb.js`: `project_state_v1`.

*   **Ticket #02: Modèle de Données & Projection**
    *   **Store (`useProjectStore`):**
        *   `timeline.blocks`: `{ id, trackId, startBeat, lengthBeats }` (tous les temps en entiers).
        *   `zoom: { pxPerBeat }`.
        *   Aucune valeur en pixels ne doit être stockée dans l'état persistant.
    *   **Projection (`src/utils/projection.js`):**
        *   `beatToPx(beat, pxPerBeat)`: `Math.round(beat * pxPerBeat)`.
        *   `pxToBeat(px, pxPerBeat)`: `Math.round(px / pxPerBeat)`.
        *   Les fonctions doivent être pures, déterministes et gérer les entrées non valides.
    *   **Contrôle UI:** Boutons pour `setPxPerBeat` qui clampent la valeur dans un range raisonnable (ex: `[0.25, 512]`).

*   **Ticket #03: (fusionné avec #01)**
    *   La persistance est déjà gérée dans le cadre du boot stable de #01.

*   **Ticket #04: Grille & Snapping**
    *   La grille est un composant React qui affiche des lignes verticales basées sur `pxPerBeat`.
    *   Le snapping se fait au niveau du `onDragEnd` (ou équivalent) en arrondissant la position `px` au `beat` le plus proche avant de mettre à jour le store.

## 4. Règle d'Or: Immutabilité

*   Toutes les mises à jour du store Zustand qui concernent des objets ou des tableaux (`tracks`, `timeline`, `selection`, `zoom`) **DOIVENT** créer de nouvelles références d'objet/tableau. La mutation "en place" est interdite car elle casse la détection de changement de `shallowEqual` utilisée par la persistance.
    *   **Correct:** `set(state => ({ tracks: state.tracks.map(...) }))`
    *   **Incorrect:** `set(state => { state.tracks[0].bpm = 128; return state; })`
