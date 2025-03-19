// import React from "react";
// import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
// import { Icon } from "@rneui/base";
// import { useState } from "react";

// const BottomNav: React.FC = () => {
//   const [active, setActive] = useState("Home");

//   const tabs = [
//     { name: "Home", icon: "home" },
//     { name: "New Task", icon: "add-box" },
//     { name: "Task List", icon: "list" },
//     { name: "Upcoming", icon: "schedule" },
//   ];

//   return (
//     <View style={styles.navContainer}>
//       {tabs.map((tab) => (
//         <TouchableOpacity
//           key={tab.name}
//           style={styles.tab}
//           onPress={() => setActive(tab.name)}
//         >
//           <Icon
//             name={tab.icon}
//             type="material"
//             size={24}
//             color={active === tab.name ? "#A855F7" : "#FFFFFF"}
//           />
//           <Text
//             style={[styles.tabText, active === tab.name && styles.activeText]}
//           >
//             {tab.name}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   navContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     alignItems: "center",
//     backgroundColor: "#181818",
//     paddingVertical: 10,
//     position: "absolute",
//     bottom: 0,
//     width: "100%",
//   },
//   tab: {
//     alignItems: "center",
//   },
//   tabText: {
//     color: "#FFFFFF",
//     fontSize: 12,
//     marginTop: 4,
//   },
//   activeText: {
//     color: "#A855F7",
//   },
// });

// export default BottomNav;

import { Tabs } from "expo-router";
import { Icon } from "@rneui/base";
import { View } from "react-native";

const BottomNav: React.FC = () => {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          const icons: { [key: string]: string } = {
            index: "home",
            newTask: "add-box",
            taskList: "list",
            upcoming: "schedule",
          };
          return (
            <View>
              <Icon name={icons[route.name]} type="material" size={size} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: "#A855F7",
        tabBarInactiveTintColor: "#FFFFFF",
        tabBarStyle: { backgroundColor: "#181818" },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="newTask" options={{ title: "New Task" }} />
      <Tabs.Screen name="taskList" options={{ title: "Task List" }} />
      <Tabs.Screen name="upcoming" options={{ title: "Upcoming" }} />
    </Tabs>
  );
};

export default BottomNav;