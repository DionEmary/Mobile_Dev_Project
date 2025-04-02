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

        return {...userDetails, uuid: userId};
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function insertTask(task: {
    taskCategory: string;
    taskName: string;
    uuid: string;
    dueDate: string;
}) {
    try {
        const { data, error } = await supabase.from('tasks').insert([task]).select();
        if (error) {
            return null;
        }
        return data;
    } catch (error) {
        console.error('Unexpected error inserting task:', error);
        return null;
    }
}

export async function insertNotifications(taskID: number, notificationDates: Date[]) {
    try {

        const notifications = notificationDates.map((date) => ({
            taskID: taskID,
            notificationTime: date.toISOString(),
        }));

        console.log("Notifications Payload:", notifications);

        const { data, error } = await supabase.from('tasknotifications').insert(notifications).select();

        if (error) {
            console.error('Error inserting notifications:', error.message);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Unexpected error inserting notifications:', error);
        return null;
    }
}