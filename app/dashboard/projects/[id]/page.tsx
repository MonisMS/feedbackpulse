'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Project } from '@/types/project';
import { generateEmbedScript } from '@/lib/project-utils';

interface ProjectDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailsPage({ params }: ProjectDetailsPageProps) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    params.then(p => {
      setProjectId(p.id);
      fetchProjectDetails(p.id);
    });
  }, [params]);

  const fetchProjectDetails = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
        setEditName(data.name);
        // TODO: Fetch feedback count when feedback API is ready
        setFeedbackCount(0);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmbed = async () => {
    if (!project) return;
    try {
      const embedScript = generateEmbedScript(project.projectKey);
      await navigator.clipboard.writeText(embedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleUpdateName = async () => {
    if (!project || !editName.trim()) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        setProject(updatedProject);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Failed to update project:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete "${project.name}"? This will also delete all associated feedback.`
    );
    
    if (!confirmed) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-gray-600 mt-4">Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Project not found</p>
      </div>
    );
  }

  const embedScript = generateEmbedScript(project.projectKey);

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => router.push('/dashboard')}
        className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Dashboard
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="text-2xl font-bold text-gray-900 border border-gray-300 rounded px-2 py-1 flex-1"
                  disabled={saving}
                />
                <button
                  onClick={handleUpdateName}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditName(project.name);
                  }}
                  disabled={saving}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            )}
            <p className="text-sm text-gray-600 mt-2">
              Created on {new Date(project.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Project'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Project Key</p>
            <p className="text-lg font-mono font-semibold text-gray-900">{project.projectKey}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => router.push(`/dashboard/projects/${projectId}/feedback`)}>
            <p className="text-sm text-gray-600 mb-1">Total Feedback</p>
            <p className="text-lg font-semibold text-gray-900">{feedbackCount}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => router.push(`/dashboard/projects/${projectId}/feedback`)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            View All Feedback
          </button>
        </div>
      </div>

      {/* Embed Code Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Embed Code</h2>
        <p className="text-sm text-gray-700 mb-4">
          Copy and paste this code into your website&apos;s HTML, just before the closing{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">&lt;/body&gt;</code> tag:
        </p>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{embedScript}</code>
          </pre>
          <button
            onClick={handleCopyEmbed}
            className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Paste the script into your website</li>
            <li>• The feedback widget will automatically appear for your visitors</li>
            <li>• All feedback will be linked to this project using the project key</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
