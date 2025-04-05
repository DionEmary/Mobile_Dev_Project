import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput } from "react-native";
import supabase from '../lib/supabase';
import { getUserDetails } from '../lib/supabase_crud';

interface Task {
    taskID: number;
    taskCategory: string;
    taskName: string;
    dueDate: string;
}

export default function UpcomingTasks() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [uuid, setUuid] = useState('');
    const [firstName, setFirstName] = useState('');
    const [taskGoal, setTaskGoal] = useState('');

    useEffect(() => {
        async function fetchUserAndTasks() {
            try {
                const user = await getUserDetails();
                if (user) {
                    setUuid(user.uuid);
                    setFirstName(user.firstName);

                    const { data, error } = await supabase
                        .from("tasks")
                        .select("taskID, taskCategory, taskName, dueDate")
                        .eq("uuid", user.uuid);

                    if (error) {
                        console.error("Error fetching tasks:", error.message);
                        return;
                    }

                    const sortedTasks = data.sort(
                        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                    );

                    setTasks(sortedTasks.slice(0, 3));
                }
            } catch (err) {
                console.error("Error loading data:", err);
            }
        }

        fetchUserAndTasks();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.appTitle}>Schedulify</Text>

            <View style={styles.WelcomeContainer}>
                <Text style={styles.WelcomeMessage}>Welcome {firstName}!</Text>
            </View>

            <Text style={styles.goalPrompt}>What's your completed task goal today?</Text>
            <TextInput
                style={styles.goalInput}
                value={taskGoal}
                onChangeText={setTaskGoal}
                placeholder="Enter number of tasks"
                keyboardType="numeric"
            />
            <Text style={styles.motto}>You're building a better day, one task at a time.</Text>

            <View style={styles.contentContainer}>
                <Text style={styles.upcomingTasks}>Upcoming Tasks:</Text>
                {tasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.taskCategory}</Text>
                        </View>
                        <Text style={styles.taskContent}>
                            {item.taskName}, Due: {new Date(item.dueDate).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    appTitle: {
        fontSize: 44,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        color: '#6C567D',
        fontFamily: 'sans-serif-medium',
    },
    WelcomeContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginBottom: 15,
    },
    WelcomeMessage: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    goalPrompt: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    goalInput: {
        width: '80%',
        padding: 10,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#FFF',
        textAlign: 'center',
        elevation: 8,
    },
    motto: {
        fontSize: 14,
        color: '#666',
        marginBottom: 15,
        fontStyle: 'italic',
    },
    contentContainer: {
        width: '100%',
    },
    upcomingTasks: {
        textAlign: 'left',
        fontWeight: 'bold',
        fontSize: 18,
        marginLeft: 20,
        marginBottom: 15,
    },
    taskContainer: {
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        marginVertical: 8,
        padding: 10,
        width: '90%',
        alignSelf: 'center',
      },
    taskTitleContainer: {
        flexDirection: 'row',
    },
    taskTitle: {
        backgroundColor: '#B5ABBD',
        borderRadius: 5,
        textAlign: 'center',
        paddingVertical: 5,
        paddingHorizontal: 10,
        fontWeight: 'bold',
        alignSelf: 'flex-start',
        width: '100%',
    },
    taskContent: {
        paddingTop: 5,
    },
});