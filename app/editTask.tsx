import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import supabase from '../lib/supabase';
import { Icon } from "@rneui/base";

const EditTask = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();

  const [task, setTask] = useState<any>(null); 
  const [loading, setLoading] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails(Array.isArray(taskId) ? taskId[0] : taskId);
      fetchNotifications(Array.isArray(taskId) ? taskId[0] : taskId);
    }
  }, [taskId]);

  const fetchTaskDetails = async (taskId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('taskID, taskCategory, taskName, dueDate')
        .eq('taskID', taskId)
        .single();

      if (error) {
        throw error;
      }

      setTask(data);
      if (data.dueDate) {
        const dueDate = new Date(data.dueDate);
        setDate(dueDate);
        setTime(dueDate);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    }
    setLoading(false);
  };

  const fetchNotifications = async (taskId: string) => {
    try {
      const { data, error } = await supabase
        .from('task_notifications')
        .select('notificationID, notificationTime, taskID')
        .eq('taskID', taskId);

      if (error) throw error;
      console.log('Notifications:', data);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!task) return;
    setLoading(true);
  
    try {
      const oldDueDate = new Date(task.dueDate); // Store the original due date
      const newDueDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

      // Gets the difference in time between the old and new due dates
      // This is used to update the notification times
      const timeDifference = newDueDate.getTime() - oldDueDate.getTime();
      console.log("Time Difference:", timeDifference);
  
      // Update Task
      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          taskCategory: task.taskCategory,
          taskName: task.taskName,
          dueDate: newDueDate.toISOString(),
        })
        .eq('taskID', taskId);
  
      if (taskError) {
        console.error("Error updating task:", taskError);
        throw taskError;
      }
  
      // Update Notifications
      for (const notification of notifications) {
        console.log("Notification", notification);

        const oldNotificationTime = new Date(notification.notificationTime);
        const updatedNotifyTime = new Date(oldNotificationTime.getTime() + timeDifference);
        console.log("Old Notification Time:", oldNotificationTime);
        console.log("Updated Notification Time:", updatedNotifyTime);
  
        const { error: notificationError } = await supabase
          .from('task_notifications') // Make sure the table name is correct
          .update({ notificationTime: updatedNotifyTime.toISOString() })
          .eq('notificationID', notification.notificationID); // Use the correct ID
  
        if (notificationError) {
          console.error("Error updating notification:", notificationError);
          throw notificationError;
        }
      }
  
      // If everything goes well, navigate back
      router.push('/taskList');
    } catch (error) {
      console.error("Error updating task or notifications:", error);
    }
  
    setLoading(false);
  };

  if (loading || !task) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backButton}>
          <Icon name="arrow-back" type="material" size={28} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Edit Task</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Task Category:</Text>
        <TextInput
          value={task.taskCategory}
          onChangeText={(text) => setTask({ ...task, taskCategory: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Task Name:</Text>
        <TextInput
          value={task.taskName}
          onChangeText={(text) => setTask({ ...task, taskName: text })}
          style={styles.input}
        />

        <Text style={styles.label}>Due Date:</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.button}>
          <Text style={styles.buttonText}>Pick a Date</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}
        <Text style={styles.dateText}>Set to: {date.toDateString()}</Text>

        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.button}>
          <Text style={styles.buttonText}>Pick a Time</Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setTime(selectedTime);
            }}
          />
        )}
        <Text style={styles.dateText}>Set to: {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</Text>

        <Button title="Save Changes" onPress={handleSaveChanges} disabled={loading} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C567D',
    paddingBottom: 0,
    paddingTop: 45,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 12,
    borderRadius: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    flex: 1,
    marginRight: 55,
  },
  content: {
    padding: 20,
    width: '100%',
    marginTop: '25%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 16,
    borderRadius: 5,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#6C567D',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    marginBottom: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default EditTask;
