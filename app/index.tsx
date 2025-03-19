import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavBar from "../components/navBar";
import Icon from 'react-native-vector-icons/Ionicons';

export default function UpcomingTasks() {
    return (
        <View style={styles.container}>
            <View style={styles.WelcomeContainer}>
                <Icon name="person-circle-outline" size={200}></Icon>
                <Text style={styles.WelcomeMessage}>Welcome User!</Text>
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.upcomingTasks}>Upcoming Tasks:</Text>
                {/* Can replace the following task cards with a task function containing a .map function to list tasks */}
                <View style={styles.taskContainer}>
                    <View style={styles.taskTitleContainer}>
                        <Text style={styles.taskTitle}>Social</Text>
                        <Text> </Text>
                    </View>
                    <Text style={styles.taskContent}> Explorer Report due 2025-03-07 at 11 a.m.</Text>
                </View>
            </View>
            <NavBar/>
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
    BottomNav: {
        
    }
});