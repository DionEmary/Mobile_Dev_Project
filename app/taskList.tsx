import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import supabase from '../lib/supabase';
import { getUserDetails } from "../lib/supabase_crud";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

const tasksData = [
    { subject: "Art", task: "Doodle Dash due 2025-03-10 at 2:30 p.m." },
    { subject: "Science", task: "Biology test on 2025-03-11 at 10 a.m." },
    { subject: "Math", task: "Mad Minutes due 2025-03-14 at 3 p.m." },
    { subject: "Social", task: "Explorer Report due 2025-03-07 at 11 a.m." },
    { subject: "L.A", task: "Spelling Drill Sheet due 2025-03-11 at 12 p.m." },
    { subject: "Band", task: "Practice Minutes due 2025-03-25 at 3:30 p.m." },
    { subject: "Drama", task: "Monologue on 2025-03-13 at 9 a.m." },
];

export default function TaskList() {
    const [sortAsc, setSortAsc] = useState(true);
    const [uuid, setUuid] = useState('');
    const [tasks, setTasks] = useState([]);

    const sortedTasks = [...tasksData].sort((a, b) => {
        return sortAsc
            ? a.subject.localeCompare(b.subject)
            : b.subject.localeCompare(a.subject);
    });

    useEffect(() => {
        async function fetchUsers() {
            try {
                const data = await getUserDetails();
                if (data) {
                    setUuid(data.uuid);
                    getTasksByUUID(uuid);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }

        const getTasksByUUID = async (uuid: string) => {
            const { data, error } = await supabase
              .from("tasks")
              .select("taskID, taskCategory, taskName, dueDate")
              .eq("uuid", uuid);
          
            if (error) {
              console.error("Error fetching tasks:", error);
              return null;
            }
          
            console.log("Tasks:", data);
            console.log("UUID:", uuid);
          };
    
        fetchUsers();
    }, []);

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
                {sortedTasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.subject}</Text>
                        </View>
                        <Text style={styles.taskContent}>{item.task}</Text>
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