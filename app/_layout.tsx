import { Tabs } from "expo-router";
import { useRouter } from "expo-router";
import { Icon, Button } from "@rneui/base";
import { TouchableOpacity, View, Text, TextInput, StyleSheet } from "react-native";
import { useState, useEffect } from "react";
import { signUp, signIn } from '../lib/supabase_auth';
import supabase from '../lib/supabase';
import { User } from '@supabase/supabase-js';


export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);

  // Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const router = useRouter(); // Used for Header Navigation

  // Handle Sign Up
  const handleSignUp = async () => {
    setLoading(true);
    setError(null); // Reset any old errors

    // checks password against regex expression, checks if password is over 8 characters to determine error message
    if (!passwordRegex.test(password)) {
        if(password.length < 8) {
            setError('Password must be at least 8 characters long');
        } else {
            setError('Password must include at least one uppercase letter, one lowercase letter, one number, and one special character');
        }
        setLoading(false);
        return; 
    }

    try {
        const user = await signUp(email, password, firstName, lastName);
    } catch (err: any) {  // Use `any` to access `.message`
        setError('Error signing up. Please try again.');
    }

    setLoading(false);
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
  };

  // Handle Sign In
  const handleSignIn = async () => {
    setLoading(true);
    setError(null); // Reset any previous errors

    try {
      const signedInUser = await signIn(email, password); // Call the signIn function from supabase_auth.ts
      setUser(signedInUser); // Set the user if sign-in is successful
    } catch (err) {
      setError('Error signing in. Please check your credentials and try again.');
      console.error(err);
    }
    setLoading(false);
    setEmail('');
    setPassword('');
  };

    // Used to check if all fields are submitted so you cant sign up without all fields filled
    const isFormValid = () => {
      if (isRegistering) {
        return email !== '' && password !== '' && firstName !== '' && lastName !== '';
      }
      return email !== '' && password !== '';        
    };

    const switchType = () => {
      setIsRegistering((prev) => !prev);
      setError(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
    }

    useEffect(() => {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session?.user || null);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
    
      return () => {
        authListener.subscription.unsubscribe();
      };
    }, []);


  // Returns this if there is no user
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.headerText}>
          {isRegistering ? "Create a new account" : "Login to continue"}
        </Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
        />

        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={styles.input}
        />

        {isRegistering && (
          <View>
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
          onPress={isRegistering ? handleSignUp || setIsRegistering(false): handleSignIn}
          loading={loading}
          disabled={loading || !isFormValid()}
        />

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

  // What is shown after being logged in
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: { [key: string]: string } = {
            index: "home",
            newTask: "add-box",
            taskList: "list",
            upcomingTasks: "schedule",
          };
          return <Icon name={icons[route.name]} type="material" size={size} color={color} />;
        },
        tabBarActiveTintColor: "#A855F7",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: styles.tabBarStyle,
        headerStyle: styles.headerStyle,
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "center",
        headerLeft: () => (
          <View style={styles.settingsIconContainer}>
            <Icon name="settings" type="material" size={32} color="#FFFFFF" />
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
      <Tabs.Screen name="upcomingTasks" options={{ title: "Upcoming" }} />
      <Tabs.Screen name="profile" options={{ href: null, tabBarStyle: {display: 'none'}, headerShown: false}} />
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
  headerText: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    width: 200,
    padding: 10,
    marginBottom: 10,
  },
  toggleButtonText: {
    color: "#6200ea",
    marginTop: 10,
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  tabBarStyle: {
    backgroundColor: "#181818",
  },
  headerStyle: {
    backgroundColor: "#6C567D",
  },
  profileIconContainer: {
    marginRight: 15,
  },
  settingsIconContainer: {
    marginLeft: 15,
  },
});

