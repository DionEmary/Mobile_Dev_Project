import supabase from './supabase';

// Recieves needed data to create user, sends email and password to supabase auth table then the name, email and uuid to the user_details table
export async function signUpUser(email: string, password: string, firstName: string, lastName: string) {
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

// Signs in the user with the email and password, returns the user object if successful
// Does not need Email verification
export async function signInUser(email: string, password: string) {
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

// Signs the user out of the app and returns a success message used in the profile page for a alert
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
