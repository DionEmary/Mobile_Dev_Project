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
            <Text style={styles.headerText}>Welcome!</Text>
            <Text style={styles.subHeaderText}>Customize your brand new task here!</Text>

            <TextInput
                placeholder="Category"
                style={styles.input}
                value={taskCategory}
                onChangeText={setTaskCategory}
            />

            <TextInput
                placeholder="Task Name"
                style={styles.input}
                value={taskName}
                onChangeText={setTaskName}
            />

            <View style={styles.dateTimeContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.buttonText}>Pick a Date</Text>
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
                <Text style={styles.dateText}>Set to: {date.toDateString()}</Text>
            </View>

            <View style={styles.dateTimeContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.buttonText}>Pick a Time</Text>
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
                <Text style={styles.dateText}>Set to: {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}</Text>
            </View>

            {successMessage ? <Text style={styles.successMessage}>{successMessage}</Text> : null}

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Create Task</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#F8F9FA",
    },
    headerText: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    subHeaderText: {
        fontSize: 18,
        color: "#666",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        width: "90%",
        padding: 15,
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: "#FFF",
    },
    dateTimeContainer: {
        alignItems: "center",
        marginBottom: 15,
    },
    button: {
        backgroundColor: "#6C567D",
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    dateText: {
        marginTop: 10,
        fontSize: 16,
        color: "#333",
    },
    submitButton: {
        backgroundColor: "#C6A3E1",
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginTop: 20,
    },
    submitButtonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
    },
    successMessage: {
        color: "green",
        fontSize: 16,
        marginTop: 10,
    },
});