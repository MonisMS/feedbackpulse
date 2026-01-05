'use client';

import { useState } from 'react';
import { generateEmbedScript } from '@/lib/project-utils';

interface EmbedCodeDisplayProps {
  projectKey: string;
  projectName: string;
  onClose: () => void;
}

export default function EmbedCodeDisplay({ projectKey, projectName, onClose }: EmbedCodeDisplayProps) {
  const [copied, setCopied] = useState(false);
  const embedScript = generateEmbedScript(projectKey);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Embed Code</h2>
              <p className="text-sm text-gray-600 mt-1">{projectName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-700 mb-3">
              Copy and paste this code into your website&apos;s HTML, just before the closing <code className="bg-gray-100 px-1 rounded">&lt;/body&gt;</code> tag:
            </p>
            
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{embedScript}</code>
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">Project Key</h3>
            <code className="text-sm font-mono bg-white px-3 py-1.5 rounded border border-blue-300 text-blue-700">
              {projectKey}
            </code>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
