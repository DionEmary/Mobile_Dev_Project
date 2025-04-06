import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    Button,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from "@rneui/base";
import { getUserDetails, updateUserDetails, updateAutoDeleteSetting, updateAutoDeleteDays } from '../lib/supabase_crud';

// Define the user details interface
interface UserDetails {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    userNote?: string;
    autoDelete: boolean;
    autoDeleteDays: number;
}

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [autoDelete, setAutoDelete] = useState(false);
    const [autoDeleteDays, setAutoDeleteDays] = useState(1);  // Default to 1 day
    const [loading, setLoading] = useState(true);

    // Fetch the user details from Supabase
    useEffect(() => {
        const fetchUser = async () => {
            const userDetails = await getUserDetails();
            setUser(userDetails);
            if (userDetails) {
                setFirstName(userDetails.firstName);
                setLastName(userDetails.lastName);
                setAutoDelete(userDetails.autoDelete);
                setAutoDeleteDays(userDetails.autoDeleteDays);
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    // Function to update user details in Supabase
    const handleUpdate = async () => {
        if (user) {
            try {
                await updateUserDetails(user.uuid, firstName, lastName);
                alert('User details updated successfully!');
            } catch (error) {
                console.error('Error updating user details:', error);
                alert('There was an error updating your details.');
            }
        }
    };

    // Function to toggle autoDelete setting
    const handleAutoDeleteToggle = async (value: boolean) => {
        setAutoDelete(value);
        if (user) {
            try {
                await updateAutoDeleteSetting(user.uuid, value);
            } catch (error) {
                console.error('Error updating auto delete setting:', error);
            }
        }
    };

    // Function to update autoDeleteDays setting
    const handleAutoDeleteDaysUpdate = async () => {
        if (user && autoDeleteDays >= 1 && autoDeleteDays <= 7) {
            try {
                await updateAutoDeleteDays(user.uuid, autoDeleteDays);
                alert(`Auto delete will now occur in ${autoDeleteDays} days.`);
            } catch (error) {
                console.error('Error updating auto delete days setting:', error);
                alert('There was an error updating the auto delete days setting.');
            }
        } else {
            alert('Please enter a value between 1 and 7.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.sideSpacer}>
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            style={styles.backButton}
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        >
                            <Icon name="arrow-back" type="material" size={28} color="#FFF" />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.headerText}>Settings</Text>

                    <View style={styles.sideSpacer} />
                </View>

                {loading ? (
                    <Text>Loading...</Text>
                ) : (
                    <View style={styles.formContainer}>
                        <Text style={styles.pageTitle}>Edit Your Details</Text>

                        <TextInput
                            style={styles.input}
                            placeholder="First Name"
                            value={firstName}
                            onChangeText={setFirstName}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Last Name"
                            value={lastName}
                            onChangeText={setLastName}
                        />

                        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                            <Text style={styles.buttonText}>Update</Text>
                        </TouchableOpacity>

                        <View style={styles.autoDeleteContainer}>
                            <Text style={styles.autoDeleteText}>Enable Auto Delete:</Text>
                            <Switch
                                value={autoDelete}
                                onValueChange={handleAutoDeleteToggle}
                                thumbColor={autoDelete ? '#6C567D' : '#ccc'}
                                trackColor={{ true: '#a286b8', false: '#ccc' }}
                            />
                        </View>

                        <View style={styles.autoDeleteDaysContainer}>
                            <Text style={styles.autoDeleteDaysText}>Days till Auto Delete (1-7):</Text>
                            <TextInput
                                style={styles.input}
                                value={autoDeleteDays > 0 ? autoDeleteDays.toString() : ''}
                                onChangeText={(text) => {
                                    const num = parseInt(text);
                                    if (!isNaN(num) && num >= 1 && num <= 7) {
                                        setAutoDeleteDays(num);
                                    } else if (text === '') {
                                        setAutoDeleteDays(0); // Temporary clear state
                                    }
                                }}
                                keyboardType="numeric"
                                placeholder="Enter days (1-7)"
                                maxLength={1}
                            />
                            <TouchableOpacity style={styles.updateButton} onPress={handleAutoDeleteDaysUpdate}>
                                <Text style={styles.buttonText}>Update Auto Delete Days</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        paddingTop: '20%', // Avoid overlap with header
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6C567D',
        paddingHorizontal: 20,
        elevation: 3,
        justifyContent: 'center',
    },
    sideSpacer: {
        width: 40,
        alignItems: 'flex-start',
    },
    backButton: {
        borderRadius: 20,
        marginLeft: '5%',
        marginTop: '100%',
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        flex: 1,
        paddingTop: 45,
        marginRight: 2,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: '20%',
        textAlign: 'center',
    },
    formContainer: {
        width: '80%',
        padding: 20,
        alignItems: 'center',
    },
    input: {
        width: '100%',
        padding: 12,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        marginBottom: 15,
        backgroundColor: '#FFF',
        fontSize: 16,
    },
    updateButton: {
        backgroundColor: '#6C567D',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        color: '#FFF',
        fontWeight: 'bold',
    },
    autoDeleteContainer: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },
    autoDeleteText: {
        fontSize: 16,
        color: '#333',
    },
    autoDeleteDaysContainer: {
        marginTop: 20,
        width: '100%',
    },
    autoDeleteDaysText: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
});
