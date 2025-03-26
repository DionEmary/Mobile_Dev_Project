import React from "react";
import { View, Text, StyleSheet } from "react-native";

const tasks = [
    { subject: "Art", task: "Doodle Dash due 2025-03-10 at 2:30 p.m." },
    { subject: "Science", task: "Biology test on 2025-03-11 at 10 a.m." },
    { subject: "Math", task: "Mad Minutes due 2025-03-14 at 3 p.m." },
    { subject: "Social", task: "Explorer Report due 2025-03-07 at 11 a.m." },
    { subject: "L.A", task: "Spelling Drill Sheet due 2025-03-11 at 12 p.m." },
    { subject: "Band", task: "Practice Minutes due 2025-03-25 at 3:30 p.m." },
    { subject: "Drama", task: "Monologue on 2025-03-13 at 9 a.m." },
];

export default function UpcomingTasks() {
    return (
        <View style={styles.container}>
            <View style={styles.taskList}>
                {tasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.subject}</Text>
                        </View>
                        <Text style={styles.taskContent}>{item.task}</Text>
                    </View>
                ))}
            </View>
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
