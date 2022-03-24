import React, { useState } from "react";

import { SettingsStackScreenProps } from "../app/Links";
import {
  DisclosureSection,
  Label,
  LinkRow,
  PageTitle,
  Paragraph,
} from "@zerve/ui";
import AppPage from "../components/AppPage";
import { JSONSchemaForm } from "../components/JSONSchemaForm";
import { JSONSchema } from "@zerve/core";

const testSchema0 = {
  oneOf: [{ type: "number" }, { type: "string" }],
} as const;
const testSchema1 = {
  oneOf: [
    {
      type: "object",
      properties: {
        c: { const: "foo" },
        age: { type: "number" },
        isCool: { type: "boolean" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      properties: { c: { const: "bar" }, name: { type: "string" } },
      additionalProperties: false,
    },
  ],
} as const;
const testSchema2 = {
  oneOf: [
    {
      // title: "yes this is a type",
      type: "object",
      properties: {
        c: { const: "foo" },
        age: { type: "number" },
        isCool: { type: "boolean" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        c: { const: "bar" },
        c1: { const: "a" },
        name: { type: "string" },
      },
      additionalProperties: false,
    },
    {
      type: "object",
      properties: {
        c: { const: "bar" },
        c1: { const: "b" },
        name: { type: "string" },
        name2: { type: "string" },
      },
      additionalProperties: false,
    },
  ],
} as const;

const testSchema3 = {
  type: "object",
  properties: {
    color: {
      oneOf: [
        {
          // title: "yes this is a type",
          type: "object",
          properties: {
            c: { const: "foo" },
            age: { type: "number" },
            isCool: { type: "boolean" },
          },
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            c: { const: "bar" },
            c1: { const: "a" },
            name: { type: "string" },
          },
          additionalProperties: false,
        },
        {
          type: "object",
          properties: {
            c: { const: "bar" },
            c1: { const: "b" },
            name: { type: "string" },
            name2: { type: "string" },
          },
          additionalProperties: false,
        },
      ],
    },
  },
  required: ["color"],
  additionalProperties: false,
} as const;

function JSONSchemaFormExample({
  schema,
  initState = null,
}: {
  schema: JSONSchema;
  initState?: any;
}) {
  const [state, setState] = useState(initState);
  return (
    <>
      <JSONSchemaForm value={state} onValue={setState} schema={schema} />
      <Paragraph>{JSON.stringify(state)}</Paragraph>
    </>
  );
}

export default function TestJSONInputScreen({
  navigation,
}: SettingsStackScreenProps<"TestJSONInput">) {
  const [state, setState] = useState(null);
  return (
    <AppPage>
      <PageTitle title="JSON Inputs" />
      <DisclosureSection
        defaultIsOpen={false}
        header={<Label>Read-Only JSON Schema</Label>}
      >
        <JSONSchemaForm
          value={12.1}
          schema={{
            type: "number",
          }}
        />
        <JSONSchemaForm
          value={12}
          schema={{
            type: "integer",
          }}
        />
        <JSONSchemaForm
          value={"woah"}
          schema={{
            type: "string",
          }}
        />
        <JSONSchemaForm
          value={true}
          schema={{
            type: "boolean",
          }}
        />
        <JSONSchemaForm
          value={["list", "of", "strings"]}
          schema={{
            type: "array",
            items: {
              type: "string",
            },
          }}
        />
      </DisclosureSection>
      {/* <DisclosureSection header={<Label>Deep Read-Only JSON</Label>}>
        <JSONSchemaForm
          value={{
            this: { isA: { deep: "value" } },
          }}
          schema={{}}
        />
      </DisclosureSection> */}
      <DisclosureSection
        defaultIsOpen={false}
        header={<Label>Writable JSON Schema</Label>}
      >
        <JSONSchemaFormExample
          initState={12.1}
          schema={{
            type: "number",
          }}
        />
        <JSONSchemaFormExample
          initState={12}
          schema={{
            type: "integer",
          }}
        />
        <JSONSchemaFormExample
          initState={"woah"}
          schema={{
            type: "string",
          }}
        />
        <JSONSchemaFormExample
          initState={"post"}
          schema={{
            title: "HTTP Method",
            enum: ["post", "get", "put", "delete", "options"],
          }}
        />
        <JSONSchemaFormExample
          initState={true}
          schema={{
            type: "boolean",
          }}
        />
        <JSONSchemaFormExample
          initState={["list", "of", "strings"]}
          schema={{
            type: "array",
            items: {
              type: "string",
            },
          }}
        />
      </DisclosureSection>
      <DisclosureSection
        defaultIsOpen={false}
        header={<Label>Any JSON Schema</Label>}
      >
        <JSONSchemaFormExample initState={null} schema={true} />
      </DisclosureSection>
      <DisclosureSection
        defaultIsOpen={false}
        header={<Label>Advanced Union Schema</Label>}
      >
        <JSONSchemaFormExample schema={testSchema3} />
      </DisclosureSection>
    </AppPage>
  );
}