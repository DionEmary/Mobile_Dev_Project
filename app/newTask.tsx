import { Input } from "postcss";
import React, { useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import supabase from '../lib/supabase';

export default function UpcomingTasks() {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setShowDatePicker(Platform.OS === "ios");
            setDate(selectedDate);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (selectedTime) {
            setShowTimePicker(Platform.OS === "ios");
            setTime(selectedTime);
        }
    };
    
    return (
        <View style={styles.container}>
            <View>
                <View style={styles.categoryContainer}>
                    <TextInput placeholder="Category" style={styles.categoryInput}></TextInput>
                </View>
                <View style={styles.taskNameContainer}>
                    <TextInput placeholder="Task Name *" style={styles.taskInput}></TextInput>
                </View>
                <View style={styles.dateTimeContainer}>
                    <View style={styles.dateBox}>
                    <TouchableOpacity 
                        style={styles.dateButton} 
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.dateButtonText}>Pick a Date</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="date"
                            display="default"
                            onChange={onDateChange}
                    />
                    )}
                        <Text style={{textAlign: 'center'}}>Set to: {date.toDateString()}</Text>
                    </View>
                    <View style={styles.timeBox}>
                        <TouchableOpacity
                            style={styles.timeButton}
                            onPress={() => setShowTimePicker(true)}
                        >
                            <Text style={styles.timeButtonText}>Pick a Time</Text>
                        </TouchableOpacity>
                        {showTimePicker && (
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display="default"
                                onChange={onTimeChange}
                            />
                        )}
                        <Text style={{textAlign: 'center'}}>Set to: {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    categoryContainer: {
        flex: 2,
        justifyContent: 'center',
    },
    taskNameContainer: {
        flex: 2,
    },
    categoryInput: {
        borderColor: 'stone',
        borderWidth: 1,
        borderRadius: 5,
    },
    taskInput: {
        borderColor: 'stone',
        borderWidth: 1,
        borderRadius: 5,
    },
    dateTimeContainer: {
        flex: 2,
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    dateBox: {
        flexDirection: 'column',
        width: '45%',
    },
    timeBox: {
        flexDirection: 'column',
        width: '45%',
    },
    dateButton: {
        backgroundColor: '#6C567D',
        alignItems: 'center',
        borderRadius: 50,
        padding: 7,
        marginBottom: 10,
    },
    dateButtonText: {
        color: 'white',
        fontSize: 16,
    },
    timeButton: {
        backgroundColor: '#6C567D',
        alignItems: 'center',
        borderRadius: 50,
        padding: 7,
        marginBottom: 10,
    },
    timeButtonText: {
        color: 'white',
        fontSize: 16,
    },
    submitButton: {
        backgroundColor: '#4CAF50',
        alignItems: 'center',
        borderRadius: 5,
        padding: 10,
        marginTop: 20,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});