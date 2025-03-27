import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import supabase from '../lib/supabase';
import { getUserDetails } from "../lib/supabase_crud";

interface Task {
    taskID: number;
    taskCategory: string;
    taskName: string;
    dueDate: string;
}

export default function TaskList() {
    const [sortAsc, setSortAsc] = useState(true);
    const [uuid, setUuid] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);

    // const sortedTasks = [...tasks].sort((a, b) => {
    //     return sortAsc
    //         ? a.subject.localeCompare(b.subject)
    //         : b.subject.localeCompare(a.subject);
    // });

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getUserDetails();
                if (data) {
                    setUuid(data.uuid);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
    
        fetchUsers();
    }, []);

    useEffect(() => {
        if (!uuid) return; // Prevent running if uuid is empty
        
        const getTasksByUUID = async () => {
            try {
                const { data, error } = await supabase
                    .from("tasks")
                    .select("taskID, taskCategory, taskName, dueDate")
                    .eq("uuid", uuid);
    
                if (error) {
                    throw new Error(error.message); 
                }
    
                console.log("Tasks fetched:", data);
                console.log("UUID:", uuid);
    
                setTasks(data); 
    
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };
    
        getTasksByUUID(); // Call the function to fetch tasks
    }, [uuid]); // Runs every time UUID updates

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.showmoreBox}
                onPress={() => setSortAsc(!sortAsc)}
            >
                <Text style={styles.showmoreText}>
                    Category Name ({sortAsc ? "A-Z" : "Z-A"})
                </Text>
                <Text style={styles.showmorePlus}>+</Text>
            </TouchableOpacity>

            <ScrollView style={styles.contentContainer}>
                {tasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.taskCategory}</Text>
                        </View>
                        <Text style={styles.taskContent}>{item.taskName}</Text>
                        <Text style={styles.taskContent}>
                            Due: {new Date(item.dueDate).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        flex: 1,
        paddingTop: 20,
    },
    showmoreBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderColor: '#007AFF',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        width: '90%',
        marginBottom: 15,
    },
    showmoreText: {
        fontSize: 16,
    },
    showmorePlus: {
        fontSize: 16,
    },
    contentContainer: {
        width: '100%',
    },
    taskContainer: {
        backgroundColor: '#E6E6E6',
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 10,
        borderRadius: 10,
        padding: 10,
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
        paddingTop: 5,
    },
});