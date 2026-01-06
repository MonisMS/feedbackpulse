'use client';

import { useState } from 'react';
import type { FeedbackWithLabels } from '@/types/feedback';
import LabelManager from './label-manager';

interface FeedbackItemProps {
  feedback: FeedbackWithLabels;
  onLabelAdded: () => void;
  onLabelRemoved: () => void;
}

export default function FeedbackItem({ feedback, onLabelAdded, onLabelRemoved }: FeedbackItemProps) {
  const [showLabelInput, setShowLabelInput] = useState(false);

  const typeConfig = {
    bug: { color: 'bg-red-100 text-red-700 border-red-200', icon: '🐛', label: 'Bug' },
    feature: { color: 'bg-green-100 text-green-700 border-green-200', icon: '✨', label: 'Feature' },
    other: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '💬', label: 'Other' },
  };

  const config = typeConfig[feedback.type as keyof typeof typeConfig] || typeConfig.other;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold border ${config.color}`}>
              {config.icon} {config.label}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <p className="text-gray-900 whitespace-pre-wrap">{feedback.message}</p>

          {(feedback.userName || feedback.userEmail) && (
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
              {feedback.userName && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {feedback.userName}
                </div>
              )}
              {feedback.userEmail && (
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {feedback.userEmail}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Labels Section */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Labels:</span>
          
          {feedback.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
            >
              {label.label}
              <button
                onClick={() => handleRemoveLabel(label.id)}
                className="hover:text-blue-900 ml-1"
                aria-label="Remove label"
              >
                ×
              </button>
            </span>
          ))}

          {showLabelInput ? (
            <LabelManager
              feedbackId={feedback.id}
              onLabelAdded={() => {
                setShowLabelInput(false);
                onLabelAdded();
              }}
              onCancel={() => setShowLabelInput(false)}
            />
          ) : (
            <button
              onClick={() => setShowLabelInput(true)}
              className="px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
            >
              + Add Label
            </button>
          )}
        </div>
      </div>
    </div>
  );

  async function handleRemoveLabel(labelId: number) {
    try {
      const response = await fetch(`/api/feedback/${feedback.id}/labels/${labelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        onLabelRemoved();
      }
    } catch (error) {
      console.error('Failed to remove label:', error);
    }
  }
}
