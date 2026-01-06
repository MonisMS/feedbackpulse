'use client';

import { useState } from 'react';

interface LabelManagerProps {
  feedbackId: number;
  onLabelAdded: () => void;
  onCancel: () => void;
}

export default function LabelManager({ feedbackId, onLabelAdded, onCancel }: LabelManagerProps) {
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!label.trim()) {
      setError('Label cannot be empty');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/feedback/${feedbackId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: label.trim() }),
      });

      if (response.ok) {
        onLabelAdded();
        setLabel('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add label');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-flex items-center gap-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Enter label..."
        className="px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        autoFocus
        disabled={saving}
      />
      <button
        type="submit"
        disabled={saving}
        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
      >
        {saving ? 'Adding...' : 'Add'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
      >
        Cancel
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </form>
  );
}
