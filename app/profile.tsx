import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    TextInput
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, Button } from "@rneui/base";
import { getUserDetails } from '../lib/supabase_crud';
import { signOut } from '../lib/supabase_auth';

export default function Profile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [personalNote, setPersonalNote] = useState('');

    const handleSignOut = async () => {
        await signOut();
        router.replace('/');
    };

    useEffect(() => {
        const fetchUser = async () => {
            const userDetails = await getUserDetails();
            setUser(userDetails);
            setLoading(false);
        };
        fetchUser();
    }, []);

    return (
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
                            value={personalNote}
                            onChangeText={setPersonalNote}
                            multiline={true}
                            numberOfLines={6}
                            textAlignVertical="top"
                        />
                    </View>

                    <Text style={styles.signUpText}>Signed up: April 2, 2025</Text>

                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        containerStyle={styles.signOutButton}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFF',
        alignItems: 'center',
        paddingTop: 85,
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
    },
    sideSpacer: {
        width: 40,
        alignItems: 'flex-start',
    },
    backButton: {
        borderRadius: 20,
        marginLeft: -7,
    },
    headerText: {
        fontSize: 20,
        fontWeight: '500',
        color: '#FFFFFF',
        textAlign: 'center',
        flex: 1,
    },
    pageTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
    },
    profileBox: {
        backgroundColor: '#EADFF0',
        padding: 20,
        borderRadius: 10,
        width: '90%',
        marginBottom: 35,
    },
    profileLabel: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#6C567D',
        marginTop: 10,
    },
    profileValue: {
        fontSize: 18,
        marginTop: 1,
        marginBottom: 15,
    },
    noteBox: {
        backgroundColor: '#E0E0E0',
        padding: 15,
        borderRadius: 10,
        width: '90%',
        marginBottom: 10,
    },
    noteTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6C567D',
        marginBottom: 5,
        marginTop: 10,
    },
    noteInput: {
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        padding: 10,
        height: 120,
        fontSize: 16,
        borderColor: '#CCC',
        borderWidth: 1,
        marginBottom: 15,
    },
    signUpText: {
        fontSize: 14,
        color: '#666',
        marginTop: 10,
        marginBottom: 20,
    },
    signOutButton: {
        width: '60%',
    },
});