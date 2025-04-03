import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import Icon from 'react-native-vector-icons/Ionicons';
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

    useEffect(() => {
        async function fetchUserAndTasks() {
            try {
                const user = await getUserDetails();
                if (user) {
                    setUuid(user.uuid);

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
            <View style={styles.WelcomeContainer}>
                <Icon name="person-circle-outline" size={200}></Icon>
                <Text style={styles.WelcomeMessage}>Welcome User!</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.upcomingTasks}>Upcoming Tasks:</Text>
                {tasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.taskCategory}</Text>
                            <Text> </Text>
                        </View>
                        <Text style={styles.taskContent}>
                            {item.taskName}, Due: {new Date(item.dueDate).toLocaleString()}
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
    WelcomeContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginTop: 15,
        marginBottom: 30,
    },
    WelcomeMessage: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    contentContainer: {
        width: '100%',
    },
    upcomingTasks: {
        textAlign: 'left',
        fontSize: 18,
        marginLeft: 20,
        marginBottom: 20,
    },
    taskContainer: {
        backgroundColor: '#E6E6E6',
        marginLeft: 15,
        marginRight: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    taskTitleContainer: {
        flexDirection: 'row',
    },
    taskTitle: {
        backgroundColor: '#B5ABBD',
        borderRadius: 5,
        width: 125,
        textAlign: 'center',
        padding: 5,
        fontWeight: 'bold',
    },
    taskContent: {
        padding: 10,
    },
    BottomNav: {}
});