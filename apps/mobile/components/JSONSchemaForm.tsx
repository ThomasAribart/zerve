import React, {
  ComponentProps,
  ReactNode,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CapitalizeSchema,
  createZSchema,
  exploreUnionSchema,
  getDefaultSchemaValue,
  JSONSchema,
  JSONSchemaPluck,
  LeafSchema,
} from "@zerve/core";
import {
  Button,
  InfoRow,
  Input,
  Label,
  Paragraph,
  SwitchInput,
  ThemedText,
  Dropdown,
  Icon,
  VStack,
  useBottomSheet,
  HStack,
  useActionsSheet,
  ActionButtonDef,
} from "@zerve/ui";

import { NavigationContext, useNavigation } from "@react-navigation/native";
import { KeyboardAvoidingView } from "react-native";
import { View } from "react-native";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../app/Links";
import { TouchableOpacity } from "react-native-gesture-handler";
import { setString } from "expo-clipboard";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  FadeOutDown,
  FadeOutUp,
  Layout,
} from "react-native-reanimated";
import { showErrorToast } from "../app/Toast";

// function JSONSchemaForm({value, onValue, schema}: {value: any, onValue: (v: any)=> void, schema: JSONSchema}) {
//   return null;
// }

function extractTypeSchema(type, schemaObj) {
  const subType = { type };
  if (type === "string") {
    subType.minLength = schemaObj.minLength;
    subType.maxLength = schemaObj.maxLength;
    subType.pattern = schemaObj.pattern;
    subType.format = schemaObj.format;
  } else if (type === "object") {
    subType.required = schemaObj.required;
    subType.properties = schemaObj.properties;
    subType.patternProperties = schemaObj.properties;
    subType.additionalProperties = schemaObj.additionalProperties;
    subType.unevaluatedProperties = schemaObj.unevaluatedProperties;
    subType.propertyNames = schemaObj.propertyNames;
    subType.minProperties = schemaObj.minProperties;
    subType.maxProperties = schemaObj.maxProperties;
  } else if (type === "array") {
    subType.items = schemaObj.items;
    subType.prefixItems = schemaObj.prefixItems;
    subType.contains = schemaObj.contains;
    subType.minContains = schemaObj.minContains;
    subType.maxContains = schemaObj.maxContains;
    subType.uniqueItems = schemaObj.uniqueItems;
    subType.minItems = schemaObj.minItems;
    subType.maxItems = schemaObj.maxItems;
  } else if (type === "integer" || type === "number") {
    subType.minimum = schemaObj.minimum;
    subType.exclusiveMinimum = schemaObj.exclusiveMinimum;
    subType.maximum = schemaObj.maximum;
    subType.exclusiveMaximum = schemaObj.exclusiveMaximum;
    subType.multipleOf = schemaObj.multipleOf;
  }

  return subType;
}

function AddButton({
  onPress,
  label = "Add",
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Button
      title={label}
      style={{ alignSelf: "flex-start" }}
      left={(p) => <Icon {...p} name="plus" />}
      onPress={onPress}
      small
    />
  );
}

function expandSchema(schema: JSONSchema): JSONSchema | undefined {
  if (schema === false) return undefined;
  if (schema === undefined) return undefined;
  let schemaObj = schema;
  if (schemaObj === true) schemaObj = {};
  const { type } = schemaObj;
  if (
    schemaObj.oneOf ||
    schemaObj.anyOf ||
    schemaObj.allOf ||
    schemaObj.not ||
    schemaObj.const ||
    schemaObj.enum
  ) {
    // composed schemas cannot really be expanded, they kind of already are. theoretically we should do some "factoring" here. eg: if we have a union of two strings we can factor out type: string to the top level.
    // also, "allOf" can be collapsed, and "not" can be pre-evaluated
    return schemaObj;
  }
  if (type == null) {
    // any!
    return {
      oneOf: allTypesList.map((subType) => ({ type: subType })),
    };
  }
  if (Array.isArray(type)) {
    if (schema.oneOf) {
      throw new Error("Cannot expand a schema that has types array and oneOf.");
    }
    return {
      oneOf: type.map((subType) => extractTypeSchema(subType, schemaObj)),
    };
  }

  return schema;
}

