import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";

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

    const sortedTasks = [...tasksData].sort((a, b) => {
        return sortAsc
            ? a.subject.localeCompare(b.subject)
            : b.subject.localeCompare(a.subject);
    });

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