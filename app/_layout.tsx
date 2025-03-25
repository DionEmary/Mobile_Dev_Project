import { Tabs } from "expo-router";
import { Icon } from "@rneui/base";
import { TouchableOpacity, View, Text, TextInput, Button } from "react-native";
import { useState, useEffect } from "react";
import { signUp, signIn, signOut } from '../lib/supabase_auth';
import supabase from '../lib/supabase';
import { User } from '@supabase/supabase-js';


export default function Layout() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

    // Handle Sign Up
  // Handle Sign Up
  const handleSignUp = async () => {
    setLoading(true);
    setError(null); // Reset any previous errors
    try {
      const signedUpUser = await signUp(email, password); // Call the signUp function from supabase_auth.ts
      setUser(signedUpUser); // Set the user if sign-up is successful
    } catch (err) {
      setError('Error signing up. Please try again.');
      console.error(err);
    }
    setLoading(false);
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
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    await signOut(); // Call the signOut function from supabase_auth.ts
    setUser(null); // Set user to null after signing out
  };

  // Returns this if there is no user
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#FFFFFF' }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Login to continue</Text>

        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          style={{ borderWidth: 1, width: 200, padding: 10, marginBottom: 10 }}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          secureTextEntry
          style={{ borderWidth: 1, width: 200, padding: 10, marginBottom: 10 }}
        />

        <Button title="Sign Up" onPress={handleSignUp} disabled={loading} />
        <Button title="Sign In" onPress={handleSignIn} disabled={loading} />
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
        tabBarStyle: { backgroundColor: "#181818" },
        headerStyle: {backgroundColor: "#6C567D"},
        headerTintColor: "#FFFFFF",
        headerTitleAlign: "center",

        headerLeft: () => (
          // <TouchableOpacity onPress={() => navigation.navigate("")}> CHANGE FOR NAVIGATING TO SETTINGS
          <View style={{ marginLeft: 10 }}>
            <Icon name="settings" type="material" size={28} color="#FFFFFF" />
          </View>
          // </TouchableOpacity>
        ),

        headerRight: () => (
          // <TouchableOpacity onPress={() => navigation.navigate("")}> CHANGE FOR NAVIGATING TO PROFILE
          <View style={{ marginRight: 10 }}>
            <Icon name="person" type="material" size={28} color="#FFFFFF" />
          </View>
          // </TouchableOpacity>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="newTask" options={{ title: "New Task" }} />
      <Tabs.Screen name="taskList" options={{ title: "Task List" }} />
      <Tabs.Screen name="upcomingTasks" options={{ title: "Upcoming" }} />
    </Tabs>
  );
}

