import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "expo-router";
import axiosInstance from "../../lib/axios";
import { useAuthStore } from "../../lib/auth";
import { Colors } from "@/constants/Colors";

const RegisterSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormInputs = z.infer<typeof RegisterSchema>;

export default function RegisterScreen() {
  const { signIn } = useAuthStore();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const response = await axiosInstance.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      const { accessToken, refreshToken } = response.data;
      await signIn({ accessToken, refreshToken });
      Alert.alert("Registration Successful", "You have been successfully registered!");
    } catch (error: any) {
      console.log("Registration error:", error);
      console.log("Error response data:", error.response?.data);
      let errorMessage = "An unexpected error occurred.";      if (error.response?.data?.message) {        if (Array.isArray(error.response.data.message)) {          errorMessage = error.response.data.message.join("\n");        } else {          errorMessage = error.response.data.message;        }      }      Alert.alert("Registration Failed", errorMessage);
    }
  };

  return (
		<ThemedView style={styles.container}>
			<ThemedText
				type="title"
				style={[styles.title, { color: Colors.text }]}>
				Register
			</ThemedText>

			<Controller
				control={control}
				name="name"
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
						placeholder="Name"
						placeholderTextColor={Colors.icon}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
						autoCapitalize="words"
					/>
				)}
			/>
			{errors.name && (
				<ThemedText style={styles.errorText}>{errors.name.message}</ThemedText>
			)}

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

			<Controller
				control={control}
				name="confirmPassword"
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
						placeholder="Confirm Password"
						placeholderTextColor={Colors.icon}
						onBlur={onBlur}
						onChangeText={onChange}
						value={value}
						secureTextEntry
					/>
				)}
			/>
			{errors.confirmPassword && (
				<ThemedText style={styles.errorText}>
					{errors.confirmPassword.message}
				</ThemedText>
			)}

			<ThemedView style={styles.buttonContainer}>
				<Button
					onPress={handleSubmit(onSubmit)}
					title={isSubmitting ? "Registering..." : "Register"}
					disabled={isSubmitting}
					color={Colors.tint}
				/>
			</ThemedView>
			{isSubmitting && <ActivityIndicator style={styles.activityIndicator} />}

			<Link href="/(auth)/login" style={styles.link}>
				<ThemedText type="link" style={{ color: Colors.text }}>
					Already have an account?{" "}
					<ThemedText style={{ color: Colors.tint, fontWeight: "bold" }}>
						Login here.
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
    marginTop: 20,
    textAlign: "center",
  },
  buttonContainer: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10, 
  },
});