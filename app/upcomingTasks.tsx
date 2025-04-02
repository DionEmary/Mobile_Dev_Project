import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import supabase from '../lib/supabase';
import { getUserDetails } from "../lib/supabase_crud";

interface Task {
    taskID: number;
    taskCategory: string;
    taskName: string;
    dueDate: string;
}

export default function UpcomingTasks() {
    const [uuid, setUuid] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        async function fetchTasks() {
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

                    const sortedTasks = data.sort((a, b) => {
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    });

                    setTasks(sortedTasks);
                }
            } catch (error) {
                console.error("Error loading tasks:", error);
            }
        }

        fetchTasks();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.taskList}>
                {tasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.taskCategory}</Text>
                        </View>
                        <Text style={styles.taskContent}>
                            {item.taskName}, Due: {new Date(item.dueDate).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 10,
    },
    taskList: {
        width: '90%',
    },
    taskContainer: {
        backgroundColor: '#E6E6E6',
        borderRadius: 10,
        marginBottom: 10,
        padding: 10,
        alignSelf: 'stretch',
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
    },
    taskContent: {
        paddingTop: 5,
    },
});
