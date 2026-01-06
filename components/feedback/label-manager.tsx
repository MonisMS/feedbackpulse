'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addLabelSchema, type AddLabelFormData } from '@/lib/validations';
import { useState } from 'react';
import { useToast } from '@/components/providers/toast-provider';

interface LabelManagerProps {
  feedbackId: number;
  onLabelAdded: () => void;
  onCancel: () => void;
}

export default function LabelManager({ feedbackId, onLabelAdded, onCancel }: LabelManagerProps) {
  const [apiError, setApiError] = useState('');
  const { showSuccess, showError } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AddLabelFormData>({
    resolver: zodResolver(addLabelSchema),
  });

  const onSubmit = async (data: AddLabelFormData) => {
    setApiError('');

    try {
      const response = await fetch(`/api/feedback/${feedbackId}/labels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        showSuccess('Label added successfully!');
        onLabelAdded();
      } else {
        const result = await response.json();
        const errorMsg = result.error || 'Failed to add label';
        setApiError(errorMsg);
        showError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'An error occurred';
      setApiError(errorMsg);
      showError(errorMsg);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="inline-flex items-center gap-2">
      <div className="inline-block">
        <input
          type="text"
          {...register('label')}
          placeholder="Enter label..."
          className={`px-2 py-1 border rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            errors.label ? 'border-red-300' : 'border-gray-300'
          }`}
          autoFocus
          disabled={isSubmitting}
        />
        {errors.label && (
          <p className="text-xs text-red-600 mt-1">{errors.label.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Adding...' : 'Add'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-medium transition-colors"
      >
        Cancel
      </button>
      {apiError && <span className="text-xs text-red-600">{apiError}</span>}
    </form>
  );
}
