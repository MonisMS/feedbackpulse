'use client';

import Link from 'next/link';
import type { Project } from '@/types/project';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/dashboard/projects/${project.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs font-medium text-gray-500 uppercase">
            Project Key
          </label>
          <div className="mt-1 flex items-center gap-2">
            <code className="text-sm font-mono bg-gray-100 px-3 py-1 rounded text-gray-800">
              {project.projectKey}
            </code>
          </div>
        </div>

        <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
          View Details
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
