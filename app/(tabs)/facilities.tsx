import { useState, memo } from "react";
import {
	StyleSheet,
	FlatList,
	TextInput,
	ActivityIndicator,
	TouchableOpacity,
	View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import StatusBadge from "@/components/StatusBadge";
import axiosInstance from "@/lib/axios";
import { Link } from "expo-router";
import { Colors } from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";

interface Facility {
	id: number;
	name: string;
	description: string;
	status: "active" | string;
	maxCapacity: number;
	maxAdvanceBookingDays: number;
	createdAt: string;
	updatedAt: string;
}

const FacilityCard = memo(
	({
		item,
	}: {
		item: Facility;
	}) => {
		return (
			<Link href={`/facilities/${item.id}`} asChild>
				<TouchableOpacity
					style={[
						styles.cardContainer,
						{ backgroundColor: Colors.card },
					]}
				>
					<View style={styles.cardHeader}>
						<ThemedText
							type="subtitle"
							style={[styles.cardTitle, { color: Colors.text }]}>
							{item.name}
						</ThemedText>
						<StatusBadge status={item.status} />
					</View>
					<ThemedText
						style={[
							styles.cardDescription,
							{ color: Colors.textSecondary },
						]}
						numberOfLines={2}
					>
						{item.description}
					</ThemedText>
					<View style={styles.cardFooter}>
						<ThemedText
							style={[
								styles.cardInfo,
								{ color: Colors.textSecondary },
							]}
						>
							<Ionicons
								name="people-outline"
								size={14}
								color={Colors.icon}
							/>{" "}
							Max {item.maxCapacity} people
						</ThemedText>
					</View>
				</TouchableOpacity>
			</Link>
		);
	}
);

FacilityCard.displayName = "FacilityCard";

export default function FacilitiesScreen() {
	const [search, setSearch] = useState("");

	const { data: facilities, isLoading, isError, error } = useQuery<Facility[], Error>({
		queryKey: ["facilities", search],
		queryFn: async () => {
			const response = await axiosInstance.get(`/facilities?search=${search}`);
			return response.data;
		},
		staleTime: 1000 * 60 * 5,
		placeholderData: [],
	});

	const renderSeparator = () => (
		<View
			style={[
				styles.separator,
				{ backgroundColor: Colors.border },
			]}
		/>
	);

	return (
		<SafeAreaView
			style={[
				styles.container,
				{ backgroundColor: Colors.background },
			]}
		>
			<View
				style={[
					styles.searchContainer,
					{
						backgroundColor: Colors.card,
						borderColor: Colors.border,
					},
				]}
			>
				<Ionicons
					name="search"
					size={20}
					color={Colors.icon}
					style={styles.searchIcon}
				/>
				<TextInput
					style={[styles.searchInput, { color: Colors.text }]}
					placeholder="Search facilities..."
					placeholderTextColor={Colors.icon}
					value={search}
					onChangeText={setSearch}
				/>
			</View>

			{isLoading && !facilities ? (
				<View style={styles.loaderContainer}>
					<ActivityIndicator size="large" color={Colors.tint} />
				</View>
			) : isError ? (
				<View style={styles.loaderContainer}>
					<ThemedText>Error loading facilities: {error?.message}</ThemedText>
				</View>
			) : (
				<FlatList<Facility>
					data={facilities || []}
					renderItem={({ item }) => (
						<FacilityCard item={item} />
					)}
					keyExtractor={(item) => item.id.toString()}
					style={styles.list}
					contentContainerStyle={{ paddingBottom: 20 }}
					ItemSeparatorComponent={renderSeparator}
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
	},
	pageTitle: {
		paddingBottom: 10,
		paddingTop: 10,
	},
	searchContainer: {
		flexDirection: "row",
		alignItems: "center",
		borderRadius: 12,
		height: 50,
		paddingHorizontal: 15,
		marginBottom: 20,
		borderWidth: 1,
	},
	searchIcon: {
		marginRight: 10,
	},
	searchInput: {
		flex: 1,
		height: "100%",
		fontSize: 16,
		borderWidth: 0,
	},
	loaderContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	list: {
		width: "100%",
	},
	cardContainer: {
		padding: 20,
		borderRadius: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.05,
		shadowRadius: 12,
		elevation: 5,
	},
	cardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		marginBottom: 8,
	},
	cardTitle: {
		flex: 1,
		marginRight: 10,
	},
	cardDescription: {
		fontSize: 14,
		lineHeight: 20,
		marginBottom: 12,
	},
	cardFooter: {
		flexDirection: "row",
		alignItems: "center",
	},
	cardInfo: {
		fontSize: 12,
		flexDirection: "row",
		alignItems: "center",
	},
	badgeContainer: {
		borderRadius: 20,
		paddingVertical: 4,
		paddingHorizontal: 10,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: "600",
	},
	separator: {
		height: 1,
		marginVertical: 8,
	},
});