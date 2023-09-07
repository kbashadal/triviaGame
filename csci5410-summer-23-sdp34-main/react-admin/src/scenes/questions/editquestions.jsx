import React, { useState, useEffect, useCallback, useRef } from "react";
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

export const EditQuestions = () => {
    const initialDataRef = useRef({});
    const [questionName, setQuestionName] = useState("");
    const [answer, setAnswer] = useState("");
    const [difficulty, setDifficulty] = useState("");
    const [question, setQuestion] = useState("");
    const [difficultyLevels, setDifficultyLevels] = useState([]);
    const [allQuestions, setAllQuestions] = useState([]);
    const [option1,setOption1] = useState("");
    const [option2,setOption2] = useState("");
    const [option3,setOption3] = useState("");

    const [explanation, setExplanation] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([]);
    const [hint, setHint] = useState("");
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const handleUpdateFormSubmit = (event) =>
    {
       console.log("selected question to udpate:", question);
                   axios
                                         .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/questions ", { selectedQuestionName: question,
                                                                                                                                        questionName: questionName, answer:answer,difficulty:difficulty,explanation:explanation,hint:hint,
                                                                                                                                        selectedCategory:selectedCategory,option1:option1,option2:option2,option3:option3
                                                                                                                                        })
                                         .then((response) => {
                                           console.log(response.data); // Success message from the Lambda function
                                           setAnswer('');
                                             setDifficulty("");
                                             setExplanation('');
                                             setHint('');
                                             setSelectedCategory('')
                                             setQuestionName('')
                                             event.target.disabled = true;
                                             fetchQuestions()
                                             setQuestion("")


                                         })
                                         .catch((error) => {
                                           console.error(error);
                                         });
    }
    const handleDeleteQuestion = (event) =>
    {
        console.log("selected question to delete:", question);
            axios
                                  .post("https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/difficultylevel/deletedifficulty ", { name: question,tableName:"AllQuestions",key:"QuestionId" })
                                  .then((response) => {
                                    console.log(response.data); // Success message from the Lambda function
                                    console.log("difficultyLevels :"+difficultyLevels)
                                    setAnswer('');
                                      setDifficulty("");
                                      setExplanation('');
                                      setHint('');
                                      setSelectedCategory('')
                                      setQuestionName('')
                                      event.target.disabled = true;
                                      fetchQuestions()

                                  })
                                  .catch((error) => {
                                    console.error(error);
                                  });
    }
    const [Enabled, setEnabled] = useState(false);
    const fetchCategories = useCallback(async () => {
              try {
                const response = await axios.get(
                  "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games"
                );
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
        const handleQuestionChange =(event) => {
            setEnabled(true);
            const selectedQuestionName = event.target.value;
            setQuestion(selectedQuestionName)
            const initialData = initialDataRef.current;
            const selectedQuestion = initialData[selectedQuestionName];
            if (selectedQuestion)
            {
              setAnswer(selectedQuestion.answer);
              setDifficulty(selectedQuestion.difficulty);
              setExplanation(selectedQuestion.explanation);
              setHint(selectedQuestion.hint);
              setSelectedCategory(selectedQuestion.selectedCategory)
              setQuestionName(selectedQuestionName)
              setOption1(selectedQuestion.option1)
              setOption2(selectedQuestion.option2)
              setOption3(selectedQuestion.option3)
              event.target.disabled = false;
            }

        }

        const fetchDifficultyLevels = useCallback(async () => {
              try {
                const response = await axios.get(
                  "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/getGameCategory"
                );
                setDifficultyLevels(response.data['body']); // Assuming the API returns an array of difficulty levels
              } catch (error) {
                console.error("Error fetching difficulty levels:", error);
              }
            }, []);
        useEffect(() => {
              fetchDifficultyLevels();
            }, [fetchDifficultyLevels]);
        const fetchQuestions = useCallback(async () => {
                      try {
                        const response = await axios.get(
                          "https://sm0eytqe4f.execute-api.us-east-1.amazonaws.com/dev/games/questions"
                        );
                        console.log(response.data.body)
                        const data = response.data.body
                        const questionNamesList = data.map(item => item.questionName);
                        const initialData = data.reduce((acc, item) => {
                          const { questionName, ...rest } = item;
                          acc[questionName] = rest;
                          return acc;
                        }, {});
                        console.log("initialData "+ initialData)

                        initialDataRef.current = initialData;
                        setAllQuestions(questionNamesList)
                      } catch (error) {
                        console.error("Error fetching difficulty levels:", error);
                      }
                    }, []);
                useEffect(() => {
                      fetchQuestions();
                    }, [fetchQuestions]);

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
              <Box sx={{ maxWidth: 600, mx: "auto" }}>
                <Typography variant="h5">Update Questions</Typography>
                <Box sx={{ mt: 2 }}>
                    <form >
                    <TextField
                      label="Select Question"
                      select
                      value={question}
//                       onChange={(e) => setQuestion(e.target.value)}
                      onChange={handleQuestionChange}
                      fullWidth
                      required
                      margin="normal"
                    >
                      {allQuestions.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </TextField>
                      <TextField
                        label="Question"
                        value={questionName}
                        onChange={(e) => setQuestionName(e.target.value)}
                        fullWidth
                        required
                        margin="normal"
                        disabled={!Enabled}
                      />

                      <TextField
                          label="Answer"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          fullWidth
                          required
                          margin="normal"
                          disabled={!Enabled}
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
                            disabled={!Enabled}
                          />
                      <TextField
                              label="Difficulty Level"
                              select
                              value={difficulty}
                              onChange={(e) => setDifficulty(e.target.value)}
                              fullWidth
                              required
                              margin="normal"
                              disabled={!Enabled}
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
                            disabled={!Enabled}
                          />

                      <TextField
                            label="Select Category"
                            select
                            value={selectedCategory || ""}
                            onChange={handleCategoryChange}
                            fullWidth
                            required
                            margin="normal"
                            disabled={!Enabled}
                          >
                          {categories.map((category, index) => (
                                    <MenuItem key={category} value={category}>
                                      {category}
                                    </MenuItem>
                                  ))}
                          </TextField>
                      <Button type="button" variant="contained" color="primary" onClick={handleUpdateFormSubmit}>
                        Update Question
                      </Button>
                      <Button type="button" variant="contained" color="secondary" onClick={handleDeleteQuestion}>
                        Delete Question
                    </Button>
                    </form>
                </Box>
              </Box>
            </Grid>
          </ThemeProvider>
        </ColorModeContext.Provider>
    );

};
export default EditQuestions;