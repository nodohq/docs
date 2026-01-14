# MASTER_PLAN.md - DJArchitect MVP

## Objectif Produit

Créer un outil de mix DJ "visuel" et non-temps réel, basé sur des blocs musicaux. L'objectif est de permettre la construction d'un set en se concentrant sur la structure, l'harmonie et l'énergie, plutôt que sur la performance live.

## Stratégie MVP (Minimum Viable Product)

Le MVP se concentre sur la "stabilité de l'architecture" et l'expérience de base de la manipulation de la timeline. L'audio n'est pas dans le scope du MVP.

1.  **Fondations Stables (Ticket #01):**
    *   Un environnement de développement qui marche (Vite/React).
    *   Un layout clair et non-dynamique (Bibliothèque, Timeline, Inspecteur).
    *   Une persistance immédiate de l'état du projet (IndexedDB) pour que chaque action soit sauvegardée et restaurée au rechargement.

2.  **Modèle de Données et Projection (Ticket #02):**
    *   Établir une unité de temps interne unique et stable : le "beat" (entier).
    *   Créer une projection déterministe et réversible entre les `beats` du modèle et les `pixels` de la vue.
    *   Implémenter un contrôle de zoom qui affecte uniquement la projection, pas les données.

3.  **Interaction de Base (Tickets #04, #05, #06):**
    *   Visualiser la grille temporelle (les beats).
    *   Permettre de glisser des "tracks" de la bibliothèque vers la timeline.
    *   Permettre de déplacer et redimensionner les blocs sur la timeline, avec des règles de collision simples.

4.  **Feedback Utilisateur (Tickets #07, #09):**
    *   Afficher les propriétés de l'objet sélectionné dans l'inspecteur.
    *   Donner des avertissements visuels simples si des règles de mix (BPM, tonalité) ne sont pas respectées.

5.  **Fonctionnalités Avancées (Tickets #08, #10):**
    *   Un système d'annulation/rétablissement (Undo/Redo) robuste.
    *   Des options d'export simples (JSON, CSV) pour utiliser les données du set à l'extérieur.

## Hors Scope MVP

*   Lecture audio.
*   Analyse de fichiers audio.
*   Effets, transitions automatiques.
*   Collaboration en temps réel.
*   Comptes utilisateurs, backend.
