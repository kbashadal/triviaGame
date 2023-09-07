// import React from 'react';
import React, { useState, useEffect, useCallback } from "react";
import { ColorModeContext } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import {
  Typography,
  Box,
  useTheme,
  Grid
} from "@mui/material";
import { tokens } from "../../theme.js";
import { useContext } from "react";
import './user.css'
import moment from 'moment';
import axios from "axios";
import InviteTeamWindow from "./inviteTeamWindow.jsx";


const PlayCard = ({ gameName, gameData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const {
    GameId: { N: gameId },
    description: { S: gameDescription },
    difficulty: { S: gameDifficulty },
    numQuestions: { S: numQuestions },
    numTeamsAllowed: { S: numTeamsAllowed },
    selectedCategory: { S: selectedCategory },
    startDate: { S: startDate },
    startTime: { S: startTime },
    timePerQuestion: { S: timePerQuestion },
  } = gameData;

  const currentDate = new Date(); // Get the current local date

  // Function to format date as "YYYY-MM-DD"
  const formatDate = (date) => {
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const day = String(date.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
const formatTime = (timeString) => {
  const now = new Date();
  const [hours, minutes] = timeString.split('-');
  const formattedTime = new Date();
  formattedTime.setHours(hours);
  formattedTime.setMinutes(minutes);
  return moment(formattedTime).format("HH:mm"); // Use "HH:mm" instead of "hh:mm" for 24-hour format
};
const addGracePeriod = (timeString, minutes) => {
  return moment(timeString, "HH:mm").add(minutes, "minutes").format("HH:mm");
};
  const validateStartTime = () => {
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const formattedTime = moment().format("HH:mm");
     const gameStartTime = addGracePeriod(formatTime(startTime), 2);


    const currentDateTime = `${formattedDate} ${formattedTime}`;
    const startDateTime = `${formatDate(new Date(startDate))} ${gameStartTime}`;
    console.log("startDateTime :"+startDateTime)
    console.log("currentDateTime: "+currentDateTime)
    console.log(startDateTime >= currentDateTime);


    return startDateTime >= currentDateTime;
  };
  const [gameQuestions, setGameQuestions] = useState([]);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [categories, setCategories] = useState([]);
  const fetchCategories = useCallback(async () => {
        try {
          const response = await axios.get(
            "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games"
          );
          const extractedCategories = response.data['body'].map(item => item);
          const categoriesWithCreateOption = ["Create Category", ...extractedCategories];
          setCategories(categoriesWithCreateOption);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      }, []);
    useEffect(() => {
        fetchCategories();
      }, [fetchCategories]);

  const [teamMembers,setTeamMembers] =useState([]);

  const fetchTeamMembers = useCallback(async () => {
          try {
            const response = await axios.get(
              "https://us-central1-trivia-game-5410.cloudfunctions.net/GetTeamDetails?teamId=1"
            );
            const teamMembersId = response.data['TeamDetails']['TeamMembers'];
            const userDataDict = {};
            const userDataList =[];
            for (const userId of teamMembersId) {
                  try {
                    const response = await axios.get(`https://3x8jbspfnl.execute-api.us-east-1.amazonaws.com/user/${userId}`);
                    userDataList.push(response.data['email']);
                     userDataDict[response.data['username']] = {
                           email: response.data['email'],
                         };
                  } catch (error) {
                    console.error(`Error fetching user data for user_id ${userId}:`, error.message);
                  }
                }
            setCategories(userDataList);
            setTeamMembers(userDataList);
          } catch (error) {
            console.error("Error fetching categories:", error);
          }
        }, []);
      useEffect(() => {
          fetchTeamMembers();
        }, [fetchTeamMembers]);

  const handleInvite = () =>
  {
    console.log("Open a popip window and fetch the team id from session and show all the members associated with that team and dump reciever id, sender id and dump into GameInvite table");
    setIsCreatingCategory(true);
  };
  const handleCloseCreateCategoryWindow = () => {
        setIsCreatingCategory(false);
  };
  const handleJoin = () => {
    // Implement the logic for joining the game here
    console.log(`Joining the game: ${gameName}`);
    console.log(gameData);
    console.log(gameName);
    console.log(gameId);
    console.log(startTime)
    const gameStartTime = formatTime(startTime)
    console.log("gameStartTime:"+gameStartTime)
    const now = new Date();
    const current_time = moment(now).format("hh-mm")
    console.log(current_time)
    console.log("__________")
    console.log(numQuestions)
//     Yet to addd user id and team id which needs to fetched from session
    axios
        .post(
          "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/questions/getquestionsforagame/",
          {
            selectedCategory,
            gameDifficulty,
            numQuestions,
            gameId
          }
        )
        .then((response) => {
          console.log(response.data);

//          {"AllQuestion": listOfQuestions,
//               "GameId":GameId,
//                "UserId":UserId,
//                "TeamId":TeamId,
//                     "TeamName":teamName --> yash session token ,
//                    "TimePerQuestion":TimePerQuestion

//             }

          // navigate("/gameExperience", { state: { responseData } });; navigate to in game experience share team id and user id along with game data
        })
        .catch((error) => {
          console.error(error);
        });
  };


  // Check if the start date is greater than the current local date
  const isStartDateValid = formatDate(new Date(startDate)) >= formatDate(currentDate);
  const isStartTimeValid = validateStartTime();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid container spacing={2} justify="center">
          <Grid item xs={12} sm={8} md={60}>
            <div className="play-card">

              {/* Conditional rendering based on the start date */}
{/*               {!isStartDateValid && ( */}
{/*                 <p>The game is not yet available.</p> */}
{/*               )} */}
              {isStartTimeValid &&
              (
                <>
                   {isCreatingCategory && <InviteTeamWindow onClose={handleCloseCreateCategoryWindow}fetchCategories={teamMembers} />}
                  <h2 className="game-name-heading">{gameName}</h2>
                  <p>{`Description: ${gameDescription}`}</p>
                  <p>{`Difficulty: ${gameDifficulty}`}</p>
                  <p>{`Number of Questions: ${numQuestions}`}</p>
                  <p>{`Number of Teams Allowed: ${numTeamsAllowed}`}</p>
                  <p>{`Category: ${selectedCategory}`}</p>
                  <p>{`Start Date: ${formatDate(new Date(startDate))}`}</p>
                  <p>{`Start Time: ${startTime}`}</p>
                  <p>{`Time Per Question: ${timePerQuestion}`}</p>
                  <button onClick={() => handleJoin(gameData, gameName)}>Join</button>
                  <button onClick={() => handleInvite(gameData, gameName)}>Invite</button>
                </>
              )
              }
            </div>
          </Grid>
        </Grid>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default PlayCard;