function StatefulInput({
  onSubmit,
  defaultValue = "",
  inputLabel = "name",
}: {
  onSubmit: (v: string) => void;
  defaultValue?: string;
  inputLabel?: string;
}) {
  const [s, setS] = useState(defaultValue);
  const input = useRef(null);
  const [error, setError] = useState(defaultValue);
  return (
    <>
      <Input
        ref={input}
        label={inputLabel}
        autoFocus
        value={s}
        onValue={setS}
        returnKeyType="done"
        enablesReturnKeyAutomatically
        onSubmitEditing={() => {
          try {
            onSubmit(s);
          } catch (e) {
            showErrorToast(e.message);
          }
        }}
        InputComponent={BottomSheetTextInput}
      />
    </>
  );
}

export function JSONSchemaObjectForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  const { properties, additionalProperties } = schema;
  if (schema?.type && schema?.type !== "object") {
    throw new Error(
      "JSONSchemaObjectForm can not handle type: " + schema?.type
    );
  }
  const errors: { message: string }[] = [];
  if (value === undefined) {
    errors.push({
      message: "Value is empty but should be an object.",
    });
  } else if (typeof value !== "object") {
    errors.push({ message: "Value is not an object " + JSON.stringify(value) });
  }
  const propertyKeys = new Set(
    properties == null ? [] : Object.keys(properties)
  );
  const otherKeys = value
    ? Object.keys(value).filter((p) => !propertyKeys.has(p))
    : [];
  const expandedPropertiesSchema = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(schema.properties || {}).map(
          ([propName, propSchema]) => [
            propName,
            expandSchema(propSchema || defaultObjectItemsSchema),
          ]
        )
      ),
    [schema.properties]
  );
  const expandedAdditionalPropertiesSchema = useMemo(
    () => expandSchema(schema.additionalProperties || defaultObjectItemsSchema),
    [schema.additionalProperties]
  );

  const propertyNameInput = useBottomSheet<null | string>(
    ({ onClose, options: propertyEditKey }) => (
      <VStack>
        <StatefulInput
          inputLabel="New Property Name"
          defaultValue={propertyEditKey || ""}
          onSubmit={(propertyName) => {
            onClose();
            if (!onValue) return;
            if (value[propertyName] !== undefined)
              throw new Error(`Key ${propertyName} already exists here.`);
            if (propertyEditKey === null) {
              onValue({
                ...value,
                [propertyName]: getDefaultSchemaValue(
                  expandedAdditionalPropertiesSchema
                ),
              });
            } else {
              onValue(
                Object.fromEntries(
                  Object.entries(value).map(
                    ([propKey, propValue]: [string, any]) => {
                      if (propKey === propertyEditKey)
                        return [propertyName, propValue];
                      return [propKey, propValue];
                    }
                  )
                )
              );
            }
          }}
        />
      </VStack>
    )
  );
  return (
    <VStack>
      {schema.description ? <Paragraph>{schema.description}</Paragraph> : null}
      {!!errors.length && (
        <Paragraph>Errors: {errors.map((e) => e.message).join(". ")}</Paragraph>
      )}
      {[...propertyKeys].map((propertyName) => (
        <FormField
          key={propertyName}
          value={value?.[propertyName]}
          schema={expandedPropertiesSchema[propertyName]}
          label={propertyName}
          actions={[]}
          onValue={
            onValue
              ? (propertyValue) =>
                  onValue({ ...value, [propertyName]: propertyValue })
              : undefined
          }
        />
      ))}
      {otherKeys.map((itemName) => (
        <FormField
          key={itemName}
          value={value?.[itemName]}
          schema={expandedAdditionalPropertiesSchema}
          label={itemName}
          actions={[
            {
              key: "Delete",
              title: "Delete",
              icon: "trash",
              onPress: () => {
                const newValue = { ...value };
                delete newValue[itemName];
                onValue(newValue);
              },
            },
            {
              key: "Rename",
              title: "Rename",
              icon: "edit",
              onPress: () => {
                propertyNameInput(itemName);
              },
            },
          ]}
          onValue={
            onValue
              ? (propertyValue) =>
                  onValue({ ...value, [itemName]: propertyValue })
              : undefined
          }
        />
      ))}
      {additionalProperties !== false && !!onValue && (
        <AddButton
          label="Add Property"
          onPress={() => {
            propertyNameInput(null);
          }}
        />
      )}
    </VStack>
  );
}

