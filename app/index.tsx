import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from "react-native";
import supabase from '../lib/supabase';
import { getUserDetails } from '../lib/supabase_crud';
import { useRouter, useFocusEffect } from "expo-router";

interface Task {
    taskID: number;
    taskCategory: string;
    taskName: string;
    dueDate: string;
}

export default function UpcomingTasks() {
    const router = useRouter();

    const [tasks, setTasks] = useState<Task[]>([]);
    const [uuid, setUuid] = useState('');
    const [firstName, setFirstName] = useState('');
    const [taskGoal, setTaskGoal] = useState('');

    // Function to update the user goal in Supabase
    const updateUserGoal = async (goal: string | null) => {
        try {
            const { data, error } = await supabase
                .from('user_details')
                .update({ userGoal: goal })
                .eq('uuid', uuid);  // Ensure the goal is updated for the correct user

            if (error) {
                console.error("Error updating user goal:", error.message);
            } else {
                console.log("User goal updated successfully:", data);
            }
        } catch (error) {
            console.error("Error updating user goal:", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            async function fetchUserAndTasks() {
                try {
                    const user = await getUserDetails();
                    if (user) {
                        setUuid(user.uuid);
                        setFirstName(user.firstName);

                        const { data, error } = await supabase
                            .from("tasks")
                            .select("taskID, taskCategory, taskName, dueDate")
                            .eq("uuid", user.uuid)
                            .eq("completed", false)

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
        }, [])
    );

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <Text style={styles.appTitle}>Schedulify</Text>

                <View style={styles.WelcomeContainer}>
                    <Text style={styles.WelcomeMessage}>Welcome {firstName}!</Text>
                </View>

                <Text style={styles.goalPrompt}>What's your completed task goal today?</Text>
                <TextInput
                    style={styles.goalInput}
                    value={taskGoal}
                    onChangeText={(text) => {
                        if (/^\d*$/.test(text)) { 
                            setTaskGoal(text);
                            // Send null if input is empty, otherwise send the task goal
                            updateUserGoal(text === '' ? null : text);
                        }
                    }}
                    placeholder="Enter number of tasks"
                    keyboardType="numeric"
                />

                <Text style={styles.motto}>You're building a better day, one task at a time.</Text>

                <View style={styles.contentContainer}>
                    <Text style={styles.upcomingTasks}>Upcoming Tasks:</Text>
                    {tasks.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.taskContainer}
                            onPress={() => router.push(`/editTask?taskId=${item.taskID}`)}
                        >
                            <View style={styles.taskTitleContainer}>
                                <Text style={styles.taskTitle}>{item.taskCategory}</Text>
                            </View>
                            <Text style={styles.taskContent}>{item.taskName},</Text>
                            <Text style={styles.taskDueDate}>
                                Due: {new Date(item.dueDate).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "2-digit",
                                })} at {new Date(item.dueDate).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                })}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </TouchableWithoutFeedback>
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
        marginTop: 15,
        marginBottom: 5,
        color: '#6C567D',
        fontFamily: 'sans-serif-medium',
    },
    WelcomeContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
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
        marginTop: 10,
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
        marginBottom: 10,
    },
    taskContainer: {
        backgroundColor: '#E0E0E0',
        borderRadius: 10,
        marginVertical: 8,
        padding: 10,
        width: '90%',
        alignSelf: 'center',
        elevation: 4,
    },
    taskTitleContainer: {
        flexDirection: 'row',
    },
    taskTitle: {
        elevation: 3,
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
    taskDueDate: {
        paddingTop: 1,
    },
});
