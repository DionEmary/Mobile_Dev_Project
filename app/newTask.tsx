import { Input } from "postcss";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import supabase from '../lib/supabase';
import { getUserDetails, insertTask, insertNotifications } from "../lib/supabase_crud";
import * as Notifications from 'expo-notifications';

export default function UpcomingTasks() {
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [taskCategory, setTaskCategory] = useState('');
    const [taskName, setTaskName] = useState('');
    const [uuid, setUuid] = useState<string | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [notificationOptions, setNotificationOptions] = useState<number[]>([]);

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

    const clearInputs = () => {
        setTaskCategory('');
        setTaskName('');
        setDate(new Date());
        setTime(new Date());
        setNotificationOptions([]);
    };
    
    const handleSubmit = async () => {
        console.log("Task Category:", taskCategory);
        console.log("Task Name:", taskName);
    
        if (!uuid) {
            console.error("No user is logged in");
            return;
        }
    
        if (!taskCategory || !taskName || notificationOptions.length === 0) {
            console.error("Task Category, Task Name, and Notification Options are required");
            return;
        }
    
        const dueDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            time.getHours(),
            time.getMinutes()
        );
    
        const task = {
            taskCategory,
            taskName,
            uuid,
            dueDate: dueDate.toISOString(),
        };
    
        console.log("Inserting Task:", task);
    
        const taskData = await insertTask(task);
    
        if (taskData && taskData.length > 0) {
            const newTaskID = taskData[0].taskID;
    
            if (!newTaskID) {
                console.error("Task ID is undefined");
                return;
            }
    
            const notificationDates = notificationOptions.map((daysBefore) => {
                const notificationDate = new Date(dueDate);
                notificationDate.setDate(notificationDate.getDate() - daysBefore);
                return { notificationDate, daysBefore };
            });

            // Schedule local notifications for each date
            for (const { notificationDate, daysBefore } of notificationDates) {
                if (notificationDate > new Date()) { // Ensure the notification date is in the future
                    const bodyMessage = `Your task "${taskName}" is due in ${daysBefore} day${daysBefore > 1 ? 's' : ''}!`;

                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: "Task Reminder",
                            body: bodyMessage,
                            sound: true,
                        },
                        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notificationDate }, // Schedule for the specific date
                    });
                    console.log(`Notification scheduled for: ${notificationDate} with message: "${bodyMessage}"`);
                } else {
                    console.warn(`Skipping past notification date: ${notificationDate}`);
                }
            }
    
            const notificationData = await insertNotifications(newTaskID, notificationDates.map(nd => nd.notificationDate));
    
            if (notificationData) {
                setSuccessMessage("New task and notifications created!");
                clearInputs();
            } else {
                console.error("Failed to insert notifications");
            }
        } else {
            console.error("Failed to insert task");
        }
    };   

    const toggleNotificationOption = (value: number) => {
        setNotificationOptions((prev) =>
            prev.includes(value) ? prev.filter((option) => option !== value) : [...prev, value]
        );
    };
    
    useEffect(() => {
        const checkScheduledNotifications = async () => {
            const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
            console.log("Scheduled Notifications:", scheduledNotifications);
        };
    
        checkScheduledNotifications();
    }, []);

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
                <View style={styles.pickDateContainer}>
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
                <View style={styles.pickTimeContainer}>
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
            </View>

            <View style={styles.notificationContainer}>
                <Text style={styles.label}>Notify me:</Text>
                {[
                    { label: "1 Day before due date", value: 1 },
                    { label: "2 Days before due date", value: 2 },
                    { label: "30 Days before due date", value: 30 },
                ].map((option) => (
                    <TouchableOpacity
                        key={option.value}
                        style={styles.checkboxContainer}
                        onPress={() => toggleNotificationOption(option.value)}
                    >
                        <View
                            style={[
                                styles.checkbox,
                                notificationOptions.includes(option.value) && styles.checkboxSelected,
                            ]}
                        />
                        <Text style={styles.checkboxLabel}>{option.label}</Text>
                    </TouchableOpacity>
                ))}
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
        flex: 1,
        flexDirection: "row",
        gap: 5,
        alignItems: "center",
        marginBottom: 15,
    },
    pickDateContainer: {
        flex: 1,
        alignItems: "center",
    },
    pickTimeContainer: {
        flex: 1,
        alignItems: "center",
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
    notificationContainer: {
        width: "90%",
        marginBottom: 15,
        alignItems: "center",
    },
    label: {
        fontSize: 16,
        color: "#333",
        marginBottom: 5,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 10,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: "#CCC",
        borderRadius: 4,
        marginRight: 10,
    },
    checkboxSelected: {
        backgroundColor: "#6C567D",
    },
    checkboxLabel: {
        fontSize: 16,
        color: "#333",
    },
});