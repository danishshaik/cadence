import { DrawerContent, GlassIconButton, HeaderTitle } from "@components/navigation";
import { colors } from "@theme";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={(props) => <DrawerContent navigation={props.navigation} />}
      screenOptions={({ navigation }) => ({
        headerShown: true,
        headerTransparent: true,
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerTitle: () => <HeaderTitle title="Cadence" />,
        headerLeft: () => (
          <GlassIconButton
            icon="line.3.horizontal"
            onPress={() => navigation.toggleDrawer()}
          />
        ),
        headerRight: () => (
          <GlassIconButton
            icon="person.crop.circle"
            onPress={() => {
              // TODO: Navigate to profile/settings
              console.log("Profile button pressed");
            }}
          />
        ),
        drawerStyle: {
          backgroundColor: colors.drawerBackground,
          width: 280,
        },
        drawerType: "slide",
        overlayColor: colors.drawerOverlay,
      })}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Chat",
        }}
      />
    </Drawer>
  );
}
