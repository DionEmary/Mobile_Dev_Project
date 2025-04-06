import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import supabase from '../lib/supabase';
import { Icon } from '@rneui/base';

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
      const id = Array.isArray(taskId) ? taskId[0] : taskId;
      fetchTaskDetails(id);
      fetchNotifications(id);
    }
  }, [taskId]);

  const fetchTaskDetails = async (taskId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('taskID, taskCategory, taskName, dueDate, completed')
        .eq('taskID', taskId)
        .single();

      if (error) throw error;

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
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleSaveChanges = async () => {
    if (!task) return;
    setLoading(true);

    try {
      const oldDueDate = new Date(task.dueDate);
      const newDueDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        time.getHours(),
        time.getMinutes()
      );

      const timeDifference = newDueDate.getTime() - oldDueDate.getTime();

      const { error: taskError } = await supabase
        .from('tasks')
        .update({
          taskCategory: task.taskCategory,
          taskName: task.taskName,
          dueDate: newDueDate.toISOString(),
          completed: task.completed,
        })
        .eq('taskID', taskId);

      if (taskError) throw taskError;

      for (const notification of notifications) {
        const oldNotificationTime = new Date(notification.notificationTime);
        const updatedNotifyTime = new Date(
          oldNotificationTime.getTime() + timeDifference
        );

        const { error: notificationError } = await supabase
          .from('task_notifications')
          .update({ notificationTime: updatedNotifyTime.toISOString() })
          .eq('notificationID', notification.notificationID);

        if (notificationError) throw notificationError;
      }

      Alert.alert('Success', 'Task updated successfully!');
      router.push('/taskList');
    } catch (error) {
      console.error('Error updating task or notifications:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }

    setLoading(false);
  };

  const handleDeleteTask = async () => {
    setLoading(true);
  
    // Show confirmation alert before deleting
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            setLoading(false);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // First, delete the notifications associated with this task
              const { error: notificationError } = await supabase
                .from('task_notifications')
                .delete()
                .eq('taskID', taskId);
  
              if (notificationError) throw notificationError;
  
              // Then, delete the task itself
              const { error: taskError } = await supabase
                .from('tasks')
                .delete()
                .eq('taskID', taskId);
  
              if (taskError) throw taskError;
  
              // Alert the user and navigate back to the home page
              Alert.alert('Success', 'Task deleted successfully!');
              router.push('/'); // This will redirect to the home page
  
            } catch (error) {
              console.error('Error deleting task or notifications:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
  
            setLoading(false);
          },
        },
      ],
      { cancelable: true }
    );
  };
  
  

  if (loading || !task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C567D" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.sideSpacer}>
          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.backButton}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Icon name="arrow-back" type="material" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>
    
        <Text style={styles.headerText}>Edit Task</Text>
    
      <View style={styles.sideSpacer} />
    </View>

      <View style={styles.content}>
        <Text style={styles.label}>Task Category:</Text>
        <TextInput
          value={task.taskCategory}
          onChangeText={(text) => setTask({ ...task, taskCategory: text })}
          style={styles.input}
          placeholder="Enter task category"
          autoCorrect={false}
        />

        <Text style={styles.label}>Task Name:</Text>
        <TextInput
          value={task.taskName}
          onChangeText={(text) => setTask({ ...task, taskName: text })}
          style={styles.input}
          placeholder="Enter task name"
          autoCorrect={false}
        />

        <Text style={styles.label}>Due Date:</Text>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.button}
        >
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

        <TouchableOpacity
          onPress={() => setShowTimePicker(true)}
          style={styles.button}
        >
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

        <View style={styles.previewBox}>
          <Text style={styles.previewText}>{date.toDateString()}</Text>
          <Text style={styles.previewText}>
            {time.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Completed:</Text>
          <Switch
            value={task.completed}
            onValueChange={(value) =>
              setTask({ ...task, completed: value })
            }
            trackColor={{ false: '#ccc', true: 'green' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteButton}>
          <Icon name="trash" type="feather" color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveChanges} style={styles.saveButton}>
          <Icon name="save" type="feather" color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100, // Slightly larger height for better spacing
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6C567D',
    paddingHorizontal: 20,
    elevation: 3,
    justifyContent: 'center', // Ensures the header text is centered
  },
  sideSpacer: {
      width: 40,
      alignItems: 'flex-start',
  },
  backButton: {
      borderRadius: 20,
      marginLeft: '5%',
      marginTop: '100%',
  },
  headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      flex: 1,
      paddingTop: 45,
      marginRight: 2,
  },
  content: {
    padding: 20,
    paddingTop: 120,
    width: '100%',
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
    marginBottom: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 16,
  },
  previewText: {
    fontSize: 16,
    color: '#333',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
  },
  saveButton: {
    backgroundColor: '#6C567D',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
    alignSelf: 'flex-start',
  },
  deleteButton: {
    backgroundColor: '#ff5c74',
    borderRadius: 30,
    padding: 16,
    elevation: 5,
    alignSelf: 'flex-end',
  },
});

export default EditTask;
