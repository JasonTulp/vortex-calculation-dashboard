
// Global column blacklist for debug-only columns
export const GLOBAL_COLUMN_BLACKLIST = [
  'currentEraIndex',
  'submitted',
  'verified',
  'registerPointsOnChain',
  'calculationComplete',
  'calculateWorkPoint',
  'timestamp',
  'signature',
  'finished',
  "__v"
];

// Helper function to check if a column should be hidden
// If we are in debug mode, show all columns
export const shouldHideColumn = (columnKey: string, sectionBlacklist: string[] = []): boolean => {
  console.log("DEBUG_LEVEL is:", process.env.NEXT_PUBLIC_DEBUG_LEVEL);
  if (process.env.NEXT_PUBLIC_DEBUG_LEVEL === "debug") return false;
  return GLOBAL_COLUMN_BLACKLIST.includes(columnKey) || sectionBlacklist.includes(columnKey);
}; 