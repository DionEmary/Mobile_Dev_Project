import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import supabase from '../lib/supabase';
import { getUserDetails } from "../lib/supabase_crud";
import DropDownPicker from "react-native-dropdown-picker";
import { useFocusEffect } from "expo-router";

interface Task {
    taskID: number;
    taskCategory: string;
    taskName: string;
    dueDate: string;
}

export default function TaskList() {
    // User Data (Tasks, UUID)
    const [uuid, setUuid] = useState('');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [sortedTasks, setSortedTasks] = useState<Task[]>([]);

    const [sortOption, setSortOption] = useState("A-Z");
    const [selectedCategory, setSelectedCategory] = useState("");

    // Dropdown states
    const [sortOpen, setSortOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [categories, setCategories] = useState<{ label: string; value: string }[]>([]);


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

    // Since using Tabs, This re runs every time the screen is selected
    useFocusEffect(
        React.useCallback(() => {
            if (!uuid) return; // Prevent fetching if uuid is empty
            
            const getTasksByUUID = async () => {
                try {
                    const { data, error } = await supabase
                        .from("tasks")
                        .select("taskID, taskCategory, taskName, dueDate")
                        .eq("uuid", uuid);

                    if (error) {
                        throw new Error(error.message); 
                    }

                    setTasks(data);

                    // Gets all Categories for sorting
                    const uniqueCategories = Array.from(new Set(data.map(task => task.taskCategory)))
                        .map(category => ({ label: category, value: category }));

                    setCategories(uniqueCategories); // Set unique categories for dropdown
                } catch (error) {
                    console.error("Error fetching tasks:", error);
                }
            };

            getTasksByUUID(); // Call the function to fetch tasks

        }, [uuid]) // Add `uuid` to the dependency array to re-run when it changes
    );

    // Re Render tasks when sort type changes
    useEffect(() => {
        let updatedTasks = [...tasks];

        if (sortOption === "A-Z") {
            updatedTasks.sort((a, b) => a.taskCategory.localeCompare(b.taskCategory));
        } else if (sortOption === "Z-A") {
            updatedTasks.sort((a, b) => b.taskCategory.localeCompare(a.taskCategory));
        }

        if (sortOption === "Specific Category" && selectedCategory) {
            updatedTasks = updatedTasks.filter(task => task.taskCategory === selectedCategory);
        }

        setSortedTasks(updatedTasks);
    }, [tasks, sortOption, selectedCategory]);

    // Sorting logic
    const sortTasks = [...tasks].sort((a, b) => {
        if (sortOption === "A-Z") {
            return a.taskCategory.localeCompare(b.taskCategory);
        } else if (sortOption === "Z-A") {
            return b.taskCategory.localeCompare(a.taskCategory);
        }
        return 0;
    });
    
    // Filtering by selected category
    const displayedTasks =
        sortOption === "Specific Category" && selectedCategory
            ? sortedTasks.filter((task) => task.taskCategory === selectedCategory)
            : sortedTasks;

    return (
        <View style={styles.container}>
            <DropDownPicker
                open={sortOpen}
                value={sortOption}
                items={[
                    { label: "Sort by Category (A-Z)", value: "A-Z" },
                    { label: "Sort by Category (Z-A)", value: "Z-A" },
                    { label: "Filter by Specific Category", value: "Specific Category" },
                ]}
                setOpen={setSortOpen}
                setValue={setSortOption}
                placeholder="Select Sorting Option"
                containerStyle={styles.dropdownContainer}
                style={styles.dropdown}
                zIndex={3000} // Highest when open
                zIndexInverse={1000} // Lower when closed
            />

                {sortOption === "Specific Category" && (
                <DropDownPicker
                    open={categoryOpen}
                    value={selectedCategory}
                    items={categories}
                    setOpen={setCategoryOpen}
                    setValue={setSelectedCategory}
                    placeholder="Select a Category"
                    containerStyle={styles.dropdownContainer}
                    style={styles.dropdown}
                    zIndex={2000} // Higher than sorting when open
                    zIndexInverse={500} // Lower when closed
                />
            )}

            <ScrollView style={styles.contentContainer}>
                {sortedTasks.map((item, index) => (
                    <View key={index} style={styles.taskContainer}>
                        <View style={styles.taskTitleContainer}>
                            <Text style={styles.taskTitle}>{item.taskCategory}</Text>
                        </View>
                        <Text style={styles.taskContent}>{item.taskName}</Text>
                        <Text style={styles.taskContent}>
                            Due: {new Date(item.dueDate).toLocaleString()}
                        </Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "flex-start",
        flex: 1,
        paddingTop: 20,
    },
    dropdownContainer: {
        width: "90%",
        marginBottom: 10,
    },
    dropdown: {
        backgroundColor: "#fafafa",
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 5,
    },
    contentContainer: {
        width: "100%",
    },
    taskContainer: {
        backgroundColor: "#E6E6E6",
        marginLeft: 15,
        marginRight: 15,
        marginBottom: 10,
        borderRadius: 10,
        padding: 10,
    },
    taskTitleContainer: {
        flexDirection: "row",
    },
    taskTitle: {
        backgroundColor: "#B5ABBD",
        borderRadius: 5,
        width: 125,
        textAlign: "center",
        padding: 5,
        fontWeight: "bold",
    },
    taskContent: {
        paddingTop: 5,
    },
});