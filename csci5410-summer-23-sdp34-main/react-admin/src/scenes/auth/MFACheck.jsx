import {
	Box,
	Button,
	CssBaseline,
	Grid,
	TextField,
	ThemeProvider,
	Typography,
	useTheme,
} from "@mui/material";
import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ColorModeContext } from "../../theme";
import { registerVersion } from "firebase/app";

export const MFACheck = () => {
	const theme = useTheme();
	const colorMode = useContext(ColorModeContext);
	const navigate = useNavigate();

	const [email, setEmail] = useState("");
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [showResult, setShowResult] = useState(false);
	const [isCorrect, setIsCorrect] = useState(false);
	const [question_number, setQuestionNumber] = useState(1);

	useEffect(() => {
		// Retrieve email from local storage
		const storedEmail = localStorage.getItem("LoginData");
		if (storedEmail) {
			setEmail(storedEmail);
			// Call API to get the first question
			getQuestion(storedEmail);
		} else {
			navigate("/"); // Redirect to login if email is not found in local storage
		}
	}, [navigate]);

	const getQuestion = async (email) => {
		try {
			const response = await axios.get(
				`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/get-question/1?email=${encodeURIComponent(
					email
				)}`
			);
			if (response.status === 200) {
				setQuestion(response.data.question);
				setShowResult(false);
			}
		} catch (error) {
			console.error("Error occurred while fetching question:", error);
		}
	};

	const isAnswerValid = (answer) => {
		return answer.length >= 4;
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (!isAnswerValid(answer)) {
			alert("Answers must be at least 4 characters long");
			return;
		}

		try {
			// Call API to check the answer
			const response = await axios.post(
				`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/get-question/${question_number}?email=${encodeURIComponent(
					email
				)}`,
				{
					answer: answer,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
				}
			);

			if (response.status === 200) {
				setShowResult(true);
				setIsCorrect(response.data.reasult);
				if (response.data.reasult) {
					handleLoginSuccess(response);
				} else {
					if (question_number < 3) {
						setQuestionNumber(question_number + 1);
						getQuestion(email);
					} else {
						navigate("/");
					}
				}
			}
		} catch (error) {
			console.error("Error occurred during answer validation:", error);
		}
	};

	const handleLoginSuccess = (response) => {
		// Save user name and team ID in session storage
		sessionStorage.setItem("user_id", response.data.user_id);
		sessionStorage.setItem("team_id", response.data.team_id);
		alert("Login Sucessfull")
		// Redirect to dashboard
		navigate("/userdashboard");
	};

	const handleCancel = () => {
		navigate("/");
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
								Self Identification Questions
							</Typography>
							{showResult ? (
								<Typography variant='h4' textAlign='center'>
									{isCorrect ? "Correct" : "False"}
								</Typography>
							) : (
								<>
									<Typography variant='h5' textAlign='center'>
										{question}
									</Typography>
									<TextField
										label='Answer'
										value={answer}
										onChange={(event) => setAnswer(event.target.value)}
										sx={{ width: "100%" }}
									/>
								</>
							)}
							<Box
								sx={{
									display: "flex",
									justifyContent: "space-evenly",
									width: "100%",
								}}
							>
								{!showResult ? (
									<Button variant='contained' onClick={handleSubmit}>
										Check
									</Button>
								) : (
									<Button
										variant='contained'
										onClick={() => setShowResult(false)}
									>
										Next Question
									</Button>
								)}
								<Button variant='contained' onClick={handleCancel}>
									Cancel
								</Button>
							</Box>
						</Box>
					</Grid>
				</Grid>
			</ThemeProvider>
		</ColorModeContext.Provider>
	);
};
