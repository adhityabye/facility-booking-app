import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	StyleSheet,
	ActivityIndicator,
	ScrollView,
	TouchableOpacity,
	View,
	Alert,
	TextInput,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { useState } from "react";
import { format, isBefore, startOfDay } from "date-fns";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import StatusBadge from "@/components/StatusBadge";

interface Facility {
	id: string;
	name: string;
	description: string;
	maxCapacity: number;
	status: "active" | string;
	maxAdvanceBookingDays: number;
}

interface TimeSlot {
	hour: number;
	startTime: string;
	endTime: string;
	available: boolean;
	currentBookings: number;
	maxCapacity: number;
}

interface Availability {
	date: string;
	dayName: string;
	fullyBooked: boolean;
	timeSlots: TimeSlot[];
}

export default function FacilityDetailScreen() {
	const { id } = useLocalSearchParams();
	const facilityId = typeof id === "string" ? id : "";
	const router = useRouter();
	const queryClient = useQueryClient();

	const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
	const [notes, setNotes] = useState("");

	const { data: facility, isLoading: isLoadingFacility, isError: isErrorFacility, error: errorFacility } = useQuery<Facility, Error>({
		queryKey: ["facility", facilityId],
		queryFn: async () => {
			const response = await axiosInstance.get(`/facilities/${facilityId}`);
			return response.data;
		},
		enabled: !!facilityId,
	});

	const { data: availability, isLoading: isLoadingAvailability, isError: isErrorAvailability } = useQuery<Availability, Error>({
		queryKey: ["availability", facilityId, format(selectedDate, "yyyy-MM-dd")],
		queryFn: async () => {
			const response = await axiosInstance.get(
				`/facilities/${facilityId}/availability/daily?date=${format(
					selectedDate,
					"yyyy-MM-dd"
				)}`
			);
			return response.data;
		},
		enabled: !!facilityId,
	});

	const bookingMutation = useMutation({
		mutationFn: (bookingData: {
			facilityId: number;
			bookingDate: string;
			startHour: number;
			notes?: string;
		}) => {
			return axiosInstance.post("/facilities/bookings", bookingData);
		},
		onSuccess: () => {
			Alert.alert("Success", "Booking created successfully!");
			queryClient.invalidateQueries({
				queryKey: ["availability", facilityId]
			});
			router.push("/(tabs)/bookings");
		},
		onError: (error: any) => {
			Alert.alert(
				"Booking Failed",
				error.response?.data?.message || "An error occurred."
			);
		},
	});

	const handleConfirmDate = (date: Date) => {
		if (isBefore(date, startOfDay(new Date()))) {
			Alert.alert("Invalid Date", "You cannot select a past date for booking.");
			setDatePickerVisibility(false);
			return;
		}
		setSelectedDate(date);
		setSelectedSlot(null);
		setDatePickerVisibility(false);
	};

	const handleBooking = () => {
		if (!selectedSlot) {
			Alert.alert("No Time Slot Selected", "Please select a time slot to book.");
			return;
		}

		bookingMutation.mutate({
			facilityId: parseInt(facilityId, 10),
			bookingDate: format(selectedDate, "yyyy-MM-dd"),
			startHour: selectedSlot.hour,
			notes: notes,
		});
	};

	if (isLoadingFacility) {
		return (
			<ThemedView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.tint} />
			</ThemedView>
		);
	}

	if (isErrorFacility) {
		return (
			<ThemedView style={styles.loadingContainer}>
				<ThemedText type="subtitle">Error loading facility:</ThemedText>
				<ThemedText>{errorFacility?.message}</ThemedText>
			</ThemedView>
		);
	}

	if (!facility) {
		return (
			<ThemedView style={styles.loadingContainer}>
				<ThemedText>Facility not found</ThemedText>
			</ThemedView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContentContainer}
			>
				<View style={styles.headerContainer}>
					<ThemedText type="title">{facility.name}</ThemedText>
					<StatusBadge status={facility.status} />
				</View>

				<View style={styles.detailsCard}>
					<ThemedText style={styles.description}>
						{facility.description}
					</ThemedText>
					<View style={styles.infoRow}>
						<Ionicons name="people-outline" size={16} color={Colors.icon} />
						<ThemedText style={styles.infoText}>
							Max Capacity: {facility.maxCapacity} people
						</ThemedText>
					</View>
					<View style={styles.infoRow}>
						<Ionicons name="calendar-outline" size={16} color={Colors.icon} />
						<ThemedText style={styles.infoText}>
							Book up to {facility.maxAdvanceBookingDays} days in advance
						</ThemedText>
					</View>
				</View>

				<View style={styles.bookingSection}>
					<ThemedText type="subtitle" style={styles.sectionTitle}>
						Book a Slot
					</ThemedText>
					<TouchableOpacity
						style={styles.datePickerButton}
						onPress={() => setDatePickerVisibility(true)}
					>
						<Ionicons name="calendar-outline" size={20} color={Colors.tint} />
						<ThemedText style={styles.datePickerText}>
							{format(selectedDate, "PPP")}
						</ThemedText>
					</TouchableOpacity>

					<DateTimePickerModal
						isVisible={isDatePickerVisible}
						mode="date"
						onConfirm={handleConfirmDate}
						onCancel={() => setDatePickerVisibility(false)}
						date={selectedDate}
						minimumDate={startOfDay(new Date())}
					/>

					{isLoadingAvailability ? (
						<ActivityIndicator style={{ marginVertical: 20 }} size="large" color={Colors.tint} />
					) : isErrorAvailability ? (
						<ThemedText style={styles.errorText}>
							Error loading availability. Please try again.
						</ThemedText>
					) : availability ? (
						<View>
							{availability.timeSlots.length === 0 ? (
								<ThemedText style={styles.noSlotsText}>No available slots for this day.</ThemedText>
							) : (
								<View style={styles.slotsContainer}>
									{availability.timeSlots.map((slot) => (
										<TouchableOpacity
											key={slot.hour}
											onPress={() => slot.available && setSelectedSlot(slot)}
											disabled={!slot.available}
											style={[
												styles.slotButton,
												slot.available ? styles.availableSlot : styles.bookedSlot,
												selectedSlot?.hour === slot.hour && styles.selectedSlot,
											]}
										>
											<ThemedText
												style={[
													styles.slotText,
													slot.available ? styles.availableSlotText : styles.bookedSlotText,
													selectedSlot?.hour === slot.hour && styles.selectedSlotText,
												]}>
												{slot.startTime}
											</ThemedText>
										</TouchableOpacity>
									))}
								</View>
							)}

							<TextInput
								style={styles.notesInput}
								onChangeText={setNotes}
								value={notes}
								placeholder="Add optional notes..."
								placeholderTextColor={Colors.icon}
							/>
						</View>
					) : (
						<ThemedText style={styles.noSlotsText}>No availability information for this date.</ThemedText>
					)}
				</View>
			</ScrollView>

			<View style={styles.footer}>
				<TouchableOpacity
					style={[styles.bookButton, (!selectedSlot || bookingMutation.isPending) && styles.bookButtonDisabled]}
					onPress={handleBooking}
					disabled={!selectedSlot || bookingMutation.isPending}
				>
					{bookingMutation.isPending ? (
						<ActivityIndicator color="#FFFFFF" />
					) : (
						<ThemedText style={styles.bookButtonText}>Book Now</ThemedText>
					)}
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	scrollView: {
		flex: 1,
	},
	scrollContentContainer: {
		padding: 20,
		paddingBottom: 120,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
	headerContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 16,
	},
	detailsCard: {
		backgroundColor: Colors.card,
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
		color: Colors.textSecondary,
		marginBottom: 16,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
	},
	infoText: {
		marginLeft: 8,
		fontSize: 14,
		color: Colors.text,
	},
	bookingSection: {
		marginTop: 8,
	},
	sectionTitle: {
		marginBottom: 16,
	},
	datePickerButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.inputBackground,
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	datePickerText: {
		fontSize: 16,
		marginLeft: 10,
		color: Colors.tint,
		fontWeight: "600",
	},
	slotsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		marginTop: 20,
	},
	slotButton: {
		width: "31%",
		paddingVertical: 14,
		borderRadius: 12,
		borderWidth: 1,
		alignItems: "center",
		marginBottom: 12,
	},
	availableSlot: {
		backgroundColor: Colors.inputBackground,
		borderColor: Colors.border,
	},
	bookedSlot: {
		backgroundColor: "#f5f5f5",
		borderColor: "#e0e0e0",
	},
	selectedSlot: {
		backgroundColor: Colors.tint,
		borderColor: Colors.tint,
	},
	slotText: {
		fontSize: 14,
		fontWeight: "600",
	},
	availableSlotText: {
		color: Colors.text,
	},
	bookedSlotText: {
		color: "#a0a0a0",
	},
	selectedSlotText: {
		color: "#FFFFFF",
	},
	noSlotsText: {
		textAlign: "center",
		marginVertical: 20,
		color: Colors.textSecondary,
	},
	notesInput: {
		height: 100,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: Colors.inputBackground,
		borderRadius: 12,
		padding: 16,
		marginTop: 16,
		fontSize: 16,
		color: Colors.text,
		textAlignVertical: "top",
	},
	footer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		padding: 20,
		paddingBottom: 30,
		backgroundColor: Colors.background,
		borderTopWidth: 1,
		borderTopColor: Colors.border,
	},
	bookButton: {
		backgroundColor: Colors.tint,
		padding: 18,
		borderRadius: 16,
		alignItems: "center",
	},
	bookButtonDisabled: {
		backgroundColor: "#a0a0a0",
	},
	bookButtonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "bold",
	},
	errorText: {
		color: "red",
		textAlign: "center",
		marginVertical: 20,
	},
});
