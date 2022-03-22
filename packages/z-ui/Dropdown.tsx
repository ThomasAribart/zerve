import React from "react";
import { Icon } from "./Icon";
import { useBottomSheet } from "./BottomSheet";
import { Button } from "./Button";
import { VStack } from "./Stack";

export type DropdownOption = {
  value: string | number;
  icon?: any;
  title: string;
};

export function Dropdown<OptionValues>({
  options,
  value,
  onOptionSelect,
  unselectedLabel = "Select...",
}: {
  options: DropdownOption[];
  value: string;
  onOptionSelect: (optionValue: string | number) => void;
  unselectedLabel?: string;
}) {
  const selectedOption = options.find((o) => o.value === value);
  const onOpen = useBottomSheet(({ onClose }) => (
    <VStack>
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <Button
            key={option.value}
            title={option.title}
            onPress={() => {
              onClose();
              onOptionSelect(option.value);
            }}
            primary={isActive}
            right={(p) => (isActive ? <Icon {...p} name="check" /> : null)}
          />
        );
      })}
    </VStack>
  ));
  return (
    <Button
      title={selectedOption ? selectedOption.title : unselectedLabel}
      onPress={onOpen}
      right={(p) => <Icon name="chevron-down" {...p} />}
    />
  );
}