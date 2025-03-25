import supabase from './supabase';

export async function signUp(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        return data.user;
    }
    catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

export async function signIn(email: string, password: string) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        return data.user;
    }
    catch (error) {
        console.error('Error signing in:', error);
        throw error;
    }
}

export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return 'Signed out successfully';
    }
    catch (error) {
        console.error('Error signing out:', error);
        throw error;
    }
}