const defaultArrayItemsSchema = {} as const;
const defaultObjectItemsSchema = {} as const;

export function JSONSchemaArrayForm({
  value,
  onValue,
  schema,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
}) {
  const expandedItemsSchema = useMemo(
    () => expandSchema(schema.items || defaultArrayItemsSchema),
    [schema.items]
  );
  if (!Array.isArray(value))
    return <ThemedText>Value is not an array</ThemedText>;
  return (
    <VStack>
      {value.length === 0 && <ThemedText>List is empty.</ThemedText>}
      {value.map((childValue, childValueIndex) => {
        return (
          <Animated.View
            entering={FadeInUp}
            exiting={FadeOutDown}
            key={childValueIndex}
          >
            <FormField
              label={`#${childValueIndex}`}
              value={childValue}
              schema={expandedItemsSchema}
              actions={[
                {
                  key: "Delete",
                  title: "Delete",
                  icon: "trash",
                  onPress: () => {
                    const newValue = [...value];
                    newValue.splice(childValueIndex, 1);
                    onValue(newValue);
                  },
                },
              ]}
              onValue={
                onValue
                  ? (childV) => {
                      const newValue = [...value];
                      newValue[childValueIndex] = childV;
                      onValue(newValue);
                    }
                  : undefined
              }
            />
          </Animated.View>
        );
      })}
      {!!onValue && (
        <AddButton
          label="Add Item"
          onPress={() => {
            onValue([...value, getDefaultSchemaValue(expandedItemsSchema)]);
          }}
        />
      )}
    </VStack>
  );
}

function ObjectFormField({
  label,
  value,
  onValue,
  schema,
  actions,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  const { push } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <>
      <FormFieldHeader
        label={label || "?"}
        typeLabel={schema.title || schema.type || "object"}
        value={value}
        actions={actions}
      />
      <Button
        title={(JSON.stringify(value) || "").slice(0, 60)}
        onPress={() => {
          push("JSONInput", { schema, value, onValue });
        }}
      />
    </>
  );
}
function ArrayFormField({
  label,
  value,
  onValue,
  schema,
  actions,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  const { push } =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <>
      <FormFieldHeader
        label={label || "?"}
        typeLabel={schema.title || schema.type || "array"}
        value={value}
        actions={actions}
      />
      <Button
        title={(JSON.stringify(value) || "").slice(0, 60)}
        onPress={() => {
          push("JSONInput", { schema, value, onValue });
        }}
      />
    </>
  );
}

function EnumFormField({
  label,
  value,
  onValue,
  schema,
  actions,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  actions?: ActionButtonDef[];
}) {
  if (!onValue) {
    return <InfoRow label={label} value={value} />;
  }
  return (
    <>
      <FormFieldHeader
        label={label || "?"}
        typeLabel={schema.title || "option"}
        value={value}
        actions={actions}
      />
      <Dropdown
        value={value}
        unselectedLabel={`Choose: ${schema.enum.slice(0, 5).join(",")}`}
        onOptionSelect={onValue}
        options={schema.enum.map((optionValue) => ({
          title: String(optionValue),
          value: optionValue,
        }))}
      />
      {schema.description && <Paragraph>{schema.description}</Paragraph>}
    </>
  );
}

