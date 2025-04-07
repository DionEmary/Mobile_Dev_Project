import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
    Keyboard,
    TouchableWithoutFeedback,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Icon } from "@rneui/base";
import { getUserDetails, updateUserNote } from '../lib/supabase_crud';
import { signOut } from '../lib/supabase_auth';

interface UserDetails {
    uuid: string;
    firstName: string;
    lastName: string;
    email: string;
    userNote?: string;
}

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<UserDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [personalNote, setPersonalNote] = useState('');
    const [newPersonalNote, setNewPersonalNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

    const updatePersonalNoteInDatabase = async (newNote: string) => {
        if (user?.uuid) {
            try {
                setIsUpdating(true);
                await updateUserNote(user.uuid, newNote);
                setPersonalNote(newNote);
                console.log('Personal note updated successfully!');
            } catch (error) {
                console.error('Error updating personal note:', error);
            } finally {
                setIsUpdating(false);
            }
        }
    };

    useFocusEffect(
        useCallback(() => {
            const fetchUser = async () => {
                const userDetails = await getUserDetails();
                setUser(userDetails);
                setPersonalNote(userDetails?.userNote || '');
                setNewPersonalNote(userDetails?.userNote || '');
                setLoading(false);
            };
            fetchUser();
        }, [])
    );

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

                    <Text style={styles.headerText}>Profile</Text>
                    <View style={styles.sideSpacer} />
                </View>

                <Text style={styles.pageTitle}>Account Summary</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#6C567D" />
                ) : (
                    <>
                        <View style={styles.profileBox}>
                            <Text style={styles.profileLabel}>Name:</Text>
                            <Text style={styles.profileValue}>
                                {user?.firstName} {user?.lastName}
                            </Text>

                            <Text style={styles.profileLabel}>Email:</Text>
                            <Text style={styles.profileValue}>{user?.email}</Text>
                        </View>

                        <View style={styles.noteBox}>
                            <Text style={styles.noteTitle}>Personal Note</Text>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Write your note here..."
                                value={newPersonalNote}
                                onChangeText={(text) => setNewPersonalNote(text)}
                                multiline={true}
                                numberOfLines={6}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.buttonsContainer}>
                            <TouchableOpacity
                                style={[styles.confirmButton, isUpdating || newPersonalNote === personalNote ? styles.buttonDisabled : {}]}
                                onPress={() => updatePersonalNoteInDatabase(newPersonalNote)}
                                disabled={isUpdating || newPersonalNote === personalNote}
                            >
                                {isUpdating ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <Text style={styles.buttonText}>Confirm Note</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        <View style={styles.signOutButton}>
                            <TouchableOpacity style={styles.signOutButtonStyle} onPress={handleSignOut}>
                                <Text style={styles.buttonText}>Sign Out</Text>
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: '7%',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
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
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        flex: 1,
        marginRight: 2,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginTop: '15%',
        marginBottom: 15,
    },
    profileBox: {
        backgroundColor: '#E7DCEC',
        paddingLeft: 20,
        paddingTop: 10,
        paddingBottom: 10,
        borderRadius: 10,
        width: '90%',
        marginBottom: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    profileLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#6C567D',
        marginTop: 10,
    },
    profileValue: {
        fontSize: 16,
        marginTop: 5,
        marginBottom: 15,
    },
    noteBox: {
        backgroundColor: '#E0E0E0',
        paddingLeft: 20,
        paddingTop: 20,
        paddingBottom: 10,
        borderRadius: 10,
        width: '90%',
        marginBottom: 20,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6C567D',
        marginBottom: 10,
    },
    noteInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 12,
        height: 120,
        fontSize: 16,
        borderColor: '#CCC',
        borderWidth: 1,
        marginBottom: 15,
        width: '93%',
    },
    buttonsContainer: {
        marginTop: 5,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButton: {
        backgroundColor: '#6C567D',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '70%',
        elevation: 2,
    },
    buttonDisabled: {
        backgroundColor: '#C7BDCE',
    },
    buttonText: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold',
    },
    signOutButton: {
        width: '50%',
        marginTop: 25,
    },
    signOutButtonStyle: {
        backgroundColor: '#FF4C4C',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
    },
});