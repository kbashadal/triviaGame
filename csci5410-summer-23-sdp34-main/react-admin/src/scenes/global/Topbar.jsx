import { Box, IconButton, useTheme, Popover } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import { User } from "../user";
import { Notification } from "../user/notification";
import * as React from "react";

export const Topbar = () => {
	const theme = useTheme();
	const colors = tokens(theme.palette.mode);
	const colorMode = useContext(ColorModeContext);

	const [anchorElNotification, setAnchorElNotification] = useState(null);
	const [anchorElUser, setAnchorElUser] = useState(null);

	const handleClickNotification = (event) => {
		setAnchorElNotification(event.currentTarget);
	};

	const handleCloseNotification = () => {
		setAnchorElNotification(null);
	};

	const handleClickUser = (event) => {
		setAnchorElUser(event.currentTarget);
	};

	const handleCloseUser = () => {
		setAnchorElUser(null);
	};

	const openNotification = Boolean(anchorElNotification);
	const idNotification = openNotification
		? "simple-popover-notification"
		: undefined;

	const openUser = Boolean(anchorElUser);
	const idUser = openUser ? "simple-popover-user" : undefined;

	return (
		<>
			<Box display='flex' justifyContent='space-between' p={2}>
				{/* SEARCH BAR */}
				<Box
					display='flex'
					backgroundColor={colors.primary[400]}
					borderRadius='3px'
				>
{/* 					<InputBase sx={{ ml: 2, flex: 1 }} placeholder='Search' /> */}
{/* 					<IconButton type='button' sx={{ p: 1 }}> */}
{/* 						<SearchIcon /> */}
{/* 					</IconButton> */}
				</Box>

				{/* ICONS */}
				<Box display='flex'>
					<IconButton onClick={colorMode.toggleColorMode}>
						{theme.palette.mode === "dark" ? (
							<DarkModeOutlinedIcon />
						) : (
							<LightModeOutlinedIcon />
						)}
					</IconButton>
					<IconButton onClick={handleClickNotification}>
						<NotificationsOutlinedIcon />
					</IconButton>
					<Popover
						id={idNotification}
						open={openNotification}
						anchorEl={anchorElNotification}
						onClose={handleCloseNotification}
						anchorOrigin={{
							vertical: "bottom",
							horizontal: "left",
						}}
						transformOrigin={{
							vertical: "top",
							horizontal: "left",
						}}
					>
						<Notification />
					</Popover>
					{/* <IconButton>
						<SettingsOutlinedIcon />
					</IconButton> */}
					<IconButton onClick={handleClickUser}>
						<PersonOutlinedIcon />
					</IconButton>
				</Box>
			</Box>
			<Popover
				id={idUser}
				open={openUser}
				anchorEl={anchorElUser}
				onClose={handleCloseUser}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "left",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "left",
				}}
			>
				<User />
			</Popover>
		</>
	);
};

export default Topbar;