function FormFieldHeader({
  label,
  typeLabel,
  value,
  schema,
  actions,
}: {
  label: string;
  typeLabel?: string;
  value?: any;
  schema?: any;
  actions?: ActionButtonDef[];
}) {
  const openActions = useActionsSheet(() => {
    return [
      ...(actions || []),
      value !== null &&
        typeof value !== "boolean" && {
          title: `Copy "${label}" value`,
          icon: "clipboard",
          onPress: () => {
            setString(
              typeof value === "string" ? value : JSON.stringify(value)
            );
          },
        },
    ].filter(Boolean);
  });

  return (
    <TouchableOpacity onPress={() => openActions()}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingBottom: 6,
        }}
      >
        <Label>{label}</Label>
        <View style={{ width: 40 }} />
        <Label style={{ flex: 1, textAlign: "right" }} secondary>
          {typeLabel}
        </Label>
      </View>
    </TouchableOpacity>
  );
}

export function OneOfFormField({
  label,
  value,
  onValue,
  schema,
  actions,
}: {
  label?: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;

  actions?: ActionButtonDef[];
}) {
  const unionOptions = exploreUnionSchema(schema);
  const matched = unionOptions.match(value);
  const matchedSchema = schema.oneOf[matched];

  const onChooseType = useActionsSheet(() =>
    unionOptions.options.map((option, optionIndex: number) => {
      return {
        title: option.title,
        onPress: () => {
          const converter = unionOptions.converters[optionIndex];
          if (converter && onValue) {
            onValue(converter(value));
          }
        },
        key: optionIndex,
      };
    })
  );
  const fieldActions = useMemo(
    () => [
      ...(actions || []),
      {
        key: "ChangeType",
        title: "Change Schema Option",
        icon: "crosshairs",
        onPress: onChooseType,
      },
    ],
    [actions, onChooseType]
  );
  return (
    <>
      {matchedSchema == null ? (
        <>
          <FormFieldHeader
            value={value}
            label={label || "?"}
            actions={fieldActions}
          />

          {onValue && (
            <Dropdown
              options={unionOptions.options}
              unselectedLabel={`Select Type`}
              value={matched}
              onOptionSelect={(optionValue) => {
                const converter = unionOptions.converters[optionValue];
                const convertedValue = converter(value);
                onValue(convertedValue);
              }}
            />
          )}
        </>
      ) : (
        <FormField
          value={value}
          onValue={onValue}
          schema={matchedSchema}
          label={label}
          actions={fieldActions}
          typeLabel={
            matched == null ? "?" : unionOptions.options[matched].title
          }
        />
      )}
    </>
  );
}

export function FormField({
  label,
  value,
  onValue,
  schema,
  typeLabel,
  actions,
}: {
  label?: string;
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  typeLabel?: string;
  actions?: ActionButtonDef[];
}) {
  const expandedSchema = useMemo(() => expandSchema(schema), [schema]);
  if (!expandedSchema)
    return (
      <ThemedText>
        {label} Failed to expand schema: {JSON.stringify({ schema, value })}
      </ThemedText>
    );

  if (isLeafType(expandedSchema.type)) {
    return (
      <LeafFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
        typeLabel={typeLabel}
        actions={actions}
      />
    );
  }
  if (schema.const) {
    return <InfoRow label={label} value={JSON.stringify(value)} />;
  }
  if (expandedSchema.oneOf) {
    return (
      <OneOfFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
        actions={actions}
      />
    );
  }
  if (schema.enum) {
    return (
      <EnumFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
        actions={actions}
      />
    );
  }
  if (schema.type === "object") {
    return (
      <ObjectFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
        actions={actions}
      />
    );
  }

  if (schema.type === "array") {
    return (
      <ArrayFormField
        value={value}
        schema={schema}
        label={label}
        onValue={onValue}
        actions={actions}
      />
    );
  }

  return (
    <ThemedText>Unhandled Child Schema: {JSON.stringify(schema)}</ThemedText>
  );
}

