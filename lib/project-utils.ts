import crypto from 'crypto';

/**
 * Generates a unique alphanumeric project key
 * Format: 8 characters (uppercase letters and numbers)
 * Example: K7MP9XL2
 */
export function generateProjectKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 8;
  const bytes = crypto.randomBytes(length);
  
  let key = '';
  for (let i = 0; i < length; i++) {
    key += chars[bytes[i] % chars.length];
  }
  
  return key;
}

/**
 * Generates the embed script snippet for a project
 * This script will be copied by users and pasted into their website
 */
export function generateEmbedScript(projectKey: string, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || 'https://feedbackpulse-sepia.vercel.app'): string {
  return `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${baseUrl}/api/widget';
    script.dataset.projectKey = '${projectKey}';
    script.dataset.apiUrl = '${baseUrl}';
    document.head.appendChild(script);
  })();
</script>`;
}
