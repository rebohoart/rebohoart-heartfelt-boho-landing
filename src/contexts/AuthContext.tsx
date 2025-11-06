import { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin credentials for localhost development
const MOCK_ADMIN_EMAIL = "admin@localhost.com";
const MOCK_ADMIN_PASSWORD = "admin123";

// Check if we're running on localhost
const isLocalhost = () => {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1' ||
         window.location.hostname === '::1';
};

// Mock user object for local development
const createMockUser = (): User => ({
  id: 'mock-admin-id',
  email: MOCK_ADMIN_EMAIL,
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔐 AuthContext initializing...');

    // Check for mock session in localhost
    if (isLocalhost()) {
      const mockSession = localStorage.getItem('mock_admin_session');
      if (mockSession) {
        console.log('✅ Mock admin session found in localStorage');
        const mockUser = createMockUser();
        setUser(mockUser);
        setIsAdmin(true);
        setLoading(false);
        return;
      }
    }

    // Set a safety timeout to prevent infinite loading state
    // This timeout is ONLY for cases where Supabase never responds at all
    const safetyTimeout = setTimeout(() => {
      console.warn('⚠️ Auth initialization timeout - forcing loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout

    // Track if we've received any response from Supabase to avoid timeout false positives
    let hasReceivedAuthResponse = false;

    // Check for existing session first
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Clear timeout immediately when we get a response from Supabase
      if (!hasReceivedAuthResponse) {
        hasReceivedAuthResponse = true;
        clearTimeout(safetyTimeout);
      }

      if (error) {
        console.error('❌ Error getting session:', error);
        setLoading(false);
        return;
      }

      console.log('✅ Session retrieved:', session?.user?.email || 'No session');
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        checkAdminStatus(session.user.id);
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('❌ Unexpected error during session retrieval:', error);
      if (!hasReceivedAuthResponse) {
        hasReceivedAuthResponse = true;
        clearTimeout(safetyTimeout);
      }
      setLoading(false);
    });

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Clear timeout as soon as we get an auth state change
        if (!hasReceivedAuthResponse) {
          hasReceivedAuthResponse = true;
          clearTimeout(safetyTimeout);
        }

        console.log('🔔 Auth state changed:', event, session?.user?.email || 'No user');
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkAdminStatus(session.user.id);
        } else {
          setIsAdmin(false);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🔌 AuthContext cleanup');
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const checkAdminStatus = async (userId: string) => {
    console.log('🔍 Checking admin status for user:', userId);

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking admin status:', error);
        // If there's an error checking admin status, assume not admin but don't fail auth
        setIsAdmin(false);
      } else {
        console.log('✅ Admin check result:', data ? 'Is admin' : 'Not admin');
        setIsAdmin(!!data);
      }
    } catch (error) {
      console.error('❌ Unexpected error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('📧 SignIn called with email:', email);

    // Mock authentication for localhost
    if (isLocalhost() && email === MOCK_ADMIN_EMAIL && password === MOCK_ADMIN_PASSWORD) {
      console.log('✅ Mock admin login successful');
      const mockUser = createMockUser();
      setUser(mockUser);
      setIsAdmin(true);
      localStorage.setItem('mock_admin_session', 'true');
      return { error: null };
    }

    console.log('🔑 Password length:', password.length);
    console.log('🔑 Password characters breakdown:', {
      hasSpaces: password.includes(' '),
      hasNewlines: password.includes('\n'),
      hasCarriageReturn: password.includes('\r'),
      hasTab: password.includes('\t'),
      startsWithSpace: password.startsWith(' '),
      endsWithSpace: password.endsWith(' '),
      charCodes: Array.from(password).map(c => c.charCodeAt(0))
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('🚨 Supabase auth error:', error);
      console.error('Error code:', error.status);
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error object:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Supabase auth successful, user:', data.user?.email);
    }

    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    
    return { error };
  };

  const signOut = async () => {
    console.log('🔓 SignOut called');

    // Clear mock session if on localhost
    if (isLocalhost()) {
      localStorage.removeItem('mock_admin_session');
      console.log('🔓 Mock admin session cleared');
    }

    // Clear cart data
    localStorage.removeItem('rebohoart-cart');
    console.log('🛒 Cart data cleared');

    // Clear state first to prevent any race conditions
    setUser(null);
    setSession(null);
    setIsAdmin(false);

    // Sign out from Supabase (this clears localStorage and cookies)
    try {
      await supabase.auth.signOut();
      console.log('✅ Supabase signOut completed');
    } catch (error) {
      console.error('❌ Error during signOut:', error);
    }

    // Clear all Supabase-related localStorage keys
    if (isLocalhost()) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed localStorage key: ${key}`);
      });
    }

    navigate('/auth');
  };

  const updatePassword = async (newPassword: string) => {
    console.log('🔑 updatePassword called, password length:', newPassword.length);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ updateUser failed:', error);
      } else {
        console.log('✅ updateUser successful, user:', data.user?.email);
      }

      return { error };
    } catch (err) {
      console.error('❌ Exception in updatePassword:', err);
      // Return error in expected format
      return { error: err as AuthError };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, session, isAdmin, loading, signIn, signUp, signOut, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
