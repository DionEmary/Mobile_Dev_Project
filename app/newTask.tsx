import { Input } from "postcss";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import supabase from '../lib/supabase';
import { getUserDetails } from "../lib/supabase_crud";

export default function UpcomingTasks() {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [taskCategory, setTaskCategory] = useState('');
    const [taskName, setTaskName] = useState('');
    const [uuid, setUuid] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
    
    const handleSubmit = async () => {
        console.log("Task Category:", taskCategory); // Debug log
        console.log("Task Name:", taskName); // Debug log
    
        if (!uuid) {
            console.error("No user is logged in");
            return;
        }
    
        if (!taskCategory || !taskName) {
            console.error("Task Category and Task Name are required");
            return;
        }
    
        const dueDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes()
        );
    
        const { data, error } = await supabase.from('tasks').insert([
            {
                taskCategory,
                taskName,
                uuid: uuid,
                dueDate: dueDate.toISOString(),
            },
        ]);
    
        if (error) {
            console.error("Error inserting task:", error.message);
        } else {
            console.log("Task inserted successfully:", data);
            setSuccessMessage("New task created!");
            clearInputs();
        }
    };
    
    const clearInputs = () => {
        setTaskCategory('');
        setTaskName('');
        setDate(new Date());
        setTime(new Date());
    };

    return (
        <View style={styles.container}>
            <View>
                <View style={styles.categoryContainer}>
                    <TextInput
                        placeholder="Category"
                        style={styles.categoryInput}
                        value={taskCategory}
                        onChangeText={setTaskCategory}
                    />
                </View>
                <View style={styles.taskNameContainer}>
                    <TextInput
                        placeholder="Task Name"
                        style={styles.taskInput}
                        value={taskName}
                        onChangeText={setTaskName}
                    />
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
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setDate(selectedDate);
                                }}
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
                                onChange={(event, selectedTime) => {
                                    setShowTimePicker(false);
                                    if (selectedTime) setTime(selectedTime);
                                }}
                            />
                        )}
                        <Text style={{textAlign: 'center'}}>Set to: {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</Text>
                    </View>
                </View>
                {successMessage && (
                    <Text style={styles.successMessage}>{successMessage}</Text>
                )}
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Create Task</Text>
                </TouchableOpacity>
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
        alignItems: 'center',
    },
    taskNameContainer: {
        flex: 2,
        alignItems: 'center',
    },
    categoryInput: {
        borderColor: 'stone',
        borderWidth: 1,
        borderRadius: 5,
        width: 250,
    },
    taskInput: {
        borderColor: 'stone',
        borderWidth: 1,
        borderRadius: 5,
        width: 250,
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
        width: 160,
        height: 50,
        justifyContent: 'center',
    },
    dateButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    timeButton: {
        backgroundColor: '#6C567D',
        alignItems: 'center',
        borderRadius: 50,
        padding: 7,
        marginBottom: 10,
        width: 160,
        height: 50,
        justifyContent: 'center',
    },
    timeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    submitButton: {
        backgroundColor: '#C6A3E1',
        alignItems: 'center',
        borderRadius: 5,
        padding: 10,
        marginBottom: 20
    },
    submitButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
    },
    successMessage: {
        color: 'black',
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center',
    },
});