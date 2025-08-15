import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	View,
	TextInput,
	Alert,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../lib/auth";
import { Colors } from "@/constants/Colors";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../../lib/axios";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";

const ProfileSchema = z
	.object({
		name: z.string().min(1, "Name is required"),
		email: z.string().email("Invalid email address"),
		currentPassword: z.string().optional(),
		newPassword: z.string().optional(),
	})
	.refine(
		(data) => {
			if (data.newPassword) {
				return data.currentPassword && data.newPassword.length >= 6;
			}
			return true;
		},
		{
			message: "Current password and new password (min 6 chars) are required to change password.",
			path: ["newPassword"],
		}
	);

type ProfileFormInputs = z.infer<typeof ProfileSchema>;

export default function ProfileScreen() {
	const { signOut } = useAuthStore();
	const queryClient = useQueryClient();

	const [isEditing, setIsEditing] = useState(false);

	const { data: userProfile, isLoading, isError, error } = useQuery<ProfileFormInputs, Error>({
		queryKey: ["userProfile"],
		queryFn: async () => {
			const response = await axiosInstance.get("/auth/profile");
			return response.data.user;
		},
	});

	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
		reset,
	} = useForm<ProfileFormInputs>({
		resolver: zodResolver(ProfileSchema),
		values: userProfile || { name: "", email: "" },
	});

	useEffect(() => {
		if (userProfile) {
			reset(userProfile);
		}
	}, [userProfile, reset]);

	const updateProfileMutation = useMutation({
		mutationFn: (data: ProfileFormInputs) => {
			return axiosInstance.put("/auth/profile", data);
		},
		onSuccess: (response) => {
			Alert.alert("Success", response.data.message || "Profile updated successfully!");
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			reset({
				...userProfile,
				currentPassword: "",
				newPassword: "",
			});
			setIsEditing(false);
		},
		onError: (err: any) => {
			console.error("Profile update error:", err.response?.data || err);
			Alert.alert(
				"Update Failed",
				err.response?.data?.message || "An error occurred during update."
			);
		},
	});

	const onSubmit = async (data: ProfileFormInputs) => {
		updateProfileMutation.mutate(data);
	};

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
				<ThemedText type="subtitle">Error loading profile:</ThemedText>
				<ThemedText>{error?.message}</ThemedText>
			</ThemedView>
		);
	}

	return (
		<SafeAreaView style={styles.safeArea}>
			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContentContainer}
			>
				<ThemedText type="title" style={styles.pageTitle}>My Profile</ThemedText>

				<View style={styles.formContainer}>
					{!isEditing ? (
						<View>
							<ThemedText style={styles.label}>Name</ThemedText>
							<ThemedText style={styles.displayValue}>{userProfile?.name}</ThemedText>

							<ThemedText style={styles.label}>Email</ThemedText>
							<ThemedText style={styles.displayValue}>{userProfile?.email}</ThemedText>

							<TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
								<Ionicons name="pencil-outline" size={20} color="#FFFFFF" />
								<ThemedText style={styles.editButtonText}>Edit Profile</ThemedText>
							</TouchableOpacity>
						</View>
					) : (
						<View>
							<ThemedText style={styles.label}>Name</ThemedText>
							<Controller
								control={control}
								name="name"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={styles.input}
										onChangeText={onChange}
										onBlur={onBlur}
										value={value}
										placeholder="Your Name"
										placeholderTextColor={Colors.icon}
									/>
								)}
							/>
							{errors.name && (
								<ThemedText style={styles.errorText}>{errors.name.message}</ThemedText>
							)}

							<ThemedText style={styles.label}>Email</ThemedText>
							<Controller
								control={control}
								name="email"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={styles.input}
										onChangeText={onChange}
										onBlur={onBlur}
										value={value}
										placeholder="Your Email"
										placeholderTextColor={Colors.icon}
										keyboardType="email-address"
										autoCapitalize="none"
									/>
								)}
							/>
							{errors.email && (
								<ThemedText style={styles.errorText}>{errors.email.message}</ThemedText>
							)}

					<ThemedText type="subtitle" style={styles.passwordSectionTitle}>Change Password</ThemedText>
          <ThemedText style={styles.passwordDescription}>
            input same password if you do not want to change
           </ThemedText>

							<ThemedText style={styles.label}>Current Password</ThemedText>
							<Controller
								control={control}
								name="currentPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={styles.input}
										onChangeText={onChange}
										onBlur={onBlur}
										value={value}
										placeholder="Current Password"
										placeholderTextColor={Colors.icon}
										secureTextEntry
									/>
								)}
							/>
							{errors.currentPassword && (
								<ThemedText style={styles.errorText}>{errors.currentPassword.message}</ThemedText>
							)}

							<ThemedText style={styles.label}>New Password</ThemedText>
							<Controller
								control={control}
								name="newPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={styles.input}
										onChangeText={onChange}
										onBlur={onBlur}
										value={value}
										placeholder="New Password (min 6 characters)"
										placeholderTextColor={Colors.icon}
										secureTextEntry
									/>
								)}
							/>
							{errors.newPassword && (
								<ThemedText style={styles.errorText}>{errors.newPassword.message}</ThemedText>
							)}

							<TouchableOpacity
								style={[
									styles.saveButton,
									isSubmitting && styles.saveButtonDisabled,
								]}
								onPress={handleSubmit(onSubmit)}
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<ActivityIndicator color="#FFFFFF" />
								) : (
									<ThemedText style={styles.saveButtonText}>Save Changes</ThemedText>
								)}
							</TouchableOpacity>
							<TouchableOpacity style={styles.cancelEditButton} onPress={() => setIsEditing(false)}>
								<ThemedText style={styles.cancelEditButtonText}>Cancel</ThemedText>
							</TouchableOpacity>
						</View>
					)}
				</View>

				<TouchableOpacity style={styles.logoutButton} onPress={signOut}>
					<Ionicons name="log-out-outline" size={24} color="#FFFFFF" />
					<ThemedText style={styles.logoutButtonText}>Logout</ThemedText>
				</TouchableOpacity>
			</ScrollView>
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
		paddingBottom: 40,
	},
	pageTitle: {
		marginBottom: 24,
		textAlign: "center",
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
	formContainer: {
		backgroundColor: Colors.card,
		borderRadius: 16,
		padding: 20,
		marginBottom: 24,
		borderWidth: 1,
		borderColor: Colors.border,
	},
	label: {
		fontSize: 16,
		fontWeight: "600",
		marginBottom: 8,
		color: Colors.text,
	},
	displayValue: {
		fontSize: 16,
		color: Colors.textSecondary,
		marginBottom: 16,
		paddingVertical: 12,
		paddingHorizontal: 16,
		backgroundColor: Colors.inputBackground,
		borderRadius: 12,
	},
	input: {
		height: 50,
		borderWidth: 1,
		borderColor: Colors.border,
		backgroundColor: Colors.inputBackground,
		borderRadius: 12,
		paddingHorizontal: 16,
		fontSize: 16,
		color: Colors.text,
		marginBottom: 16,
	},
	errorText: {
		color: "red",
		fontSize: 12,
		marginBottom: 16,
		marginTop: -10,
	},
	passwordSectionTitle: {
    marginTop: 20,
    marginBottom: 16,
    color: Colors.text,
},
  	passwordDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    textAlign: "left",
},
	saveButton: {
		backgroundColor: Colors.tint,
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		marginTop: 20,
	},
	saveButtonDisabled: {
		backgroundColor: "#a0a0a0",
	},
	saveButtonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "bold",
	},
	logoutButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#ff3b30",
		padding: 16,
		borderRadius: 12,
		marginTop: 20,
	},
	logoutButtonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "bold",
		marginLeft: 10,
	},
	editButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: Colors.tint,
		padding: 16,
		borderRadius: 12,
		marginTop: 20,
	},
	editButtonText: {
		color: "#FFFFFF",
		fontSize: 18,
		fontWeight: "bold",
		marginLeft: 10,
	},
	cancelEditButton: {
		marginTop: 10,
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
		backgroundColor: Colors.inputBackground,
		borderColor: Colors.border,
		borderWidth: 1,
	},
	cancelEditButtonText: {
		color: Colors.text,
		fontSize: 18,
		fontWeight: "bold",
	},
});