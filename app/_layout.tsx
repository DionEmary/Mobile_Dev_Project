import { Tabs } from "expo-router";
import { Icon } from "@rneui/base";
import { TouchableOpacity } from "react-native";
import { View } from "react-native";

export default function Layout() {
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