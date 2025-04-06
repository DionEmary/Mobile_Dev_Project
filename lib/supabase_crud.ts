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

export const checkAutoDeleteTasks = async (userId: string) => {
  if (!userId) return;

  try {
    const { data: settings, error: settingsError } = await supabase
      .from('user_details')
      .select('autoDelete, autoDeleteDays')
      .eq('uuid', userId)
      .single();

    if (settingsError) {
      console.error('Error fetching user settings:', settingsError.message);
      return;
    }

    const { autoDelete, autoDeleteDays } = settings;

    if (autoDelete) {
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('taskID, dueDate')
        .eq('uuid', userId);

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError.message);
        return;
      }

      const currentDate = new Date();
      const deleteDateThreshold = new Date();
      deleteDateThreshold.setDate(currentDate.getDate() - autoDeleteDays);

      tasks.forEach(async (task) => {
        const taskDueDate = new Date(task.dueDate);

        if (taskDueDate < deleteDateThreshold) {
          // Delete related notifications
          const { error: notifDeleteError } = await supabase
            .from('task_notifications')
            .delete()
            .eq('taskID', task.taskID);

          if (notifDeleteError) {
            console.error(`Error deleting notifications for task ${task.taskID}:`, notifDeleteError.message);
            return;
          }

          // Delete the task itself
          const { error: deleteError } = await supabase
            .from('tasks')
            .delete()
            .eq('taskID', task.taskID);

          if (deleteError) {
            console.error(`Error deleting task ${task.taskID}:`, deleteError.message);
          }
        }
      });
    }
  } catch (error) {
    console.error('Error checking auto-delete tasks:', error);
  }
};

export async function getTasksByUUID(uuid: string) {
  try {
      const { data, error } = await supabase
          .from("tasks")
          .select("taskID, taskCategory, taskName, dueDate, completed")
          .eq("uuid", uuid);

      if (error) {
          throw new Error(error.message);
      }

      return data;
  } catch (error) {
      console.error("Error fetching tasks:", error);
      return [];
  }
}

export const updateUserGoal = async (uuid: string, goal: string | null) => {
  try {
      const { data, error } = await supabase
          .from('user_details')
          .update({ userGoal: goal })
          .eq('uuid', uuid);

      if (error) {
          console.error("Error updating user goal:", error.message);
          return null;
      }
      return data;
  } catch (error) {
      console.error("Error updating user goal:", error);
      return null;
  }
};

export const getIncompleteTasks = async (uuid: string) => {
  try {
      const { data, error } = await supabase
          .from("tasks")
          .select("taskID, taskCategory, taskName, dueDate")
          .eq("uuid", uuid)
          .eq("completed", false);

      if (error) {
          console.error("Error fetching incomplete tasks:", error.message);
          return [];
      }

      return data.sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
  } catch (error) {
      console.error("Unexpected error fetching tasks:", error);
      return [];
  }
};

export const fetchTaskById = async (taskId: string) => {
  const { data, error } = await supabase
    .from('tasks')
    .select('taskID, taskCategory, taskName, dueDate, completed')
    .eq('taskID', taskId)
    .single();

  if (error) throw error;
  return data;
};

export const fetchTaskNotifications = async (taskId: string) => {
  const { data, error } = await supabase
    .from('task_notifications')
    .select('notificationID, notificationTime, taskID')
    .eq('taskID', taskId);

  if (error) throw error;
  return data;
};

// Update task
export const updateTaskById = async (taskId: string, updatedTask: any) => {
  const { error } = await supabase
    .from('tasks')
    .update(updatedTask)
    .eq('taskID', taskId);

  if (error) throw error;
};

export const updateTaskNotifications = async (
  notifications: any[],
  timeDifference: number
) => {
  for (const notification of notifications) {
    const oldNotificationTime = new Date(notification.notificationTime);
    const updatedNotifyTime = new Date(oldNotificationTime.getTime() + timeDifference);

    const { error } = await supabase
      .from('task_notifications')
      .update({ notificationTime: updatedNotifyTime.toISOString() })
      .eq('notificationID', notification.notificationID);

    if (error) throw error;
  }
};

export const deleteTaskAndNotifications = async (taskId: string) => {
  const { error: notificationError } = await supabase
    .from('task_notifications')
    .delete()
    .eq('taskID', taskId);
  if (notificationError) throw notificationError;

  const { error: taskError } = await supabase
    .from('tasks')
    .delete()
    .eq('taskID', taskId);
  if (taskError) throw taskError;
};
