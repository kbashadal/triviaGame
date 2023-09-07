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
import { useContext } from "react";
import { TextField, MenuItem, Button } from "@mui/material";
import { tokens } from "../../theme";
import axios from "axios";

export const CreateQuestions = () => {
    const [questionName, setQuestionName] = useState("");
    const [answer, setAnswer] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [explanation, setExplanation] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [hint, setHint] = useState("");
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [option1,setOption1] = useState("");
    const [option2,setOption2] = useState("");
    const [option3,setOption3] = useState("");

    const handleFormSubmit = (event) =>
    {
        event.preventDefault();
        axios.post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/getgamenames ", {
                                                                                                                      questionName,
                                                                                                                       answer,
                                                                                                                       hint,
                                                                                                                       difficulty,
                                                                                                                       explanation,
                                                                                                                        selectedCategory,option1,option2,option3
                                                                                                                    })
            .then((response) => {
            console.log(response.data);
             setHint('')
             setExplanation("")
             setAnswer('')
             setDifficulty("")
             setQuestionName("")
             setOption1("")
             setOption2("")
             setOption3("")
             setSelectedCategory("")
                      })
                      .catch((error) => {
                        console.error(error);
                      });


        axios.post("https://us-central1-serverless-summer.cloudfunctions.net/createQuestions", {
                                                                                                                              questionName,
                                                                                                                               answer,
                                                                                                                               hint,
                                                                                                                               difficulty,
                                                                                                                               explanation,
                                                                                                                                selectedCategory,option1,option2,option3
                                                                                                                            })
                    .then((response) => {
                    console.log(response.data);
                     setHint('')
                     setExplanation("")
                     setAnswer('')
                     setDifficulty("")
                     setQuestionName("")
                     setOption1("")
                     setOption2("")
                     setOption3("")
                     setSelectedCategory("")
                              })
                              .catch((error) => {
                                console.error(error);
                              });
    }
    const fetchCategories = useCallback(async () => {
          try {
            const response = await axios.get(
              "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games"
            );
            console.log(response)
            const extractedCategories = response.data['body'].map(item => item);
            setCategories(extractedCategories);
          } catch (error) {
            console.error("Error fetching categories:", error);
          }
        }, []);
      useEffect(() => {
          fetchCategories();
        }, [fetchCategories]);
    const handleCategoryChange = (event) => {
          const selectedValue = event.target.value;
          setSelectedCategory(selectedValue);
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
                          <Typography variant="h5">Questions</Typography>
                          <Box sx={{ mt: 2 }}>
                            <form onSubmit={handleFormSubmit}>
                              <TextField
                                label="Question"
                                value={questionName}
                                onChange={(e) => setQuestionName(e.target.value)}
                                fullWidth
                                required
                                margin="normal"
                              />

                              <TextField
                                  label="Answer"
                                  value={answer}
                                  onChange={(e) => setAnswer(e.target.value)}
                                  fullWidth
                                  required
                                  margin="normal"
                                />
                                <TextField
                                      label="option1"
                                      value={option1}
                                      onChange={(e) => setOption1(e.target.value)}
                                      fullWidth
                                      required
                                      margin="normal"
                                    />
                                <TextField
                                      label="option2"
                                      value={option2}
                                      onChange={(e) => setOption2(e.target.value)}
                                      fullWidth
                                      required
                                      margin="normal"
                                    />
                                <TextField
                                  label="option3"
                                  value={option3}
                                  onChange={(e) => setOption3(e.target.value)}
                                  fullWidth
                                  required
                                  margin="normal"
                                />

                              <TextField
                                    label="Hint"
                                    value={hint}
                                    onChange={(e) => setHint(e.target.value)}
                                    fullWidth
                                    required
                                    margin="normal"
                                  />
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
                                    label="Explanation"
                                    value={explanation}
                                    onChange={(e) => setExplanation(e.target.value)}
                                    fullWidth
                                    required
                                    margin="normal"
                                  />

                              <TextField
                                    label="Select Category"
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
                              <Button type="submit" variant="contained" color="primary">
                                Add Question
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
export default CreateQuestions;