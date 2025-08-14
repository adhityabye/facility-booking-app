import { memo } from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { isPast, isToday } from "date-fns";

export type BookingStatus = "completed" | "upcoming" | "cancelled";

interface BookingStatusBadgeProps {
	status: "booked" | "cancelled";
	bookingDate: string;
}

const getBookingStatus = (
	status: "booked" | "cancelled",
	bookingDate: string
): BookingStatus => {
	if (status === "cancelled") {
		return "cancelled";
	}
	if (isPast(new Date(bookingDate)) && !isToday(new Date(bookingDate))) {
		return "completed";
	}
	return "upcoming";
};

const statusStyles: Record<
	BookingStatus,
	{ bg: string; text: string; label: string }
> = {
	upcoming: {
		bg: "rgba(52, 199, 89, 0.1)",
		text: "#34c759",
		label: "Upcoming",
	},
	completed: {
		bg: "rgba(142, 142, 147, 0.1)",
		text: "#8e8e93",
		label: "Completed",
	},
	cancelled: {
		bg: "rgba(255, 59, 48, 0.1)",
		text: "#ff3b30",
		label: "Cancelled",
	},
};

const BookingStatusBadge = memo(({ status, bookingDate }: BookingStatusBadgeProps) => {
	const bookingStatus = getBookingStatus(status, bookingDate);
	const { bg, text, label } = statusStyles[bookingStatus];

	return (
		<View style={[styles.badgeContainer, { backgroundColor: bg }]}>
			<ThemedText style={[styles.badgeText, { color: text }]}>{label}</ThemedText>
		</View>
	);
});

const styles = StyleSheet.create({
	badgeContainer: {
		borderRadius: 20,
		paddingVertical: 4,
		paddingHorizontal: 10,
		alignSelf: "flex-start",
	},
	badgeText: {
		fontSize: 12,
		fontWeight: "600",
	},
});

export default BookingStatusBadge;
