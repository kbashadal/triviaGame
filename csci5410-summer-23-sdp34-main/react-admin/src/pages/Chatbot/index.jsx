import React, { useState, useRef, useEffect } from "react";
import { Button, TextField, Typography, Card } from "@mui/material";
import { LexRuntimeV2 } from "@aws-sdk/client-lex-runtime-v2";

import styles from "./index.module.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatboxRef = useRef(null);

  const lexV2 = new LexRuntimeV2({
    region: "us-east-1",
    credentials: {
      accessKeyId: "ASIA6JJ3VYOFOB5TYYGL",
      secretAccessKey: "YrIlSvikoYGZAXBWq/DiPU6ykdll+vdaAv5Gfr3Y",
      sessionToken: "FwoGZXIvYXdzEK7//////////wEaDIkCmUBB88xuxVsXcCLAARCN4Wykv+7Q/cxO++g3p+r1l+YRYPZphVakW3Fi1Se54P78LSNW9x3+DFUQBjuya4sXELaJm6+H+RBkwmbc4Hdm7gIeccqHlTILvXsx00GrwMpgrIKR0RGON5R9Ng0f4HHW+NhAA1pHMnL0APldMyNTYKdktk2KXck2IJVKZw0Kau80+jMJPIOnAdYeHr5/OaRC3crcYueCHmVKS9yUa1v4Nkyg8J6hcTJFoiehQP70REvInZV6NHn0geoIwVpk0yid+7imBjItjIoaBNTYVIMKY/yMMTG5pfLchvhq4YZeuNpUESe6MgyyhSJcSF66ehb5Bs/6",
    },
  });

  useEffect(() => {
    chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
  }, [messages]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (inputValue.trim() !== "") {
      setMessages((prevMessages) => [...prevMessages, { text: inputValue, sender: "user" }]);
      setIsLoading(true);
      try {
        const data = await processUserInput(inputValue);
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.messages[0].content, sender: "chatbot" },
        ]);
      } catch (error) {
        console.error("Error interacting with Lex V2:", error);
      }
      setIsLoading(false);
      setInputValue("");
    }
  };

  const processUserInput = async (input) => {
    const params = {
      botId: "GTAI5YWBDA",
      botAliasId: "TSTALIASID",
      localeId: "en_US",
      sessionId: "unique-session-id",
      text: input,
    };
    try {
      const data = await lexV2.recognizeText(params);
      return data;
    } catch (error) {
      console.error("Error interacting with Lex V2:", error);
      throw error;
    }
  };

  return (
    <Card className={styles["chatbot-container"]} elevation={3}>
      <div className={styles["chatbot-heading"]}>
        <Typography variant="h4" align="center" gutterBottom>
          Chat Bot
        </Typography>
      </div>
      <div className={styles["chatbot-messages"]} ref={chatboxRef}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles["message-container"]} ${
              message.sender === "user" ? styles["user"] : styles["chatbot"]
            }`}
          >
            <div
              className={`${styles["message"]} ${
                message.sender === "user" ? styles["user-message"] : styles["chatbot-message"]
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles["message-container"]} ${styles["chatbot"]}`}>
            <div className={`${styles["message"]} ${styles["chatbot-message"]}`}>loading...</div>
          </div>
        )}
      </div>
      {/* Remove the form element */}
      {/* <form className={styles["chatbot-form"]} onSubmit={handleFormSubmit}>
        <TextField
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          fullWidth
          placeholder="Type your message..."
        />
        <Button type="submit" variant="contained" color="primary" disabled={!inputValue}>
          Send
        </Button>
      </form> */}
      {/* Add a new input field */}
      <div className={styles["conversation-input-container"]}>
        <TextField
          className={styles["conversation-input"]}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          fullWidth
          placeholder="Type your message..."
        />
        <Button
          className={styles["send-button"]}
          variant="contained"
          color="primary"
          disabled={!inputValue}
          onClick={handleFormSubmit}
        >
          Send
        </Button>
      </div>
    </Card>
  );
};

export default Chatbot;
