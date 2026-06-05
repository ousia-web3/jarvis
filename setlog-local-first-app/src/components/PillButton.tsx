import { Pressable, StyleSheet, Text } from "react-native";

import { colors, radii } from "../theme/colors";

type PillButtonProps<T extends string | number> = {
  label: string;
  value: T;
  selectedValue: T;
  onSelect: (value: T) => void;
};

export function PillButton<T extends string | number>({
  label,
  value,
  selectedValue,
  onSelect,
}: PillButtonProps<T>) {
  const selected = value === selectedValue;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => onSelect(value)}
      style={[styles.button, selected && styles.selected]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderColor: colors.line,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  selected: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  label: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: "700",
  },
  selectedLabel: {
    color: colors.paper,
  },
});
