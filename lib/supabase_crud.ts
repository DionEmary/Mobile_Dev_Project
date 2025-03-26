import supabase from './supabase';

export async function getUserDetails() {
    try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser?.user) {
            throw new Error('Error fetching authenticated user');
        }

        const userId = authUser.user.id;
        const { data: userDetails, error: userDetailsError } = await supabase
            .from('user_details')
            .select('firstName, lastName, email')
            .eq('uuid', userId)
            .single();

        if (userDetailsError) {
            throw new Error('Error fetching user details');
        }

        return userDetails;
    } catch (error) {
        console.error(error);
        return null;
    }
}