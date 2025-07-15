/**
 * Utility functions for formatting text displayed in the UI
 */

/**
 * Formats strings with underscores to be more readable in the UI
 * Examples:
 * - "MULTIPLE_CHOICE" -> "Multiple Choice"
 * - "OPEN_ENDED" -> "Open Ended"
 * - "ORGANIZATION_ADMIN" -> "Organization Admin"
 * - "SUPER_ADMIN" -> "Super Admin"
 */
export function formatDisplayText(text: string): string {
  if (!text) return text;
  
  return text
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formats question types specifically for display
 */
export function formatQuestionType(type: "MULTIPLE_CHOICE" | "OPEN_ENDED"): string {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "Multiple Choice";
    case "OPEN_ENDED":
      return "Open Ended";
    default:
      return formatDisplayText(type);
  }
}

/**
 * Formats user roles specifically for display
 */
export function formatUserRole(role: string): string {
  switch (role) {
    case "ORGANIZATION_ADMIN":
      return "Organization Admin";
    case "SUPER_ADMIN":
      return "Super Admin";
    case "USER":
      return "User";
    default:
      return formatDisplayText(role);
  }
}