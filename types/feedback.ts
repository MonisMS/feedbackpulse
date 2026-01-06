export interface Feedback {
  id: number;
  projectId: number;
  type: string;
  message: string;
  userEmail: string | null;
  userName: string | null;
  sentiment: string | null;
  createdAt: Date;
}

export interface FeedbackLabel {
  id: number;
  feedbackId: number;
  label: string;
  createdAt: Date;
}

export interface FeedbackWithLabels extends Feedback {
  labels: FeedbackLabel[];
}

export interface AddLabelRequest {
  label: string;
}

export type FeedbackType = 'bug' | 'feature' | 'other' | 'all';
