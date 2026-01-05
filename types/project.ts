export interface Project {
  id: number;
  userId: number;
  name: string;
  projectKey: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
}

export interface CreateProjectResponse {
  id: number;
  name: string;
  projectKey: string;
  embedScript: string;
  createdAt: Date;
}

export interface ProjectWithStats extends Project {
  feedbackCount?: number;
}
