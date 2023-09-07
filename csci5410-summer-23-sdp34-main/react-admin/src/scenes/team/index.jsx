import React, { useEffect, useState } from "react";
import {
	Box,
	CircularProgress,
	Grid,
	Typography,
	Button,
	FormControl,
	Select,
	MenuItem,
	TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Sidebar } from "../global/Sidebar";
import { Topbar } from "../global/Topbar";
import { useMode } from "../../theme";

export const TeamsPage = () => {
	const [teamData, setTeamData] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [teamId, setTeamId] = useState("");
	const [userId, setUserId] = useState("");
	const [teamStatistics, setTeamStatistics] = useState(null);

	const [colorMode] = useMode();
	const navigate = useNavigate();

	useEffect(() => {
		try {
			setTeamId(parseInt(sessionStorage.getItem("team_id")));
		} catch (error) {
			console.error(
				"Error occurred while retrieving 'team_id' from session storage:",
				error
			);
			sessionStorage.removeItem("team_id");
			navigate("/");
		}
	}, [navigate]);

	useEffect(() => {
		try {
			setUserId(parseInt(sessionStorage.getItem("user_id")));
		} catch (error) {
			console.error(
				"Error occurred while retrieving 'user_id' from session storage:",
				error
			);
			sessionStorage.removeItem("user_id");
			navigate("/");
		}
	}, [navigate]);

	const [isAdmin, setIsAdmin] = useState(false); // Add this state variable

	useEffect(() => {
		const fetchAndSetTeamData = async () => {
			try {
				if (teamId) {
					setLoading(true);
					const data = await fetchTeamData(teamId);
					setTeamData(data);
					setLoading(false);

					// Check if the current user is an admin
					if (data && parseInt(data.AdminId) === userId) {
						setIsAdmin(true);
					} else {
						setIsAdmin(false);
					}
				}
			} catch (error) {
				setError(error.message);
				setLoading(false);
			}
		};

		fetchAndSetTeamData();
	}, [teamId, userId]);

	const [userDetails, setUserDetails] = useState([]);

	const fetchTeamData = async (teamId) => {
		// Check if teamId is null or undefined
		if (teamId) {
			try {
				setLoading(true);
				const response = await axios.get(
					`https://us-central1-trivia-game-5410.cloudfunctions.net/GetTeamDetails?teamId=${teamId}`
				);
				const data = response.data.TeamDetails;

				if (!data) {
					throw new Error("Invalid API response format");
				}
				fetchUserStatistics(data.TeamName);
				return data;
			} catch (error) {
				console.log(error);
				throw new Error("Failed to fetch team data");
			}
		}
	};

	const fetchUserDetails = async (userId) => {
		// Check if userId is null or undefined
		if (userId) {
			try {
				setLoading(true);
				const response = await axios.get(
					`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/user/${userId}`
				);
				const data = response.data;

				if (!data) {
					throw new Error("Invalid API response format");
				}

				return data;
			} catch (error) {
				console.log(error);
				throw new Error("Failed to fetch user details");
			}
		}
	};

	const fetchUserDetailsForMembers = async () => {
		try {
			setLoading(true);
			const promises = teamData.TeamMembers.map(async (memberId) => {
				const userData = await fetchUserDetails(memberId);
				return userData;
			});

			const userDetailsArray = await Promise.all(promises);
			setUserDetails(userDetailsArray);
			setLoading(false);
		} catch (error) {
			console.error("Error fetching user details for members:", error);
			setLoading(false);
		}
	};

	useEffect(() => {
		if (teamData && teamData.TeamMembers) {
			fetchUserDetailsForMembers();
		}
	}, [teamData]);

	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteStatus, setInviteStatus] = useState(null);

	const handleInvite = async () => {
		try {
			const response = await axios.get(
				`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/user-id?email=${inviteEmail}`
			);

			if (response.status === 200) {
				const inviteData = {
					RecieverId: parseInt(response.data.userid),
					SenderId: parseInt(userId),
					TeamID: parseInt(teamId),
					Status: false,
				};

				const inviteResponse = await axios.post(
					"https://us-central1-trivia-game-5410.cloudfunctions.net/TeamInviteSend",
					inviteData
				);

				if (inviteResponse.status === 200) {
					setInviteStatus("success");
					setInviteEmail("");
				} else {
					setInviteStatus("error");
				}
			} else {
				setInviteStatus("error");
			}
		} catch (error) {
			console.error("Error sending invite:", error);
			setInviteStatus("error");
		}
	};

	const [selectedMember, setSelectedMember] = useState(null);
	const [selectedAction, setSelectedAction] = useState("");

	const handlePromoteOrRemove = async () => {
		if (!selectedAction || !selectedMember || !teamId) {
			console.error("Missing selected action, member ID, or team ID");
			return;
		}

		try {
			const response = await axios.post(
				"https://us-central1-trivia-game-5410.cloudfunctions.net/ManageTeam", // Replace with your actual API endpoint for promoting or removing members
				{
					action: selectedAction,
					teamId: teamId,
					memberId: parseInt(selectedMember),
				}
			);

			if (response.status === 200) {
				alert(
					`${selectedAction} successfully performed for member with ID ${selectedMember}`
				);
				fetchTeamData(teamId);
				fetchUserDetailsForMembers();
			} else {
				console.error(
					`Failed to perform ${selectedAction} for member with ID ${selectedMember}`
				);
			}

			setSelectedAction("");
			setSelectedMember(null);
		} catch (error) {
			console.error("Error performing action:", error);
		}
	};

	const handleLeave = async () => {
		try {
			const response = await axios.post(
				"https://us-central1-trivia-game-5410.cloudfunctions.net/ManageTeam", // Replace with your actual API endpoint for promoting or removing members
				{
					action: "remove_member",
					teamId: parseInt(teamId),
					memberId: parseInt(userId),
				}
			);

			if (response.status === 200) {
				sessionStorage.setItem("team_id", 0);
				await axios.post(
					"https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/set-team",
					{
						userid: parseInt(userId),
						teamid: parseInt(0),
					}
				);
				console.log(`successfully leaved Team!!`);
				sessionStorage.setItem("team_id", 0);
				fetchTeamData(teamId);
				fetchUserDetailsForMembers();
			} else {
				console.error(`Failed to perform leave action!!`);
			}

			setSelectedAction("");
			setSelectedMember(null);
		} catch (error) {
			console.error("Error performing action:", error);
		}
	};
	const fetchUserStatistics = async (userName) => {
		try {
			setLoading(true);
			// Make a POST API call to fetch user state data
			const payload = {
				entity_type: "team",
				entity_name: userName,
			};
			const response = await axios.post(
				"https://us-central1-serverless-project-390701.cloudfunctions.net/get-user-state",
				payload
			);
			const data = response.data;
			console.log(response.data);
			if (!data) {
				throw new Error("Invalid API response format");
			}
			setTeamStatistics(data);
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
						teamData && (
							<Box
								sx={{
									marginBottom: "20px",
									padding: "20px",
									borderRadius: "8px",
								}}
							>
								<Typography variant='h2' sx={{ marginBottom: "10px" }}>
									Team Details
								</Typography>
								<Box sx={{ margin: "10px" }}>
									<Typography variant='h4'>Team Name:</Typography>
									<Typography variant='h6'>{teamData.TeamName}</Typography>
								</Box>

								{/* Member List */}
								<Box mt={2}>
									<Typography variant='h5'>Members:</Typography>
									{userDetails.map((userData, index) => {
										const memberName = userData.username;

										return (
											<Box
												key={index}
												sx={{
													display: "flex",
													alignItems: "center",
													justifyContent: "space-between",
													border: "1px solid #ccc",
													borderRadius: "4px",
													padding: "8px",
													margin: "4px 0",
												}}
											>
												<Typography variant='body1'>{memberName}</Typography>
												{isAdmin && (
													<Box
														sx={{
															display: "flex",
															alignItems: "center",
															justifyContent: "space-between",
														}}
													>
														<FormControl
															variant='outlined'
															sx={{ minWidth: 150 }}
														>
															<Select
																value={
																	selectedMember === userData.user_id
																		? selectedAction
																		: ""
																}
																onChange={(e) => {
																	setSelectedAction(e.target.value);
																	setSelectedMember(userData.user_id);
																}}
															>
																<MenuItem value=''>Select Action</MenuItem>
																<MenuItem value='promote_to_admin'>
																	Promote to Admin
																</MenuItem>
																<MenuItem value='remove_member'>
																	Remove Member
																</MenuItem>
															</Select>
														</FormControl>
														<Button
															variant='contained'
															color='primary'
															onClick={handlePromoteOrRemove}
														>
															Submit
														</Button>
													</Box>
												)}
											</Box>
										);
									})}
								</Box>

								{!isAdmin && (
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
											onClick={handleLeave}
										>
											Leave Team
										</Button>
									</Box>
								)}

								{/* Invite Form */}
								{isAdmin && (
									<Box mt={2}>
										<TextField
											variant='outlined'
											label='Enter Email ID'
											value={inviteEmail}
											onChange={(e) => setInviteEmail(e.target.value)}
											sx={{ marginRight: "10px" }}
										/>
										<Button
											variant='contained'
											color='primary'
											onClick={handleInvite}
										>
											Invite
										</Button>
										{inviteStatus === "success" && (
											<Typography variant='body1'>
												Invite successfully sent!
											</Typography>
										)}
										{inviteStatus === "error" && (
											<Typography variant='body1'>
												Failed to send invite. Please try again later.
											</Typography>
										)}
									</Box>
								)}

								{/* Achievements */}
								<Box mt={2}>
									<Typography variant='h5'>Achievements:</Typography>
									{teamData.Achievements.map((achievement, index) => (
										<Typography
											key={index}
											variant='h6'
											sx={{
												backgroundColor:
													colorMode === "light" ? "#0f0f0f" : "#555",
												padding: "8px",
												borderRadius: "4px",
												margin: "4px 0",
											}}
										>
											{achievement.Achievement}
										</Typography>
									))}
								</Box>
								{/* {!isAdmin && (
									<Box mt={2}>
										<Button
											variant='contained'
											color='secondary'
											onClick={handleLeave}
										>
											Leave Team
										</Button>
									</Box>
								)}
								<Box mt={2}>
									<Typography variant='h5'>
										{isAdmin ? "You are an admin" : "You are not an admin"}
									</Typography>
									{!isAdmin && (
										<Typography variant='body1'>
											UserID: {userId}, TeamAdminID: {teamData.AdminId}
										</Typography>
									)}
								</Box> */}
								{/* Display user statistics */}
								<Box sx={{ margin: "20px" }}>
									<Typography variant='h2'>Team Statistics</Typography>
									<Box sx={{ margin: "10px" }}>
										<Typography variant='h4'>Total Score:</Typography>
										<Typography variant='h4'>
											{teamStatistics ? teamStatistics.score : 0}
										</Typography>
									</Box>
									<Box sx={{ margin: "10px" }}>
										<Typography variant='h4'>Total Right Answer:</Typography>
										<Typography variant='h4'>
											{teamStatistics ? teamStatistics.right_answers : 0}
										</Typography>
									</Box>
									<Box sx={{ margin: "10px" }}>
										<Typography variant='h4'>Total Wrong Answers:</Typography>
										<Typography variant='h4'>
											{teamStatistics ? teamStatistics.wrong_answers : 0}
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

export default TeamsPage;
