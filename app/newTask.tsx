import { Input } from "postcss";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, Platform, StyleSheet, TouchableOpacity } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import supabase from '../lib/supabase';
import { getUserDetails, insertTask, insertNotifications } from "../lib/supabase_crud";
import * as Notifications from 'expo-notifications';

export default function UpcomingTasks() {

    // Holds the form data used to create a new task, Form allows us to better control the data and its state as a whole
    const [form, setForm] = useState({
        taskCategory: '',
        taskName: '',
        date: new Date(),
        time: new Date(),
        notificationOptions: [] as number[],
    });

    // Holds the user ID used to create the task so its linked to the user
    const [uuid, setUuid] = useState<string | null>(null);

    // Used to control the visibility of the date and time pickers
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Success and Error Messages used to display the status of the task creation
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Getches the user details when the component is visable to get the user ID
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

    // Once the task is created, clear the inputs to reset the form to allow the user to create another task
    const clearInputs = () => {
        setForm({ taskCategory: '', taskName: '', date: new Date(), time: new Date(), notificationOptions: [] });
    };
    
    // Handles saving the new task and the notifications to the database
    const handleSubmit = async () => {
        if (!uuid) {
            console.error("No user is logged in");
            return;
        }

        const { taskCategory, taskName, date, time, notificationOptions } = form;

        if (!taskCategory || !taskName || notificationOptions.length === 0) {
            setSuccessMessage(null);
            setErrorMessage("Task Category, Task Name, and Notification Options are required.");
            return;
        }

        try {
            const dueDate = new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
                time.getHours(),
                time.getMinutes()
            );

            // Completed isnt included as the default value is false and creating a task with the state true would be useless
            const task = {
                taskCategory,
                taskName,
                uuid,
                dueDate: dueDate.toISOString(),
            };

            const taskData = await insertTask(task);
            if (taskData && taskData.length > 0) {
                const newTaskID = taskData[0].taskID;
                const notificationDates = notificationOptions.map((daysBefore) => {
                    const notificationDate = new Date(dueDate);
                    notificationDate.setDate(notificationDate.getDate() - daysBefore);
                    return { notificationDate, daysBefore };
                });

                // Schedule local notifications for each date
                for (const { notificationDate, daysBefore } of notificationDates) {
                    if (notificationDate > new Date()) { 
                        const bodyMessage = `Your task "${taskName}" is due in ${daysBefore} day${daysBefore > 1 ? 's' : ''}!`;

                        await Notifications.scheduleNotificationAsync({
                            content: {
                                title: "Task Reminder",
                                body: bodyMessage,
                                sound: true,
                            },
                            trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: notificationDate },
                        });
                        console.log(`Notification scheduled for: ${notificationDate} with message: "${bodyMessage}"`);
                    } else {
                        console.warn(`Skipping past notification date: ${notificationDate}`);
                    }
                }

                const notificationData = await insertNotifications(newTaskID, notificationDates.map(nd => nd.notificationDate));
                if (notificationData) {
                    setSuccessMessage("New task and notifications created!");
                    setErrorMessage(null);
                    clearInputs();
                } else {
                    console.error("Failed to insert notifications");
                }
            } else {
                console.error("Failed to insert task");
            }
        } catch (error) {
            console.error("Error submitting task:", error);
        }
    };

    // Allows for the user to toggle the three notification options to select which ones they want to be notified for
    const toggleNotificationOption = (value: number) => {
        setForm((prevForm) => ({
            ...prevForm,
            notificationOptions: prevForm.notificationOptions.includes(value)
                ? prevForm.notificationOptions.filter((option) => option !== value)
                : [...prevForm.notificationOptions, value],
        }));
    };

    // Set up notifications when the component is visable
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
                value={form.taskCategory}
                onChangeText={(text) => setForm({ ...form, taskCategory: text })}
            />

            <TextInput
                placeholder="Task Name"
                style={styles.input}
                value={form.taskName}
                onChangeText={(text) => setForm({ ...form, taskName: text })}
            />

            <View style={styles.dateTimeContainer}>
                <View style={styles.pickDateContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
                        <Text style={styles.buttonText}>Pick a Date</Text>
                    </TouchableOpacity>
                    {showDatePicker && (
                        <DateTimePicker
                            value={form.date}
                            mode="date"
                            display="default"
                            onChange={(event, selectedDate) => {
                                setShowDatePicker(false);
                                if (selectedDate) setForm({ ...form, date: selectedDate });
                            }}
                        />
                    )}
                <View style={styles.dateTextWrapper}>
                    <Text style={styles.dateText}>
                        Set to: {form.date.toDateString()}
                    </Text>
                </View>
            </View>

            <View style={styles.pickTimeContainer}>
                <TouchableOpacity style={styles.button} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.buttonText}>Pick a Time</Text>
                </TouchableOpacity>
                {showTimePicker && (
                    <DateTimePicker
                        value={form.time}
                        mode="time"
                        display="default"
                        onChange={(event, selectedTime) => {
                            setShowTimePicker(false);
                            if (selectedTime) setForm({ ...form, time: selectedTime });
                        }}
                    />
                )}
                <View style={styles.dateTextWrapper}>
                    <Text style={styles.dateText}>
                        Set to: {form.time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                    </Text>
                </View>
            </View>
        </View>

            <View style={styles.notificationContainer}>
                <Text style={styles.label}>Notify me:</Text>
                {[{ label: "1 Day before due date", value: 1 }, { label: "2 Days before due date", value: 2 }, { label: "30 Days before due date", value: 30 }]
                    .map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={styles.checkboxContainer}
                            onPress={() => toggleNotificationOption(option.value)}
                        >
                            <View style={[styles.checkbox, form.notificationOptions.includes(option.value) && styles.checkboxSelected]} />
                            <Text style={styles.checkboxLabel}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
            </View>

            <View style={styles.messageWrapper}>
                {errorMessage ? (
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                ) : successMessage ? (
                    <Text style={styles.successMessage}>{successMessage}</Text>
                ) : null}
            </View>

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Create Task</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    headerText: {
        fontSize: 36,
        fontWeight: "bold",
        color: "#333",
        marginTop: -15,
        marginBottom: 5,
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
        marginBottom: 20,
        backgroundColor: "#FFF",
    },
    dateTimeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",   
        marginBottom: 5,
        gap: 5,
    },
    pickDateContainer: {
        flex: 1,
        alignItems: "center",
    },
    pickTimeContainer: {
        flex: 1,
        alignItems: "center",
    },
    dateTextWrapper: {
        minHeight: 40,
        maxWidth: '100%',
        justifyContent: "center",
        paddingTop: 6,
        paddingHorizontal: 5,
    },
    dateText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
        flexWrap: "wrap",
    },    
      
    button: {
        elevation: 3,
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
    submitButton: {
        elevation: 3,
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
    errorMessage: {
        color: "red",
        fontSize: 16,
        textAlign: "center",
    },
    messageWrapper: {
        height: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: -10,
        marginTop: -20,
        
    }, 
});