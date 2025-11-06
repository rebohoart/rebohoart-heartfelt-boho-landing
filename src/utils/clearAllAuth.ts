/**
 * Utility to clear all authentication and session data for localhost development
 *
 * Usage in browser console:
 * ```javascript
 * // Clear all auth data
 * localStorage.clear();
 * sessionStorage.clear();
 * location.reload();
 * ```
 */

export const clearAllAuthData = () => {
  console.log('🧹 Starting complete auth data cleanup...');

  // List all keys before clearing
  console.log('📋 Current localStorage keys:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      console.log(`  - ${key}: ${localStorage.getItem(key)?.substring(0, 50)}...`);
    }
  }

  // Clear specific known keys
  const knownKeys = [
    'mock_admin_session',
    'rebohoart-cart',
  ];

  knownKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`✅ Removed: ${key}`);
    }
  });

  // Clear all Supabase-related keys
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`✅ Removed Supabase key: ${key}`);
  });

  // Clear session storage as well
  sessionStorage.clear();
  console.log('✅ SessionStorage cleared');

  console.log('🎉 Auth data cleanup complete!');
  console.log('💡 Reload the page to see changes: location.reload()');

  return {
    removed: [...knownKeys, ...keysToRemove],
    timestamp: new Date().toISOString()
  };
};

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).clearAllAuth = clearAllAuthData;
  console.log('💡 Utility loaded! Use window.clearAllAuth() to clear all auth data');
}
