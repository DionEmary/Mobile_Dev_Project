import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from "@rneui/base";

export default function Profile() {
    const router = useRouter(); // Use Expo Router for navigation

    return (
        <View style={styles.container}>
            {/* Custom Header with Back Button */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.push('/')} 
                    style={styles.backButton} // Larger touchable area
                >
                    <Icon 
                        name="arrow-back" 
                        type="material" 
                        size={28} 
                        color="#FFF" 
                        onPress={() => router.push('/')} 
                    />
                </TouchableOpacity>
                <Text style={styles.headerText}>Profile</Text>
            </View>

            <Text style={styles.text}>Welcome to the Profile Page</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C567D',
        paddingBottom: 0,
        paddingTop: 45,
        paddingHorizontal: 20,
    },
    backButton: {
        padding: 12, // Increases touchable area
        borderRadius: 20, // Adds a circular feel
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        position: 'absolute', // Centers the text regardless of other elements
        alignSelf: 'center', // Ensures vertical centering
        left: 0,
        right: 0,
        top: 60,
        textAlign: 'center', // Keeps text centered
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
