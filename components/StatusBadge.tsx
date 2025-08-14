import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface StatusBadgeProps {
	status: "active" | string;
}

const StatusBadge = memo(({ status }: StatusBadgeProps) => {
	const isActive = status === "active";
	const currentStatus = isActive
		? { bg: "rgba(34, 197, 94, 0.1)", text: "#22c55e" }
		: { bg: "rgba(239, 68, 68, 0.1)", text: "#ef4444" };

	return (
		<View style={[styles.badgeContainer, { backgroundColor: currentStatus.bg }]}>
			<ThemedText style={[styles.badgeText, { color: currentStatus.text }]}>
				{isActive ? "Available" : "Unavailable"}
			</ThemedText>
		</View>
	);
});

const styles = StyleSheet.create({
	badgeContainer: {
		borderRadius: 20,
		paddingVertical: 4,
		paddingHorizontal: 10,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: "600",
	},
});

export default StatusBadge;
