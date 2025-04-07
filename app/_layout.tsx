import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Icon, Button } from "@rneui/base";
import { TouchableOpacity, View, Text, TextInput, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { signUpUser, signInUser } from '../lib/supabase_auth';
import { checkAutoDeleteTasks } from "../lib/supabase_crud";
import supabase from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';

export default function Layout() {
  // Stores User Details used for Sign in and Sign Up
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  // Variables used to manage state of the app
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Setup notifications
  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== "granted") {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== "granted") {
          console.log("Notification permissions not granted!");
          return;
        }
      }
      console.log("Notification permissions granted!");

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    } catch (error) {
      console.error("Error setting up notifications:", error);
    }
  };

  useEffect(() => {
    setupNotifications();
  }, []);

  const router = useRouter();

  // Fetch user settings and tasks to check for auto-delete
  useEffect(() => {
    if (user) {
      checkAutoDeleteTasks(user.id);
    }
  }, [user]);

  // Handle Sign Up
  const handleSignUp = async () => {
    setLoading(true);
    setError(null);

    try {
      const newUser = await signUpUser(email, password, firstName, lastName);
      if (newUser) {
        setUser(newUser);
      }
    } catch (err: any) {
      setError('Error signing up. Please try again.');
    } finally {
      setLoading(false);
      setEmail('');
      setPassword('');
      setFirstName('');
      setLastName('');
      setIsRegistering(false);
    }
  };

  // Handle Sign In
  const handleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const signedInUser = await signInUser(email, password);
      if (signedInUser) {
        setUser(signedInUser);
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err: any) {
      setError("Error signing in. Please check your credentials and try again.");
    } finally {
      setLoading(false);
      setEmail('');
      setPassword('');
    }
  };

  // Form validation
  const isFormValid = () => {
    if (isRegistering) {
      return email !== '' && password !== '' && firstName !== '' && lastName !== '';
    }
    return email !== '' && password !== '';
  };

  // Used to switch between Sign Up and Sign In Screens
  const switchType = () => {
    setIsRegistering((prev) => !prev);
    setError(null);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
  };

  // Listen for Supabase auth state changes to manage if the user is signed in or out
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Cleans up the subscription when the component is unmounted
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Display the login or registration screen if no user is logged in
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.appTitle}>Schedulify</Text>
        <Text style={styles.headerText}>{isRegistering ? "Create a new account" : "Login to continue"}</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          keyboardType="email-address"
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}    
        />

      {/* Only loads First and Last name inputs if the user is signing up */}
        {isRegistering && (
          <View style={styles.nameInputContainer}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              style={styles.input}
            />
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              style={styles.input}
            />
          </View>
        )}

        <Button
          title={isRegistering ? 'Sign Up' : 'Sign In'}
          onPress={isRegistering ? handleSignUp : handleSignIn}
          loading={loading}
          disabled={loading || !isFormValid()}
          containerStyle={styles.buttonContainer}
        />

        {/* Changes Screen between Sign In and Sign Up */}
        <Button
          title={isRegistering ? "Already have an account? Log in" : "Don't have an account? Register"}
          onPress={switchType}
          type="clear"
          titleStyle={styles.toggleButtonText}
        />

        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  }

  // Display main tabs after logging in, Controlls the navigation between screens and displays the content based on the seledted tab
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: { [key: string]: string } = {
            index: "home",
            newTask: "add-box",
            taskList: "list",
          };
          return <Icon name={icons[route.name]} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: "#A855F7",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: styles.tabBarStyle,
        headerStyle: styles.headerStyle,
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: "bold",
          color: "#FFFFFF",
        },
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "center",
        headerLeft: () => (
          <View style={styles.settingsIconContainer}>
            <Icon
              name="settings"
              type="material"
              size={32}
              color="#FFFFFF"
              onPress={() => router.push('settings')}
            />
          </View>
        ),
        headerRight: () => (
          <View style={styles.profileIconContainer}>
            <Icon
              name="person"
              type="material"
              size={32}
              color="#FFFFFF"
              onPress={() => router.push('profile')}
            />
          </View>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="newTask" options={{ title: "New Task" }} />
      <Tabs.Screen name="taskList" options={{ title: "Task List" }} />
      <Tabs.Screen name="profile" options={{ href: null, tabBarStyle: {display: 'none'}, headerShown: false}} />
      <Tabs.Screen name="settings" options={{ href: null, tabBarStyle: {display: 'none'}, headerShown: false}} />
      <Tabs.Screen name="editTask" options={{ href: null, tabBarStyle: {display: 'none'}, headerShown: false}} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 44,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#6C567D',
    fontFamily: 'sans-serif-medium',
  },
  headerText: {
    fontSize: 26,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  nameInputContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  input: {
    borderWidth: 1,
    width: '80%',
    padding: 12,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
    fontSize: 16,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 10,
    borderRadius: 8,
  },
  toggleButtonText: {
    color: "#6200ea",
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    fontSize: 14,
  },
  tabBarStyle: {
    backgroundColor: "#181818",
  },
  headerStyle: {
    backgroundColor: "#6C567D",
    height: 64,
  },
  profileIconContainer: {
    marginRight: 15,
  },
  settingsIconContainer: {
    marginLeft: 15,
  },
});
