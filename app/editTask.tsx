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
import {
  fetchTaskById,
  fetchTaskNotifications,
  updateTaskById,
  updateTaskNotifications,
  deleteTaskAndNotifications,
} from '../lib/supabase_crud';


const EditTask = () => {
  // Used for Navigation, taskID gets the passed in TaskID used to fetch the task were editing
  const router = useRouter();
  const { taskId } = useLocalSearchParams();

  // Stores Task, the notifications associated with the task and the date and time for the due date of the task
  const [task, setTask] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());

  // State Management for task details and notifications
  const [loading, setLoading] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Fetches the Task and Notifications when the component first launches
  useEffect(() => {
    if (taskId) {
      const id = Array.isArray(taskId) ? taskId[0] : taskId;
      fetchTaskDetails(id);
      fetchNotifications(id);
    }
  }, [taskId]);

  // Fetches task Details using the taskID
  const fetchTaskDetails = async (taskId: string) => {
    setLoading(true);
    try {
      const data = await fetchTaskById(taskId);
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
  
// Fetch the notifications associated with the task
  const fetchNotifications = async (taskId: string) => {
    try {
      const data = await fetchTaskNotifications(taskId);
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };  

  // Handle save changes, pushing all the new changes to the database for both the task and notifications
  // Outputs an alert to the user if the changes were successful or not and pushes the user back to the task list
  const handleSaveChanges = async () => {
    if (!task) return; // Prevents running with null data (Only if a task is deleted the same time as editing)
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
  
      const timeDifference = newDueDate.getTime() - oldDueDate.getTime(); // Used to find out how much the due date changed by so we can apply it to all notifcations
  
      await updateTaskById(taskId as string, { // Updates the task in the database
        taskCategory: task.taskCategory,
        taskName: task.taskName,
        dueDate: newDueDate.toISOString(),
        completed: task.completed,
      });
  
      await updateTaskNotifications(notifications, timeDifference); // Passes in the notifications and the time difference to update the notifications in the database
  
      Alert.alert('Success', 'Task updated successfully!');
      router.push('/taskList');
    } catch (error) {
      console.error('Error updating task or notifications:', error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  
    setLoading(false);
  };
  
  // Handles the deletion of the task and its notifications
  // Outputs an alert to the user to confirm the deletion and if confirmed, deletes the task and notifications from the database
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
            setLoading(false); // If they click Cancel it just stops the loading state and goes back, avoids accidental deletion
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => { // If they click delete, it deletes the task and notifications and tells them it was successful and pushes them back to the home page
            try {
              await deleteTaskAndNotifications(taskId as string);
              Alert.alert('Success', 'Task deleted successfully!');
              router.push('/');
            } catch (error) {
              console.error('Error deleting task or notifications:', error);
              Alert.alert('Error', 'Something went wrong. Please try again.');
            }
            setLoading(false);
          } 
        },
      ],
      { cancelable: true }
    );
  };
  
  
  // Just puts a loading spinner on the screen while any CRUD or Fetches are happening to avoid inputs being pressed without data
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
    height: 64, // Slightly larger height for better spacing
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
  },
  headerText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textAlign: 'center',
      flex: 1,
      marginRight: 2,
  },
  content: {
    padding: 20,
    paddingTop: 90,
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
    elevation: 3,
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
