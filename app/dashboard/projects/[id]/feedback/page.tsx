'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { FeedbackWithLabels, FeedbackType } from '@/types/feedback';
import FeedbackItem from '@/components/feedback/feedback-item';

interface FeedbackPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ITEMS_PER_PAGE = 15;

export default function FeedbackPage({ params }: FeedbackPageProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');
  const [feedback, setFeedback] = useState<FeedbackWithLabels[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<FeedbackWithLabels[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FeedbackType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchFeedback = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/projects/${id}/feedback`);
      if (response.ok) {
        const data = await response.json();
        setFeedback(data);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    params.then(p => {
      setProjectId(p.id);
      fetchFeedback(p.id);
    });
  }, [params, fetchFeedback]);

  useEffect(() => {
    // Apply filter
    if (activeFilter === 'all') {
      setFilteredFeedback(feedback);
    } else {
      setFilteredFeedback(feedback.filter(f => f.type === activeFilter));
    }
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activeFilter, feedback]);

  const handleLabelAdded = () => {
    fetchFeedback(projectId);
  };

  const handleLabelRemoved = () => {
    fetchFeedback(projectId);
  };

  // Pagination
  const totalPages = Math.ceil(filteredFeedback.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFeedback = filteredFeedback.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Get counts for filter buttons
  const counts = {
    all: feedback.length,
    bug: feedback.filter(f => f.type === 'bug').length,
    feature: feedback.filter(f => f.type === 'feature').length,
    other: feedback.filter(f => f.type === 'other').length,
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="text-gray-600 mt-4">Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <button
        onClick={() => router.push(`/dashboard/projects/${projectId}`)}
        className="text-gray-600 hover:text-gray-900 mb-6 flex items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Project
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1">
          {counts.all} total feedback items
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({counts.all})
        </button>
        <button
          onClick={() => setActiveFilter('bug')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'bug'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🐛 Bugs ({counts.bug})
        </button>
        <button
          onClick={() => setActiveFilter('feature')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'feature'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✨ Features ({counts.feature})
        </button>
        <button
          onClick={() => setActiveFilter('other')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeFilter === 'other'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          💬 Other ({counts.other})
        </button>
      </div>

      {/* Feedback List */}
      {currentFeedback.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No feedback yet
          </h3>
          <p className="text-gray-600">
            {activeFilter === 'all'
              ? 'Feedback will appear here once users submit it through your widget'
              : `No ${activeFilter} feedback found`}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {currentFeedback.map((item) => (
              <FeedbackItem
                key={item.id}
                feedback={item}
                onLabelAdded={handleLabelAdded}
                onLabelRemoved={handleLabelRemoved}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first, last, current, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;

                  if (!showPage && page === 2) {
                    return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
                  }
                  if (!showPage && page === totalPages - 1) {
                    return <span key={page} className="px-2 py-2 text-gray-400">...</span>;
                  }
                  if (!showPage) {
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {/* Page info */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredFeedback.length)} of {filteredFeedback.length} items
          </p>
        </>
      )}
    </div>
  );
}