export function LeafFormField({
  label,
  value,
  onValue,
  schema,
  actions,
}: {
  label: string;
  value: any;
  onValue?: (v: any) => void;
  schema: LeafSchema;
  actions: ActionButtonDef[];
}) {
  const description = schema.description ? (
    <Paragraph>{schema.description}</Paragraph>
  ) : null;
  if (schema.type === "string") {
    const autoCapitalize = JSONSchemaPluck(CapitalizeSchema, schema.capitalize);
    return (
      <>
        <FormFieldHeader
          label={label}
          typeLabel={schema.title || schema.type}
          value={value}
          actions={actions}
        />
        <Input
          disabled={!onValue}
          value={value}
          onValue={onValue}
          placeholder={schema.placeholder}
          autoCapitalize={autoCapitalize}
        />
        {description}
      </>
    );
  }
  if (schema.type === "number" || schema.type === "integer") {
    const defaultNumber = schema.default || 0;
    return (
      <>
        <FormFieldHeader
          label={label}
          typeLabel={schema.title || schema.type}
          value={value}
          actions={actions}
        />
        <Input
          disabled={!onValue}
          keyboardType={schema.type === "integer" ? "number-pad" : "numeric"}
          value={value == null ? String(defaultNumber) : String(value)}
          onValue={
            onValue ? (valueString) => onValue(Number(valueString)) : undefined
          }
        />
      </>
    );
  }
  if (schema.type === "boolean") {
    return (
      <>
        <FormFieldHeader
          label={label}
          typeLabel={schema.title || schema.type}
          value={value}
          actions={actions}
        />
        <SwitchInput disabled={!onValue} value={value} onValue={onValue} />
      </>
    );
  }
  if (schema.type === "null") {
    return (
      <>
        <FormFieldHeader
          label={label}
          typeLabel={schema.title || "Empty"}
          value={value}
          actions={actions}
        />
      </>
    );
  }

  return <ThemedText>Huh?</ThemedText>;
}

const allTypesList = [
  "null",
  "boolean",
  "number",
  "string",
  // "integer", // LOL because we can't infer the difference between this and a number
  "array",
  "object",
] as const;
function isLeafType(v: string) {
  return (
    v === "null" ||
    v === "string" ||
    v === "number" ||
    v === "boolean" ||
    v === "integer"
  );
}

export function JSONSchemaForm({
  value,
  onValue,
  schema,
  label,
}: {
  value: any;
  onValue?: (v: any) => void;
  schema: JSONSchema;
  label?: string;
}) {
  const expandedSchema = useMemo(() => expandSchema(schema), [schema]);
  if (!expandedSchema) {
    return <ThemedText>Value not allowed.</ThemedText>;
  }

  if (expandedSchema.oneOf) {
    const unionOptions = exploreUnionSchema(expandedSchema);
    const matched = unionOptions.match(value);
    const matchedSchema = expandedSchema.oneOf[matched];
    return (
      <>
        <Dropdown
          options={unionOptions.options}
          value={matched}
          onOptionSelect={(optionValue) => {
            const converter = unionOptions.converters[optionValue];
            const convertedValue = converter(value);
            onValue(convertedValue);
          }}
        />
        {matchedSchema != null && (
          <JSONSchemaForm
            value={value}
            onValue={onValue}
            schema={matchedSchema}
          />
        )}
      </>
    );
  }
  if (expandedSchema.anyOf) {
    return <ThemedText>anyOf schema unsupported</ThemedText>;
  }
  if (expandedSchema.type === "array") {
    return (
      <JSONSchemaArrayForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (expandedSchema.type === "object") {
    return (
      <JSONSchemaObjectForm value={value} onValue={onValue} schema={schema} />
    );
  }
  if (isLeafType(expandedSchema.type)) {
    return (
      <LeafFormField
        label={label || ""}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }
  if (expandedSchema.enum) {
    return (
      <EnumFormField
        label={expandedSchema?.title || expandedSchema.type || "enum"}
        value={value}
        onValue={onValue}
        schema={schema}
      />
    );
  }

  return <ThemedText>Failed to create form for this schema</ThemedText>;
}
