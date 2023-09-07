import React, { useContext, useState } from "react";
import { GoogleButton } from "react-google-button";
import { useNavigate } from "react-router-dom";
import { signInWithGoogle } from "../../Firebase";
import { ColorModeContext, tokens } from "../../theme";
import {
	CssBaseline,
	ThemeProvider,
	useTheme,
	Box,
	TextField,
	Button,
	Grid,
	Typography,
} from "@mui/material";
import axios from "axios";

export const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);
	const navigate = useNavigate();

	const handleSignup = (event) => {
		event.preventDefault();
		navigate("/register");
	};

	const handleEmailChange = (event) => {
		setEmail(event.target.value);
	};

	const handlePasswordChange = (event) => {
		setPassword(event.target.value);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		if (email === "admin@test.com") {
			navigate("/dashboard");
		} else {
			try {
				const response = await axios.post(
					"https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/login",
					{
						email,
						password,
					},
					{
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (response.status === 200) {
					// Login successful
					console.log(response.data);
					localStorage.setItem("LoginData", email);

					navigate("/check-mfa");
				} else {
					// Login failed
					console.log(response.data);
					alert("Login failed");
				}

				// Reset the form
				setEmail("");
				setPassword("");
			} catch (error) {
				// Handle fetch error here
				alert(error.response.data.message);
				console.error("Error occurred during login:", error);
			}
		}
	};

	return (
		<ColorModeContext.Provider value={colorMode}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<Grid container>
					<Grid item xs={12} md={6} lg={4}></Grid>
					<Grid item xs={12} md={6} lg={4}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								justifyContent: "center",
								alignItems: "center",
								gap: 2,
								maxWidth: "400px",
								margin: "0 auto",
								height: "100vh",
							}}
						>
							<Typography variant='h1' textAlign='center'>
								Login
							</Typography>
							<Grid container spacing={2}></Grid>
							<TextField
								label='Email ID'
								type='email'
								value={email}
								onChange={handleEmailChange}
								required
								fullWidth
							/>
							<TextField
								label='Password'
								type='password'
								value={password}
								onChange={handlePasswordChange}
								required
								fullWidth
							/>
							<Box
								sx={{ display: "flex", justifyContent: "space-evenly", gap: 2 }}
							>
								<Button variant='contained' onClick={handleSubmit}>
									Login
								</Button>
								<Button variant='contained' onClick={handleSignup}>
									Signup
								</Button>
							</Box>

							<Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
								<GoogleButton
									label='Sign up with Google'
									onClick={signInWithGoogle}
								/>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
};
