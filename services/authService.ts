import { supabase } from './supabaseClient';

export interface User {
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
  id: string;
}

class AuthService {
  async login(email: string, pass: string): Promise<User> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (data.user && data.user.email) {
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'Usuario',
        role: 'ADMIN' // Default role for demo purposes
      };
    }
    
    throw new Error('Error al iniciar sesión');
  }

  async signUp(email: string, pass: string): Promise<User> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: {
          name: email.split('@')[0]
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Check if user was created but session is null (requires email confirmation)
    if (data.user && !data.session) {
       throw new Error('Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta antes de iniciar sesión.');
    }

    if (data.user && data.user.email) {
      return {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || 'Usuario',
        role: 'ADMIN'
      };
    }

    throw new Error('Error en el registro');
  }

  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user?.email) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name || 'Usuario',
        role: 'ADMIN'
      };
    }
    return null;
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password', 
    });
    
    if (error) {
      throw new Error(error.message);
    }
  }
}

export const authService = new AuthService();