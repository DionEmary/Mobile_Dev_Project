import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import supabase from '../lib/supabase';

const EditTask = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams();  // Get the taskId from params

  const [task, setTask] = useState<any>(null);  // Task state to hold the task data
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch the task details on initial load
  useEffect(() => {
    if (taskId) {
      fetchTaskDetails(Array.isArray(taskId) ? taskId[0] : taskId);
    }
  }, [taskId]);

  // Fetch task details from Supabase
  const fetchTaskDetails = async (taskId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('taskID, taskCategory, taskName, dueDate')
        .eq('taskID', Array.isArray(taskId) ? taskId[0] : taskId)
        .single();

      if (error) {
        throw error;
      }

      setTask(data);  // Set task data
    } catch (error) {
      console.error('Error fetching task:', error);
    }
    setLoading(false);
  };

  // Handle saving changes (e.g., updating the task in Supabase)
  const handleSaveChanges = async () => {
    if (task) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('tasks')
          .update({
            taskCategory: task.taskCategory,
            taskName: task.taskName,
            dueDate: task.dueDate,
          })
          .eq('taskID', taskId);

        if (error) {
          throw error;
        }

        // Navigate back to the task list after saving
        router.push('/taskList');
      } catch (error) {
        console.error('Error updating task:', error);
      }
      setLoading(false);
    }
  };

  if (loading || !task) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Edit Task</Text>

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
      <TextInput
        value={task.dueDate}
        onChangeText={(text) => setTask({ ...task, dueDate: text })}
        style={styles.input}
      />

      <Button
        title="Save Changes"
        onPress={handleSaveChanges}
        disabled={loading}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flex: 1,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
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
    marginTop: 20,
    backgroundColor: '#A855F7',
    padding: 12,
    borderRadius: 5,
  },
});

export default EditTask;
