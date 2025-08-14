import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
	TextInput,
	Button,
	StyleSheet,
	ActivityIndicator,
	Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import axiosInstance from "../../lib/axios";
import { useAuthStore } from "../../lib/auth";
import { Colors } from "@/constants/Colors";

const LoginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof LoginSchema>;

export default function LoginScreen() {
	const { signIn } = useAuthStore();
	const {
		control,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<LoginFormInputs>({
		resolver: zodResolver(LoginSchema),
	});

	const onSubmit = async (data: LoginFormInputs) => {
		try {
			const response = await axiosInstance.post("/auth/login", data);
			const { accessToken, refreshToken } = response.data;
			await signIn({ accessToken, refreshToken });
			Alert.alert("Login Successful", "You have been successfully logged in!");
		} catch (error: any) {
			let errorMessage = "An unexpected error occurred.";
			if (error.response?.data?.message) {
				if (Array.isArray(error.response.data.message)) {
					errorMessage = error.response.data.message.join("\n");
				} else {
					errorMessage = error.response.data.message;
				}
			}
			Alert.alert("Login Failed", errorMessage);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedText
				type="title"
				style={[styles.title, { color: Colors.text }]}>
				Login
			</ThemedText>

			<Controller
				control={control}
				name="email"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						style={[
							styles.input,
							{
								borderColor: Colors.border,
								backgroundColor: Colors.inputBackground,
								color: Colors.text,
							},
						]}

						placeholder="Email"
						placeholderTextColor={Colors.icon}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
						keyboardType="email-address"
						autoCapitalize="none"
					/>
				)}
			/>
			{errors.email && (
				<ThemedText style={styles.errorText}>{errors.email.message}</ThemedText>
			)}

			<Controller
				control={control}
				name="password"
				render={({ field: { onChange, onBlur, value } }) => (
					<TextInput
						style={[
							styles.input,
							{
								borderColor: Colors.border,
								backgroundColor: Colors.inputBackground,
								color: Colors.text,
							},
						]}
						placeholder="Password"
						placeholderTextColor={Colors.icon}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
						secureTextEntry
					/>
				)}
			/>
			{errors.password && (
				<ThemedText style={styles.errorText}>
					{errors.password.message}
				</ThemedText>
			)}

			<ThemedView style={styles.buttonContainer}>
				<Button
					onPress={handleSubmit(onSubmit)}
					title={isSubmitting ? "Logging in..." : "Login"}
					disabled={isSubmitting}
					color={Colors.tint}
				/>
			</ThemedView>
			{isSubmitting && <ActivityIndicator style={styles.activityIndicator} />}

			<Link href="/(auth)/register" style={styles.link}>
				<ThemedText type="link" style={{ color: Colors.text }}>
					Don't have an account?{" "}
					<ThemedText style={{ color: Colors.tint, fontWeight: "bold" }}>
						Register here.
					</ThemedText>
				</ThemedText>
			</Link>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 20,
		backgroundColor: Colors.background,
	},
	title: {
		marginBottom: 20,
		textAlign: "center",
		fontSize: 28,
		fontWeight: "bold",
	},
	input: {
		height: 50,
		borderWidth: 1,
		marginBottom: 15,
		paddingHorizontal: 15,
		borderRadius: 10,
		fontSize: 16,
	},
	errorText: {
		color: "red",
		marginBottom: 10,
		textAlign: "center",
	},
	activityIndicator: {
		marginTop: 10,
	},
	link: {
		marginTop: 10,
		textAlign: "center",
	},
	buttonContainer: {
		borderRadius: 10,
		overflow: "hidden", 
		marginTop: 10, 
	},
});