import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon, Button } from "@rneui/base";
import { getUserDetails } from '../lib/supabase_crud';
import { signOut } from '../lib/supabase_auth';

export default function Profile() {
    const router = useRouter(); // Use Expo Router for navigation
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
                <TouchableOpacity 
                    onPress={() => router.push('/')} 
                    style={styles.backButton}
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

            
            {loading ? (
                <ActivityIndicator size="large" color="#6C567D" />
            ) : (
                <>
                    <Text style={styles.text}>
                        Welcome, {user?.firstName} {user?.lastName}!
                    </Text>
                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        
                    />
                </>
            )}
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
        padding: 12,
        borderRadius: 20,
    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
        position: 'absolute',
        alignSelf: 'center',
        left: 0,
        right: 0,
        top: 60,
        textAlign: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
});
