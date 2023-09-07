import React, { useState, useEffect } from "react";
import {
	Typography,
	Select,
	MenuItem,
	FormControl,
	InputLabel,
	Box,
	Tab,
	Tabs,
	Container,
} from "@mui/material";
import axios from "axios";
import Table from "../../components/Table";
import styles from "./index.module.css";
import Chart from "../../components/Chart";
import { Topbar } from "../../scenes/global/Topbar";

const LeaderboardPage = () => {
	const [leaderboardData, setLeaderboardData] = useState([]); // Initialize as an empty array
	const [timeFrame, setTimeFrame] = useState("weekly"); // Set "weekly" as the default time frame
	const [category, setCategory] = useState("9"); // Set "all" as the default category
	const [activeTab, setActiveTab] = useState(0);

	useEffect(() => {
		fetchLeaderboardData();
	}, [timeFrame, activeTab, category]);

	const fetchLeaderboardData = async () => {
		try {
			const entity_type = activeTab === 0 ? "team" : "player";
			const url = `https://us-east1-serverless-project-390701.cloudfunctions.net/LeaderboardCreation?entity_type=${entity_type}&category=${category}&time_frame=${timeFrame}`;
			const resp = await axios.get(url);

			if (resp.status === 200) {
				const temp = JSON.parse(resp.data.body); // Parse the JSON response
				const fetchedData = JSON.parse(temp.body);
				console.log("here");
				console.log(fetchedData);
				setLeaderboardData(fetchedData);
			} else {
				console.log("Failed to fetch leaderboard data.");
			}
		} catch (e) {
			console.log(e.message);
		}
	};

	// Define the columns for the leaderboard table
	const columns = React.useMemo(
		() => [
			{ Header: "Name", accessor: "name" },
			{ Header: "Efficiency", accessor: "efficiency" },
			{ Header: "Right Answer", accessor: "total_right_answers" }, // Use the correct accessor based on the data format
			{ Header: "Wrong Answer", accessor: "total_wrong_answers" }, // Use the correct accessor based on the data format
			{ Header: "Score", accessor: "total_score" }, // Use the correct accessor based on the data format
		],
		[]
	);

	// Prepare the data for the chart
	const chartData = leaderboardData.map((entry) => ({
		name: entry.name,
		score: entry.total_score, // Use the correct property based on the data format
	}));

	const handleTabChange = (event, newValue) => {
		setActiveTab(newValue);
	};

	const timeFrameOptions = [
		{ value: "daily", label: "Daily" },
		{ value: "weekly", label: "Weekly" },
		{ value: "monthly", label: "Monthly" },
		// Remove the "All Time" option from timeFrameOptions
	];

	const categoryOptions = [
		{ value: "9", label: "All" },
		{ value: "5", label: "GK" },
		{ value: "7", label: "Sports" },
		{ value: "3", label: "Anime" },
	];

	return (
		<>
			<Topbar />
			<Container className={styles.container}>
				<Typography
					variant='h4'
					align='center'
					gutterBottom
					className={styles.heading}
				>
					Leaderboard
				</Typography>
				<Box className={styles.tabs}>
					<Tabs value={activeTab} onChange={handleTabChange}>
						<Tab label='Teams' />
						<Tab label='Individual Players' />
					</Tabs>
				</Box>
				<Box className={styles.filters}>
					<FormControl>
						<InputLabel id='category-label'>Category</InputLabel>
						<Select
							labelId='category-label'
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							label='Category'
						>
							{categoryOptions.map((option, index) => (
								<MenuItem key={index} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
					<FormControl>
						<InputLabel id='time-frame-label'>Time Frame</InputLabel>
						<Select
							labelId='time-frame-label'
							value={timeFrame}
							onChange={(e) => setTimeFrame(e.target.value)}
							label='Time Frame'
						>
							{timeFrameOptions.map((option, index) => (
								<MenuItem key={index} value={option.value}>
									{option.label}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>

				{leaderboardData.length > 0 ? (
					<>
						<Table columns={columns} data={leaderboardData} />
						<Box className={styles.statistics}>
							<Typography variant='h5' align='center' gutterBottom>
								Statistics
							</Typography>
							<Chart data={chartData} />
						</Box>
					</>
				) : (
					<Typography variant='body1' align='center'>
						No data available.
					</Typography>
				)}
			</Container>
		</>
	);
};

export default LeaderboardPage;

//   return (
//     <Container className={styles.container}>
//       <Typography variant="h4" align="center" gutterBottom className={styles.heading}>
//         Leaderboard
//       </Typography>
//       <Box className={styles.tabs}>
//         <Tabs value={activeTab} onChange={handleTabChange}>
//           <Tab label="Teams" />
//           <Tab label="Individual Players" />
//         </Tabs>
//       </Box>
//       <Box className={styles.filters}>
//         <FormControl>
//           <InputLabel id="category-label">Category</InputLabel>
//           <Select
//             labelId="category-label"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             label="Category">
//             {categoryOptions.map((option, index) => (
//               <MenuItem key={index} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//         <FormControl>
//           <InputLabel id="time-frame-label">Time Frame</InputLabel>
//           <Select
//             labelId="time-frame-label"
//             value={timeFrame}
//             onChange={(e) => setTimeFrame(e.target.value)}
//             label="Time Frame">
//             {timeFrameOptions.map((option, index) => (
//               <MenuItem key={index} value={option.value}>
//                 {option.label}
//               </MenuItem>
//             ))}
//           </Select>
//         </FormControl>
//       </Box>
//       <Table columns={columns} data={leaderboardData} />
//       <Box className={styles.statistics}>
//         <Typography variant="h5" align="center" gutterBottom>
//           Statistics
//         </Typography>
//         {/* Use the correct data for the chart */}
//         <Chart data={chartData} />
//       </Box>
//     </Container>
//   );
// };

// export default LeaderboardPage;
