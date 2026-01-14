import { saveProjectState } from "./projectDb";

/**
 * Persistance: sauvegarde l\'état "persistable" du store dans IndexedDB.
 * - Debounce 250ms
 * - Ignore les fonctions/actions
 */
export function subscribeProjectPersistence(useProjectStore) {
  let timer = null;

  const unsub = useProjectStore.subscribe(
    (state) => getPersistableState(state),
    (persistable) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        saveProjectState(persistable).catch(() => {
          // silencieux pour le MVP
        });
      }, 250);
    },
    { equalityFn: shallowEqual }
  );

  return () => {
    if (timer) clearTimeout(timer);
    unsub();
  };
}

function getPersistableState(state) {
  // On ne garde que le JSON data, pas les actions
  const {
    bpmLocked,
    zoom,
    selection,
    tracks,
    timeline,
  } = state;

  return { bpmLocked, zoom, selection, tracks, timeline };
}

// equality minimale pour éviter d’écrire si rien ne change vraiment
function shallowEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (a[k] !== b[k]) return false;
  return true;
}
