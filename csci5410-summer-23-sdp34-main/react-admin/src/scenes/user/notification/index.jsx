import {
	Box,
	Button,
	CircularProgress,
	Divider,
	Grid,
	Typography,
	useTheme,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tokens, useMode } from "../../../theme";

export const Notification = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const [userId, setUserId] = useState("");
	const [colorMode] = useMode();
	const navigate = useNavigate();

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
	}, [navigate]);

	const API_URL = `https://apigateways-8lk1x0pn.uc.gateway.dev/get_team_invite_notification?userId=${userId}`;
	const [notifications, setNotifications] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!userId) {
		  setLoading(false);
		  return;
		}
	  
		const fetchNotifications = async () => {
		  setLoading(true);
		  try {
			const apiUrls = [
			  `https://apigateways-8lk1x0pn.uc.gateway.dev/get_team_invite_notification?userId=${userId}`,
			  `https://2yea3mrq03.execute-api.ca-central-1.amazonaws.com/dev/get_team_updates?userId=${userId}`,
			  `https://2yea3mrq03.execute-api.ca-central-1.amazonaws.com/dev/get_game_notification?userId=${userId}`,
			  `https://apigateways-8lk1x0pn.uc.gateway.dev/leaderboard_request?userId=${userId}`,
			  `https://2yea3mrq03.execute-api.ca-central-1.amazonaws.com/dev/get_achievements?userId=${userId}`,
			];
	  
			const responses = await Promise.allSettled(
			  apiUrls.map((apiUrl) => axios.get(apiUrl))
			);
	  
			// Process and merge the notifications
			const mergedNotifications = responses.reduce((accumulator, response) => {
			  if (response.status === "fulfilled") {
				const data = response.value.data;
				if (data.notification && Array.isArray(data.notification)) {
				  accumulator.push(...data.notification);
				}
			  }
			  return accumulator;
			}, []);
	  
			// Update the state with the merged notifications
			setNotifications(mergedNotifications);
		  } catch (error) {
			console.error("Error fetching notifications:", error);
		  } finally {
			setLoading(false); // Set loading to false after all responses are settled (fulfilled or rejected)
		  }
		};
	  
		fetchNotifications();
	  }, [userId]);
	  

	const handleAccept = async (notification) => {
		try {
			if (!userId) {
				console.log("No user ID found. Cannot accept notification.");
				return;
			}
			await axios.post(
				"https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/set-team",
				{
					userid: parseInt(userId),
					teamid: parseInt(notification.teamId),
				}
			);

			await axios.post(
				"https://us-central1-trivia-game-5410.cloudfunctions.net/ManageTeam",
				{
					action: "add_member",
					teamId: parseInt(notification.teamId),
					memberId: parseInt(userId),
				}
			);
			sessionStorage.setItem("team_id", notification.teamId);
			setNotifications("");
			// Handle the accepted notification here, show success message, etc.
			alert("Accepted notification:", notification);
		} catch (error) {
			// Handle any errors that occur during the API calls
			alert(error.response.data);
		}
		setNotifications("");
	};

	const handleReject = (notification) => {
		// Handle the reject action here, for notifications with TeamId
		alert("Rejected notification:", notification);
	};

	return (
		<Box
			sx={{
				width: 250,
				backgroundColor: colors.primary[400],
				padding: "20px",
				borderRadius: "10px",
				boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
				color: theme.palette.mode === "dark" ? "white" : "black",
				textAlign: "center",
			}}
		>
			{loading ? (
				<CircularProgress />
			) : notifications.length > 0 ? (
				<>
					<Typography variant='h6'>Notifications</Typography>
					<Divider sx={{ margin: "20px 0" }} />
					{notifications.map((notification, index) => (
						<Box key={index} sx={{ marginBottom: "8px" }}>
							<Grid container alignItems='center'>
								<Grid item xs={12}>
									<Typography>{notification.message}</Typography>
								</Grid>
								{notification.teamId && (
									<Grid item xs={12} sx={{ marginTop: "10px" }}>
										<Button
											variant='contained'
											color='primary'
											onClick={() => handleAccept(notification)}
										>
											Accept
										</Button>
										<Button
											variant='contained'
											color='secondary'
											onClick={() => handleReject(notification)}
											sx={{ marginLeft: "10px" }}
										>
											Reject
										</Button>
									</Grid>
								)}
							</Grid>
						</Box>
					))}
				</>
			) : (
				<Typography variant='body1'>No notifications</Typography>
			)}
		</Box>
	);
};

export default Notification;
