import React, { useEffect, useMemo, useState } from "react";

import {
  ActionButtonDef,
  LinkRowGroup,
  Paragraph,
  VStack,
  LinkRow,
  Button,
} from "@zerve/ui";
import {
  HomeStackParamList,
  HomeStackScreenProps,
  SettingsStackScreenProps,
} from "../app/Links";
import {
  Connection,
  destroyConnection,
  useConnection,
} from "../app/Connection";
import { FontAwesome } from "@expo/vector-icons";
import { InfoRow } from "@zerve/ui/Row";
import ScreenContainer from "../components/ScreenContainer";
import ScreenHeader from "../components/ScreenHeader";
import NotFoundScreen from "./NotFoundScreen";
import { ConnectionStatusRow } from "./ConnectionInfoScreen";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { getZIcon } from "../app/ZIcon";
import {
  QueryConnectionProvider,
  useConnectionContext,
  useConnectionProjects,
} from "@zerve/query";
import { View } from "react-native";
import { displayStoreFileName } from "@zerve/core";

export function ConnectionProjects({
  onActions,
  connection,
}: {
  onActions: (actions: ActionButtonDef[]) => void;
  connection: Connection;
}) {
  const { navigate } = useNavigation<NavigationProp<HomeStackParamList>>();
  const { data, refetch, isLoading } = useConnectionProjects();
  const list = useMemo(() => {
    return Object.entries(data?.node || {}).map(([name, docValue]) => {
      return { key: name, name, ...docValue };
    });
  }, [data]);

  useEffect(() => {
    const actions: ActionButtonDef[] = [];
    if (refetch && !isLoading) {
      actions.push({
        key: "reload",
        icon: "refresh",
        title: "Reload",
        onPress: refetch,
      });
    }
    onActions(actions);
  }, [isLoading, refetch]);

  if (!connection) return <Paragraph danger>Connection unavailable.</Paragraph>;
  if (!list?.length) return <Paragraph>No files here.</Paragraph>;

  return (
    <LinkRowGroup
      links={list.map((child) => ({
        key: child.key,
        title: displayStoreFileName(child.name),
        icon: getZIcon("Container"),
        onPress: () => {
          navigate("File", {
            connection: connection?.key || null,
            name: child.key,
          });
        },
      }))}
    />
  );
}

export function ConnectionMetaLinks({
  connection,
}: {
  connection: Connection;
}) {
  const { navigate } = useNavigation<NavigationProp<HomeStackParamList>>();
  return (
    <LinkRowGroup
      links={[
        {
          key: "Events",
          title: "Event History",
          icon: "history",
          onPress: () => {
            navigate("ChainHistory", {
              connection: connection.key,
            });
          },
        },
        {
          key: "ServerSchemas",
          title: "Schemas",
          icon: "crosshairs",
          onPress: () => {
            navigate("ChainSchemas", {
              connection: connection.key,
            });
          },
        },
        {
          key: "ServerAPI",
          title: "Server Setup",
          icon: "database",
          onPress: () => {
            navigate("ConnectionSetup", {
              connection: connection.key,
            });
          },
        },
      ]}
    />
  );
}

export function NewFileButton() {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const conn = useConnectionContext();
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "flex-end",
        marginBottom: 12,
      }}
    >
      <Button
        onPress={() => {
          navigation.navigate("NewFile", { connection: conn?.key || null });
        }}
        small
        title="New File"
        left={({ color }) => (
          <FontAwesome name="plus-circle" color={color} size={24} />
        )}
      />
    </View>
  );
}

export function ConnectionPage({
  navigation,
  route,
}: HomeStackScreenProps<"Connection">) {
  const conn = useConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  return (
    <ScreenContainer scroll>
      <ScreenHeader title={`Connection: ${conn?.name}`} />
      <VStack>
        <ConnectionStatusRow connection={conn} />
        <ConnectionProjects connection={conn} onActions={() => {}} />
        <NewFileButton />
        <ConnectionMetaLinks connection={conn} />
      </VStack>
    </ScreenContainer>
  );
}

export default function ConnectionScreen({
  navigation,
  route,
}: HomeStackScreenProps<"Connection">) {
  const conn = useConnection(route.params.connection);
  if (!conn) {
    return <NotFoundScreen />;
  }
  return (
    <ScreenContainer scroll>
      <QueryConnectionProvider value={conn}>
        <ConnectionPage route={route} navigation={navigation} />
      </QueryConnectionProvider>
    </ScreenContainer>
  );
}