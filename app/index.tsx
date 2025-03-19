import React from "react";
import { View, Text, StyleSheet } from "react-native";
import NavBar from "../components/navBar";

export default function UpcomingTasks() {
    return (
        <View style={styles.container}>
            <Text>Home</Text>
            <NavBar/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    BottomNav: {
        
    }
});