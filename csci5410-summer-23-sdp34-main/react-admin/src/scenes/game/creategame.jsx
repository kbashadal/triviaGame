import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  useTheme,
  Grid
} from "@mui/material";

import { ColorModeContext } from "../../theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { Topbar } from "../global/Topbar";
import { Sidebar } from "../global/Sidebar";
import axios from "axios";
import { TextField, MenuItem, Button } from "@mui/material";
import { useContext } from "react";
import CreateCategoryWindow from "./CreateCategoryWindow";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import moment from "moment";
// import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { MobileTimePicker } from '@mui/x-date-pickers/MobileTimePicker';
import { TimeField } from '@mui/x-date-pickers/TimeField';
// import dayjs, { Dayjs } from 'dayjs';





export const CreateGame = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const [gameName, setGameName] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [numTeamsAllowed, setNumTeamsAllowed] = useState("");
  const [numQuestions, setNumQuestions] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [difficultyLevels, setDifficultyLevels] = useState([]);
  const [date, setDate] = React.useState("");
//   const [value, setValue] = useState<Dayjs | null>(dayjs('2022-04-17T15:30'));
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [time, setTime] = React.useState("");



  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  const handleCloseCreateCategoryWindow = () => {
      setIsCreatingCategory(false);
    };

  const fetchDifficultyLevels = useCallback(async () => {
      try {
        const response = await axios.get(
          "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/getGameCategory"
        );
        console.log(response.data.body)
        setDifficultyLevels(response.data['body']); // Assuming the API returns an array of difficulty levels
      } catch (error) {
        console.error("Error fetching difficulty levels:", error);
      }
    }, []);
  useEffect(() => {
      fetchDifficultyLevels();
    }, [fetchDifficultyLevels]);
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

  const handleFormSubmit = (event) => {
  console.log("the time is :"+time)
  console.log("date :" +date)
    event.preventDefault();
    axios.post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/getGameCategory", {
                                                                                                              gameName,
                                                                                                              difficulty,
                                                                                                              timePerQuestion,
                                                                                                              description,
                                                                                                              numTeamsAllowed,
                                                                                                              numQuestions,
                                                                                                              selectedCategory,
                                                                                                              date,
                                                                                                              time
                                                                                                            })
    .then((response) => {
    console.log(response.data);
//     navigate("/createquestions");
      })
      .catch((error) => {
        console.error(error);
      });
    const data = {     gameName:gameName,
                       difficulty:difficulty,
                       timePerQuestion:timePerQuestion,
                       description:description,
                       numTeamsAllowed:numTeamsAllowed,
                       numQuestions:numQuestions,
                       selectedCategory:selectedCategory,
                       date:date,
                       time:time
                    }
    axios.post("https://us-central1-serverless-summer.cloudfunctions.net/TestCreateGames", data)
        .then((response) => {
        console.log(response.data);
        navigate("/createquestions");
          })
          .catch((error) => {
            console.error(error);
          });

  };
  const handleCategoryChange = (event) => {
      const selectedValue = event.target.value;
      setSelectedCategory(selectedValue);
      if (selectedValue === "Create Category") {
            setIsCreatingCategory(true); // Set the state to open the new window
          }
    };
   const isValidNumberInput = (value) => {
     // Regular expression to match integers and decimals
     const numberRegex = /^-?\d*$/;
     // Return true if the input is empty or matches the regex
     return value === "" || numberRegex.test(value);
   };


     const handleTimePerQuestionChange = (event) => {
       const newValue = event.target.value;
       if (isValidNumberInput(newValue)) {
         setTimePerQuestion(newValue);
       }
     };


     const handleNumberOfTeams = (event) => {
            const newValue = event.target.value;
            if (isValidNumberInput(newValue)) {
              setNumTeamsAllowed(newValue);
            }
          };

       const handleTimeChange = (event) => {
         const newTime = event.target.value;
         setSelectedTime(newTime);
       };
     const handleNumberOfQuestions = (event) => {
                 const newValue = event.target.value;
                 if (isValidNumberInput(newValue)) {
                   setNumQuestions(newValue);
                 }
               };




  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Topbar />
          </Grid>
          <Grid item xs={12} md={2}>
            <Sidebar />
          </Grid>
          <Grid item xs={12} md={10}>
            <Box sx={{ maxWidth: 600, mx: "auto" }}>
              <Typography variant="h5">Create Game</Typography>
              <Box sx={{ mt: 2 }}>
              {isCreatingCategory && <CreateCategoryWindow onClose={handleCloseCreateCategoryWindow}fetchCategories={fetchCategories} />}
                <form onSubmit={handleFormSubmit}>
                  <TextField
                    label="Game Name"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                  />

                  <TextField
                      label="Category"
                      select
                      value={selectedCategory || ""}
                      onChange={handleCategoryChange}
                      fullWidth
                      required
                      margin="normal"
                    >
                    {categories.map((category, index) => (
                              <MenuItem key={category} value={category}>
                                {category}
                              </MenuItem>
                            ))}
                    </TextField>
                  <TextField
                          label="Difficulty Level"
                          select
                          value={difficulty}
                          onChange={(e) => setDifficulty(e.target.value)}
                          fullWidth
                          required
                          margin="normal"
                        >
                          {difficultyLevels.map((level) => (
                            <MenuItem key={level} value={level}>
                              {level}
                            </MenuItem>
                          ))}
                        </TextField>

                  <TextField
                        label="Time per Question"
                        value={timePerQuestion}
                        onChange={handleTimePerQuestionChange}
                        fullWidth
                        required
                        margin="normal"
                      />

                  <TextField
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    required
                    margin="normal"
                  />

                  <TextField
                    label="Number of Teams Allowed"
                    value={numTeamsAllowed}
                    onChange={handleNumberOfTeams}
                    fullWidth
                    required
                    margin="normal"
                  />

                  <TextField
                    label="Number of Questions"
                    value={numQuestions}
                    onChange={handleNumberOfQuestions}
                    fullWidth
                    required
                    margin="normal"
                  />
                  <LocalizationProvider dateAdapter={AdapterMoment}>
                    <DatePicker
                      label="Select Start Date"
                      format="YYYY-MM-DD"
                      required
                      onChange={(e) => {setDate(moment(e).format("YYYY-MM-DD"))}}
                    />
                  </LocalizationProvider>
{/*                   <label htmlFor="time">Select a time:</label> */}
{/*                   <input */}
{/*                       type="time" */}
{/*                       id="time" */}
{/*                       label = "Select Start Time" */}
{/*                       value={selectedTime} */}
{/*                       onChange={handleTimeChange} */}
{/*                     /> */}
                    <LocalizationProvider dateAdapter={AdapterMoment}>
                        <MobileTimePicker
                          label="Select Start Time"
                          format="HH:MM"
                          required
                          onChange={(e) => {setTime(moment(e).format("HH-MM"))}}
                        />
                      </LocalizationProvider>

{/*                   <LocalizationProvider dateAdapter={AdapterMoment}> */}
{/*                   <TimeField */}
{/*                             label="Format with meridiem" */}
{/*                             value={selectedTime} */}
{/*                             onChange={(newValue) => setSelectedTime(newValue)} */}
{/*                             format="hh:mm a" */}
{/*                           /> */}

{/*                   </LocalizationProvider> */}
                  <br></br>
                  <br></br>

                  <Button type="submit" variant="contained" color="primary">
                    Create Game
                  </Button>
                </form>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default CreateGame;
