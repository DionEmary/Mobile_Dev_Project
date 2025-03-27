import supabase from './supabase';

export async function signUp(email: string, password: string, firstName: string, lastName: string) {
    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        const { user } = data;
        if (user) {
            const { error: insertError } = await supabase
                .from('user_details')
                .insert([
                    {
                        uuid: user.id,  // User UUID from Supabase auth
                        firstName: firstName,
                        lastName: lastName,
                        email: user.email,
                    },
                ]);

            if (insertError) throw insertError;
        }

        return data.user;
    }
    catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
}

// Does not need Email verification for now
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
