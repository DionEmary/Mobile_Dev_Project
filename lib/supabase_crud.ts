import supabase from './supabase';

export async function signUpUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data?.user) {
        throw new Error('Error signing up');
      }

      const user = data.user;
  
      // After creating the user, you can insert the user's details
      const { error: insertError } = await supabase
        .from('user_details')
        .insert([
          {
            uuid: user.id,
            firstName,
            lastName,
            email,
          },
        ]);
  
      if (insertError) {
        throw new Error('Error inserting user details');
      }
  
      return data.user;
    } catch (error) {
      console.error('Error signing up user:', error);
      throw error;
    }
  }
  
  // Sign In Function
  export async function signInUser(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data?.user) {
        throw new Error('Invalid credentials');
      }
  
      return data.user;
    } catch (error) {
      console.error('Error signing in user:', error);
      throw error;
    }
  }

export async function getUserDetails() {
    try {
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        if (authError || !authUser?.user) {
            throw new Error('Error fetching authenticated user');
        }

        const userId = authUser.user.id;
        const { data: userDetails, error: userDetailsError } = await supabase
            .from('user_details')
            .select('firstName, lastName, email, userNote, userGoal, autoDelete, autoDeleteDays')
            .eq('uuid', userId)
            .single();

        if (userDetailsError) {
            throw new Error('Error fetching user details');
        }

        return { ...userDetails, uuid: userId };
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

        const { data, error } = await supabase.from('task_notifications').insert(notifications).select();

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

export const updateUserNote = async (uuid: string, newNote: string) => {
    const { data, error } = await supabase
        .from('user_details')
        .update({ userNote: newNote })
        .eq('uuid', uuid);

    if (error) {
        throw error;
    }

    return data;
};

export const updateUserDetails = async (uuid: string, firstName: string, lastName: string) => {
    const { data, error } = await supabase
        .from('user_details')
        .update({ firstName, lastName })
        .eq('uuid', uuid);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const updateAutoDeleteSetting = async (uuid: string, autoDelete: boolean) => {
    const { data, error } = await supabase
        .from('user_details')
        .update({ autoDelete })
        .eq('uuid', uuid);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const updateAutoDeleteDays = async (uuid: string, autoDeleteDays: number) => {
    const { data, error } = await supabase
        .from('user_details')
        .update({ autoDeleteDays })
        .eq('uuid', uuid);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};