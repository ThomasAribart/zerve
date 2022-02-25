import { useRouter } from "next/router";
import { ScrollView, Text, View } from "react-native";
import { Button } from "@zerve/ui";

import { useAppDispatch } from "../stores/Dispatch";
import { useDocListQuery } from "@zerve/query";
import { ReactNode } from "react";

function SmallSectionTitle({ children }: { children: ReactNode }) {
  return <Text style={{ fontWeight: "bold", color: "#444" }}>{children}</Text>;
}

function DisclosureSection({
  children,
  header,
}: {
  children: ReactNode;
  header: ReactNode;
}) {
  // add disclosure arrow here and state for isOpen
  return (
    <View>
      {header}
      {children}
    </View>
  );
}

function SmallSection({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <DisclosureSection header={<SmallSectionTitle>{title}</SmallSectionTitle>}>
      {children}
    </DisclosureSection>
  );
}

function DocListSection() {
  const { data, isLoading } = useDocListQuery();
  const { query } = useRouter();

  return isLoading ? null : (
    <SmallSection title="Docs">
      {data.docs.children.map((childDocName) => (
        <View style={{}} key={childDocName}>
          <Text
            accessibilityRole="link"
            href={`/shell/doc/${childDocName}`}
            style={{
              color: query.docId === childDocName ? "#000" : "blue",
            }}
          >
            {childDocName}
          </Text>
        </View>
      ))}
    </SmallSection>
  );
}

function ActionsSection() {
  return <SmallSection title="Actions">{null}</SmallSection>;
}

export default function Navigator() {
  const dispatch = useAppDispatch();

  return (
    <View
      style={{
        borderRadius: 8,
        margin: 16,
        flex: 1,
        backgroundColor: "#ecf8ff",
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 7.65,
        elevation: 8,
      }}
    >
      <ScrollView style={{ flex: 1 }}>
        <DocListSection />
        <ActionsSection />
        <SmallSection title="Server Info">{null}</SmallSection>
      </ScrollView>

      <View style={{ backgroundColor: "#ccc", height: 50 }}>
        <Button
          onPress={() => {
            dispatch({});
          }}
          title="Create Doc"
        />
      </View>
    </View>
  );
}
