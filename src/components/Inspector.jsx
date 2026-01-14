import React, { useState, useEffect } from "react";
import { useProjectStore } from "../store/useProjectStore";

export default function Inspector() {
  const selectedBlock = useProjectStore((s) => s.getSelectedBlock());
  const selectedTrack = useProjectStore((s) => s.getSelectedTrack());
  const updateBlock = useProjectStore((s) => s.updateBlock);
  const updateTrackMeta = useProjectStore((s) => s.updateTrackMeta);

  const [draftBlock, setDraftBlock] = useState(selectedBlock);
  const [draftTrack, setDraftTrack] = useState(selectedTrack);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setDraftBlock(selectedBlock);
    setDraftTrack(selectedTrack);
    setValidationError("");
  }, [selectedBlock, selectedTrack]);

  const handleBlockInputChange = (field, value) => {
    if (!draftBlock) return;

    setDraftBlock({ ...draftBlock, [field]: value });

    if (field === "startBeat" || field === "lengthBeats") {
      if (value === "") {
        setValidationError("");
        return;
      }

      const parsedValue = parseFloat(value);
      if (!Number.isFinite(parsedValue)) {
        setValidationError("Invalid number");
        return;
      }

      setValidationError("");
      updateBlock(draftBlock.id, { [field]: parsedValue });

    } else if (field === "transition") {
      setValidationError("");
      updateBlock(draftBlock.id, { [field]: value });
    }
  };

  const handleTrackInputChange = (field, value) => {
    if (!draftTrack) return;

    setDraftTrack({ ...draftTrack, [field]: value });

    if (field === 'bpm' || field === 'energy') {
      if (value === "") {
        setValidationError("");
        return;
      }
      const parsedValue = parseFloat(value);
      if (!Number.isFinite(parsedValue)) {
        setValidationError("Invalid number");
        return;
      }
      setValidationError("");
      updateTrackMeta(draftTrack.id, { [field]: parsedValue });
    } else {
      setValidationError("");
      updateTrackMeta(draftTrack.id, { [field]: value });
    }
  };
  
  if (!draftBlock && !draftTrack) {
    return (
      <div style={{ padding: 16, color: '#888' }}>
        Select a block or track.
      </div>
    );
  }

  if (draftBlock) {
    return (
      <div style={{ padding: 16 }}>
        <h4>Block</h4>
        <div><strong>Track ID:</strong> {draftBlock.trackId}</div>
        <div style={{ marginTop: 10 }}>
          <label>Start Beat</label>
          <input
            type="text"
            value={String(draftBlock.startBeat ?? '')}
            onChange={(e) => handleBlockInputChange('startBeat', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Length (Beats)</label>
          <input
            type="text"
            value={String(draftBlock.lengthBeats ?? '')}
            onChange={(e) => handleBlockInputChange('lengthBeats', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Transition</label>
          <select
            value={draftBlock.transition || 'cut'}
            onChange={(e) => handleBlockInputChange('transition', e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="cut">Cut</option>
            <option value="fade">Fade</option>
            <option value="crossfade">Crossfade</option>
          </select>
        </div>
        {validationError && <div style={{ color: 'red', marginTop: 10, fontSize: 12 }}>{validationError}</div>}
      </div>
    );
  }

  if (draftTrack) {
    return (
      <div style={{ padding: 16 }}>
        <h4>Track</h4>
        <div style={{ marginTop: 10 }}>
          <label>Title</label>
          <input
            type="text"
            value={draftTrack.title}
            onChange={(e) => handleTrackInputChange('title', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Artist</label>
          <input
            type="text"
            value={draftTrack.artist}
            onChange={(e) => handleTrackInputChange('artist', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>BPM</label>
          <input
            type="text"
            value={String(draftTrack.bpm ?? '')}
            onChange={(e) => handleTrackInputChange('bpm', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Key</label>
          <input
            type="text"
            value={draftTrack.key}
            onChange={(e) => handleTrackInputChange('key', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div style={{ marginTop: 10 }}>
          <label>Energy</label>
          <input
            type="text"
            value={String(draftTrack.energy ?? '')}
            onChange={(e) => handleTrackInputChange('energy', e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
         {validationError && <div style={{ color: 'red', marginTop: 10, fontSize: 12 }}>{validationError}</div>}
      </div>
    );
  }
  return null;
}
