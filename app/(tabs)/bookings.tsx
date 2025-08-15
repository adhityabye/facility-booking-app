import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	StyleSheet,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	View,
	Alert,
	SafeAreaView,
	RefreshControl,
} from "react-native";
import {
	useInfiniteQuery,
	useQuery,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { useState, useCallback, memo } from "react";
import { format } from "date-fns";
import { Colors } from "@/constants/Colors";
import BookingStatusBadge from "@/components/BookingStatusBadge";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Calendar from "expo-calendar";

interface Booking {
	id: number;
	facilityId: number;
	userId: number;
	bookingDate: string;
	startHour: number;
	endHour: number;
	status: "booked" | "cancelled";
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	facilityName?: string;
}

interface BookingsResponse {
	page: number;
	pageSize: number;
	totalPages: number;
	hasMore: boolean;
	total: number;
	bookings: Booking[];
}

interface Facility {
	id: number;
	name: string;
}

const BookingCard = memo(
	({
		item,
		onCancel,
		onAddReminder,
	}: {
		item: Booking;
		onCancel: (id: number) => void;
		onAddReminder: (booking: Booking) => void;
	}) => {
		const isCancelable = item.status === "booked";

		return (
			<View style={styles.cardContainer}>
				<View style={styles.cardHeader}>
					<ThemedText type="subtitle" style={styles.facilityName}>
						{item.facilityName || "Facility"}
					</ThemedText>
					<BookingStatusBadge
						status={item.status}
						bookingDate={item.bookingDate}
					/>
				</View>
				<View style={styles.infoRow}>
					<Ionicons name="calendar-outline" size={16} color={Colors.icon} />
					<ThemedText style={styles.infoText}>
						{format(new Date(item.bookingDate), "EEEE, MMMM d, yyyy")}
					</ThemedText>
				</View>
				<View style={styles.infoRow}>
					<Ionicons name="time-outline" size={16} color={Colors.icon} />
					<ThemedText style={styles.infoText}>
						{item.startHour}:00 - {item.endHour}:00
					</ThemedText>
				</View>
				{item.notes && (
					<View style={styles.infoRow}>
						<Ionicons
							name="document-text-outline"
							size={16}
							color={Colors.icon}
						/>
						<ThemedText style={styles.infoText}>{item.notes}</ThemedText>
					</View>
				)}
				<View style={styles.actionsContainer}>
					{isCancelable && (
						<TouchableOpacity
							style={[styles.actionButton, styles.cancelButton]}
							onPress={() => onCancel(item.id)}
						>
							<Ionicons name="close-circle-outline" size={20} color="#ff3b30" />
							<ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
						</TouchableOpacity>
					)}
					{item.status === "booked" && (
						<TouchableOpacity
							style={[styles.actionButton, styles.reminderButton]}
							onPress={() => onAddReminder(item)}
						>
							<Ionicons
								name="notifications-outline"
								size={20}
								color={Colors.tint}
							/>
							<ThemedText style={styles.reminderButtonText}>
								Add Reminder
							</ThemedText>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	}
);

const FilterPill = ({ label, value, activeValue, setActiveValue }: any) => (
	<TouchableOpacity
		style={[
			styles.filterPill,
			activeValue === value && styles.activeFilterPill,
		]}
		onPress={() => setActiveValue(value)}
	>
		<ThemedText
			style={[
				styles.filterPillText,
				activeValue === value && styles.activeFilterPillText,
			]}
		>
			{label}
		</ThemedText>
	</TouchableOpacity>
);

const SortButton = memo(({ sortDirection, setSortDirection }: any) => {
	const toggleSortDirection = () => {
		setSortDirection(sortDirection === "asc" ? "desc" : "asc");
	};

	const iconName = sortDirection === "asc" ? "arrow-up" : "arrow-down";

	return (
		<TouchableOpacity style={styles.sortButton} onPress={toggleSortDirection}>
			<Ionicons name={iconName} size={20} color={Colors.tint} />
			<ThemedText style={styles.sortButtonText}>Sort</ThemedText>
		</TouchableOpacity>
	);
});

export default function BookingsScreen() {
	const [status, setStatus] = useState<"booked" | "cancelled" | "">("");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
	const queryClient = useQueryClient();
	const router = useRouter();

	const { data: facilities, isLoading: isLoadingFacilities } = useQuery<
		Facility[],
		Error
	>({
		queryKey: ["facilities"],
		queryFn: async () => {
			const response = await axiosInstance.get("/facilities");
			return response.data;
		},
	});

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
		error,
		refetch,
		isRefetching,
	} = useInfiniteQuery<BookingsResponse, Error>({
		queryKey: ["my-bookings", status, sortDirection],
		queryFn: async ({ pageParam = 1 }) => {
			const params: any = {
				page: pageParam,
				pageSize: 10,
				sortBy: "createdAt",
				sortDirection,
			};
			if (status) {
				params.status = status;
			}
			const response = await axiosInstance.get("/facilities/bookings/my", {
				params,
			});
			return response.data;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.hasMore ? lastPage.page + 1 : undefined;
		},
		enabled: !isLoadingFacilities,
	});

	const cancelBookingMutation = useMutation({
		mutationFn: (bookingId: number) => {
			return axiosInstance.delete(`/facilities/bookings/${bookingId}`);
		},
		onSuccess: () => {
			Alert.alert("Success", "Booking cancelled successfully!");
			queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
		},
		onError: (error: any) => {
			Alert.alert(
				"Cancellation Failed",
				error.response?.data?.message || "An error occurred."
			);
		},
	});

	const handleCancelBooking = (bookingId: number) => {
		Alert.alert(
			"Confirm Cancellation",
			"Are you sure you want to cancel this booking?",
			[
				{ text: "No", style: "cancel" },
				{
					text: "Yes",
					onPress: () => cancelBookingMutation.mutate(bookingId),
					style: "destructive",
				},
			]
		);
	};

	const handleAddReminder = async (booking: Booking) => {
		const { status } = await Calendar.requestCalendarPermissionsAsync();
		if (status !== "granted") {
			Alert.alert(
				"Permission Required",
				"Please grant calendar permissions to add a reminder."
			);
			return;
		}

		const eventDetails = {
			title: `Booking: ${booking.facilityName}`,
			startDate: new Date(
				new Date(booking.bookingDate).setHours(booking.startHour)
			),
			endDate: new Date(new Date(booking.bookingDate).setHours(booking.endHour)),
			notes: booking.notes || "",
			timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		};

		try {
			const calendars = await Calendar.getCalendarsAsync(
				Calendar.EntityTypes.EVENT
			);
			const defaultCalendar = calendars.find((cal) => cal.isPrimary);

			if (!defaultCalendar) {
				Alert.alert("No Calendar", "No default calendar found on your device.");
				return;
			}

			await Calendar.createEventAsync(defaultCalendar.id, eventDetails);
			Alert.alert("Success", "Reminder added to your calendar!");
		} catch (error) {
			console.error(error);
			Alert.alert("Error", "Failed to add reminder. Please try again.");
		}
	};

	const bookings =
		data?.pages
			.flatMap((page) => page.bookings)
			.map((booking) => {
				const facility = facilities?.find((f) => f.id === booking.facilityId);
				return { ...booking, facilityName: facility?.name };
			}) || [];

	const onRefresh = useCallback(() => {
		refetch();
	}, [refetch]);

	const renderEmptyState = () => (
		<ThemedView style={styles.emptyContainer}>
			<ThemedText type="subtitle" style={{ marginBottom: 8 }}>
				No Bookings Found
			</ThemedText>
			<ThemedText
				style={{
					marginBottom: 16,
					color: Colors.textSecondary,
					textAlign: "center",
				}}
			>
				You don't have any bookings for this filter.
			</ThemedText>
			<TouchableOpacity
				style={styles.bookButton}
				onPress={() => router.push("/(tabs)/facilities")}
			>
				<ThemedText style={styles.bookButtonText}>Book a Facility</ThemedText>
			</TouchableOpacity>
		</ThemedView>
	);

	if (isLoading) {
		return (
			<ThemedView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.tint} />
			</ThemedView>
		);
	}

	if (isError) {
		return (
			<ThemedView style={styles.loadingContainer}>
				<ThemedText>Error: {error.message}</ThemedText>
			</ThemedView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ThemedView style={styles.container}>
				<View style={styles.filtersContainer}>
					<FilterPill
						label="All"
						value=""
						activeValue={status}
						setActiveValue={setStatus}
					/>
					<FilterPill
						label="Booked"
						value="booked"
						activeValue={status}
						setActiveValue={setStatus}
					/>
					<FilterPill
						label="Cancelled"
						value="cancelled"
						activeValue={status}
						setActiveValue={setStatus}
					/>
					<SortButton
						sortDirection={sortDirection}
						setSortDirection={setSortDirection}
					/>
				</View>
				<FlatList
					data={bookings}
					renderItem={({ item }) => (
						<BookingCard
							item={item}
							onCancel={handleCancelBooking}
							onAddReminder={handleAddReminder}
						/>
					)}
					keyExtractor={(item) => item.id.toString()}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ paddingBottom: 20 }}
					ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={onRefresh}
							tintColor={Colors.tint}
						/>
					}
					ListEmptyComponent={renderEmptyState}
					ListFooterComponent={
						isFetchingNextPage ? (
							<ActivityIndicator
								style={{ marginVertical: 20 }}
								color={Colors.tint}
							/>
						) : null
					}
					onEndReached={() => hasNextPage && fetchNextPage()}
					onEndReachedThreshold={0.5}
				/>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: Colors.background,
	},
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 50,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	filtersContainer: {
		flexDirection: "row",
		marginBottom: 20,
		flexWrap: "wrap",
		gap: 8,
	},
	filterPill: {
		paddingVertical: 8,
		paddingHorizontal: 16,
		borderRadius: 20,
		backgroundColor: Colors.inputBackground,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	activeFilterPill: {
		backgroundColor: Colors.tint,
		borderColor: Colors.tint,
	},
	filterPillText: {
		color: Colors.text,
		fontWeight: "600",
	},
	activeFilterPillText: {
		color: "#FFFFFF",
	},
	sortButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 8,
		paddingHorizontal: 12,
		borderRadius: 20,
		backgroundColor: Colors.inputBackground,
		borderWidth: 1,
		borderColor: Colors.border,
		marginLeft: "auto",
	},
	sortButtonText: {
		marginLeft: 5,
		color: Colors.tint,
		fontWeight: "600",
	},
	cardContainer: {
		backgroundColor: Colors.card,
		borderRadius: 16,
		padding: 20,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 12,
	},
	facilityName: {
		flex: 1,
		marginRight: 10,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
	},
	infoText: {
		marginLeft: 10,
		fontSize: 14,
		color: Colors.textSecondary,
	},
	actionsContainer: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 16,
		gap: 8,
	},
	actionButton: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 12,
	},
	cancelButton: {
		backgroundColor: "rgba(255, 59, 48, 0.1)",
	},
	cancelButtonText: {
		color: "#ff3b30",
		fontWeight: "bold",
		marginLeft: 6,
	},
	reminderButton: {
		backgroundColor: "rgba(0, 122, 255, 0.1)",
	},
	reminderButtonText: {
		color: Colors.tint,
		fontWeight: "bold",
		marginLeft: 6,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 40,
		marginTop: 100,
	},
	bookButton: {
		backgroundColor: Colors.tint,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 12,
	},
	bookButtonText: {
		color: "#FFFFFF",
		fontSize: 16,
		fontWeight: "bold",
	},
});