import React, { useState, useEffect, useCallback } from "react";
import { Topbar } from "../../global/Topbar";
import { Sidebar } from "../../global/Sidebar";
import {
	Grid,
	Box,
	Typography,
	TextField,
	Button,
	Avatar,
	CircularProgress,
	useTheme,
} from "@mui/material";
import axios from "axios";
import { useMode } from "../../../theme";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
	const [userData, setUserData] = useState(null);
	const [teamData, setTeamData] = useState(null);
	const [editMode, setEditMode] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [teamid, setTeamid] = useState("");
	const [userId, setUserId] = useState("");
	const [colorMode] = useMode();
	const navigate = useNavigate();
	const [teamName, setTeamName] = useState("");
	const [generatedTeamName, setGeneratedTeamName] = useState("");
	const [showCreateButton, setShowCreateButton] = useState(true);
	const [showGenerateButton, setShowGenerateButton] = useState(false);
	const [userStatistics, setUserStatistics] = useState(null);

	useEffect(() => {
		try {
			setTeamid(sessionStorage.getItem("team_id"));
		} catch (error) {
			console.error(
				"Error occurred while retrieving 'team_id' from session storage:",
				error
			);
			sessionStorage.removeItem("user_id");
			navigate("/");
		}
	}, [navigate]);

	const USER_API_URL =
		"https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/user";
	const TEAM_API_URL =
		"https://us-central1-trivia-game-5410.cloudfunctions.net/GetTeamDetails";

	useEffect(() => {
		try {
			setUserId(sessionStorage.getItem("user_id"));
		} catch (error) {
			console.error(
				"Error occurred while retrieving 'user_id' from session storage:",
				error
			);
			sessionStorage.removeItem("team_id");
			navigate("/");
		}

		if (userId) {
			fetchUserData(userId);
		}

		// Fetch team data only if there is a valid teamid
		if (teamid) {
			fetchTeamData(teamid);
		}
	}, [userId, teamid]);

	const fetchUserData = useCallback(async (userId) => {
		try {
			setLoading(true);
			const response = await axios.get(`${USER_API_URL}/${userId}`);
			const data = response.data;

			if (!data) {
				throw new Error("Invalid API response format");
			}

			setUserData(data);
			console.log(data);

			if (data.TeamId) {
				fetchTeamData(teamid);
			} else {
				setTeamData(null);
			}
			if (data.username) {
				console.log(data.username);
				fetchUserStatistics(data.username);
			}
			setLoading(false);
		} catch (error) {
			setError("Error fetching user data");
			setLoading(false);
		}
	}, []);

	const fetchTeamData = useCallback(async (teamId) => {
		try {
			setLoading(true);
			const response = await axios.get(`${TEAM_API_URL}?teamId=${teamId}`);
			const data = response.data;

			if (!data) {
				throw new Error("Invalid API response format");
			}

			setTeamData(data);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	}, []);

	const handleEditClick = () => {
		setEditMode(true);
	};

	const handleSaveClick = useCallback(async () => {
		userData.user_id = parseInt(userData.user_id);
		try {
			setLoading(true);
			const response = await axios.post(
				`${USER_API_URL}/${userData.user_id}`,
				userData
			);
			if (response.status === 200) {
				setEditMode(false);
			}
			setLoading(false);
		} catch (error) {
			setError("Error updating user data");
			setLoading(false);
		}
	}, [userData]);

	const handleGenerateTeamName = useCallback(async () => {
		try {
			setLoading(true);
			const response = await axios.get(
				"https://us-central1-trivia-game-5410.cloudfunctions.net/GenerateTeamName"
			);
			const generatedName = response.data.RandomTeamName;
			setGeneratedTeamName(generatedName);
			setShowCreateButton(true);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	}, []);

	const handleCreateTeam = useCallback(async () => {
		if (!showGenerateButton) {
			setShowGenerateButton(true);
			setShowCreateButton(false);
		} else {
			try {
				setLoading(true);
				// Make API call to create the team with the generated team name
				const response = await axios.post(
					"https://us-central1-trivia-game-5410.cloudfunctions.net/TeamSetDataTest",
					{
						Name: generatedTeamName,
						AdminId: userId,
						Points: 0,
						TotalNoOfQuestions: 0,
						NoOfAnswersCorrect: 0,
						NoOfAnswersWrong: 0,
						NoOfGamesParticipated: 0,
						NoOfGamesWon: 0,
						NoOfGamesLost: 0,
						Achievements: [],
						GameIds: [],
						TeamMembers: [],
					}
				);

				setLoading(false);

				// Store the team ID in session storage
				const teamId = response.data.teamId;
				sessionStorage.setItem("team_id", teamId);
				setTeamid(teamId);
				await axios.post(
					"https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/set-team",
					{
						userid: parseInt(userId),
						teamid: parseInt(teamId),
					}
				);
				fetchTeamData(teamId);

				// Display a success message as an alert
				alert("Team created successfully!");

				// Redirect to the team page or perform any other necessary actions
				navigate("/user-profile");
			} catch (error) {
				console.error(error);
				setLoading(false);
			}
		}
	}, [generatedTeamName, userId, navigate]);

	const fetchUserStatistics = async (userName) => {
		try {
			setLoading(true);
			// Make a POST API call to fetch user state data
			const payload = {
				entity_type: "player",
				entity_name: userName,
			};
			const response = await axios.post(
				"https://us-central1-serverless-project-390701.cloudfunctions.net/get-user-state",
				payload
			);
			const data = response.data;
			if (!data) {
				throw new Error("Invalid API response format");
			}
			setUserStatistics(data);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	return (
		<>
			<Topbar />
			<Grid container>
				<Grid item xs={4} md={4} lg={4}>
				</Grid>
				<Grid item xs={4} md={4} lg={4}>
					{loading ? (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								marginTop: "20px",
							}}
						>
							<CircularProgress />
						</Box>
					) : error ? (
						<Box
							sx={{
								display: "flex",
								justifyContent: "center",
								marginTop: "20px",
							}}
						>
							<Typography color='error'>{error}</Typography>
						</Box>
					) : (
						userData && (
							<Box sx={{ padding: "20px" }}>
								<Box
									sx={{
										display: "flex",
										alignItems: "center",
										margin: "20px",
									}}
								>
									<Avatar
										sx={{
											width: 100,
											height: 100,
											marginRight: "20px",
										}}
										src={userData.profilePictureUrl}
										alt='Profile Picture'
									/>
									<div>
										<Typography variant='h5'>{userData.username}</Typography>
										<Typography variant='h6'>
											Email: {userData.email}
										</Typography>
									</div>
								</Box>

								{editMode ? (
									<>
										<Box sx={{ margin: "10px" }}>
											<TextField
												label='Username'
												variant='outlined'
												fullWidth
												value={userData.username}
												onChange={(e) =>
													setUserData((prevData) => ({
														...prevData,
														username: e.target.value,
													}))
												}
											/>
										</Box>
										<Box sx={{ margin: "10px" }}>
											<TextField
												label='Email'
												variant='outlined'
												fullWidth
												value={userData.email}
												onChange={(e) =>
													setUserData((prevData) => ({
														...prevData,
														email: e.target.value,
													}))
												}
											/>
										</Box>
										<Box sx={{ display: "flex", justifyContent: "center" }}>
											<Button
												variant='contained'
												color='primary'
												onClick={handleSaveClick}
											>
												Save
											</Button>
										</Box>
									</>
								) : (
									<>
										<Box sx={{ display: "flex", justifyContent: "center" }}>
											<Button
												variant='contained'
												onClick={handleEditClick}
												color='primary'
											>
												Edit Profile
											</Button>
										</Box>
									</>
								)}

								{userData && teamData === null && (
									<Box sx={{ padding: "20px" }}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												margin: "20px",
											}}
										>
											<div>
												<Typography variant='h2'>Team</Typography>
												<Typography variant='h5'>
													Not associated with any team
												</Typography>

												{generatedTeamName && (
													<>
														<Typography variant='h4' sx={{ marginTop: "10px" }}>
															<strong>Generated Team Name:</strong>{" "}
															{generatedTeamName}
														</Typography>
													</>
												)}
												{showGenerateButton && (
													<Box
														sx={{
															display: "flex",
															justifyContent: "center",
															marginTop: "20px",
														}}
													>
														<Button
															variant='contained'
															color='secondary'
															onClick={handleGenerateTeamName}
														>
															Generate Team Name
														</Button>
													</Box>
												)}
												{showCreateButton && (
													<Box
														sx={{
															display: "flex",
															justifyContent: "center",
															marginTop: "10px",
														}}
													>
														<Button
															variant='contained'
															color='primary'
															onClick={handleCreateTeam}
														>
															Create Team
														</Button>
													</Box>
												)}
											</div>
										</Box>
									</Box>
								)}

								{userData && teamData !== null && (
									<Box sx={{ margin: "20px" }}>
										<Typography variant='h2'>Team</Typography>
										<Box sx={{ margin: "10px" }}>
											<Typography variant='h4'>Team Name:</Typography>
											<Typography variant='h6'>
												{teamData.TeamDetails.TeamName}
											</Typography>
										</Box>
										<Box sx={{ margin: "10px" }}>
											<Typography variant='h4'>Points:</Typography>
											<Typography variant='h6'>
												{teamData.TeamDetails.Points}
											</Typography>
										</Box>
										<Box sx={{ margin: "10px" }}>
											<Typography variant='h4'>Admin ID:</Typography>
											<Typography variant='h6'>
												{teamData.TeamDetails.AdminId}
											</Typography>
										</Box>
										<Box sx={{ marginTop: "20px" }}>
											<Typography variant='h5'>Achievements:</Typography>
											{teamData.TeamDetails.Achievements.map(
												(achievement, index) => (
													<Typography key={index} variant='h6'>
														{achievement.Achievement}
													</Typography>
												)
											)}
										</Box>
										<Box
											sx={{
												display: "flex",
												justifyContent: "center",
												marginTop: "20px",
											}}
										>
											<Button
												variant='contained'
												color='secondary'
												onClick={() => {
													navigate("/team-profile");
												}}
											>
												More Team Info
											</Button>
										</Box>
									</Box>
								)}
								
								{/* Display user statistics */}
								<Box sx={{ margin: "20px" }}>
									<Typography variant='h2'>User Statistics</Typography>
									<Box sx={{ margin: "10px" }}>
										<Typography variant='h4'>Total Score:</Typography>
										<Typography variant='h4'>
											{userStatistics ? userStatistics.score : 0}
										</Typography>
									</Box>
									<Box sx={{ margin: "10px" }}>
										<Typography variant='h4'>Total Right Answer:</Typography>
										<Typography variant='h4'>
											{userStatistics ? userStatistics.right_answers : 0}
										</Typography>
									</Box>
									<Box sx={{ margin: "10px" }}>
										<Typography variant='h4'>Total Wrong Answers:</Typography>
										<Typography variant='h4'>
											{userStatistics ? userStatistics.wrong_answers : 0}
										</Typography>
									</Box>
									<Box
											sx={{
												display: "flex",
												justifyContent: "center",
												marginTop: "20px",
											}}
										>
											<Button
												variant='contained'
												color='secondary'
												onClick={() => {
													navigate("/leaderboard");
												}}
											>
												More state Info
											</Button>
										</Box>
								</Box>
							</Box>
						)
					)}
				</Grid>
			</Grid>
		</>
	);
};

export default UserProfile;
