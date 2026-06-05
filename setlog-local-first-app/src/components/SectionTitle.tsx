import { StyleSheet, Text, View } from "react-native";

import { colors } from "../theme/colors";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
};

export function SectionTitle({ eyebrow, title }: SectionTitleProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 3,
  },
  eyebrow: {
    color: colors.coral,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: "800",
  },
});
