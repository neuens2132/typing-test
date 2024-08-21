import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Row, Col, Card, Input, Button } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import PerformanceGraph from './PerformanceGraph';
import PropTypes from 'prop-types';
import enWords from '../api/en.json';
import esWords from '../api/es.json';
import frWords from '../api/fr.json';
import FieldBar from './FieldBar';

const TypingTestBody = ({ fieldValues }) => {
  const { language = 'en', difficulty = '100', time = '15' } = fieldValues || {};
  const testDuration = parseInt(time, 10) * 1000;
  const [performanceData, setPerformanceData] = useState([]);
  const [remainingTime, setRemainingTime] = useState(testDuration / 1000); // Initial time in seconds
  const [testWords, setTestWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [totalTypedCharacters, setTotalTypedCharacters] = useState(0);
  const [correctlyTypedCharacters, setCorrectlyTypedCharacters] = useState(0);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [isTestActive, setIsTestActive] = useState(false);
  const [wordErrors, setWordErrors] = useState([]);
  const [totalCharacterErrors, setTotalCharacterErrors] = useState(0);
  const typingContainerRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    // Reset the test when language or difficulty changes
    restartTest();
  }, [language, difficulty]);

  useEffect(() => {
    // Update the test duration when time changes
    setRemainingTime(parseInt(time, 10) * 1000);
    restartTest();
  }, [time]);

  useEffect(() => {
    // Reset scroll position
    if (typingContainerRef.current) {
      typingContainerRef.current.scrollTop = 0;
    }

    // Call scrollToCurrentLine after a short delay to ensure words are rendered
    // setTimeout(scrollToCurrentLine, 0);
  }, [language, difficulty]);

  useEffect(() => {
    var words = enWords;
    if(language === 'en') {
      words = enWords;
    } else if (language === 'sp') {
      words = esWords;
    } else {
      words = frWords;
    }

    const topWords = words.words
      .filter(word => word.rank <= difficulty)
      .map(word => word.englishWord);
    const shuffled = topWords.sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, shuffled.length);
    setTestWords(selectedWords);
    setWordErrors(new Array(selectedWords.length).fill(''));
  }, []);

  useEffect(() => {
    if (isTestActive) {
      timerRef.current = setInterval(() => {
        const timeElapsed = Date.now() - startTime;
        const timeLeft = testDuration - timeElapsed;
        if (timeLeft <= 0) {
          setEndTime(Date.now());
          setIsTestActive(false);
          clearInterval(timerRef.current);
          setRemainingTime(0);
        } else {
          setRemainingTime(Math.ceil(timeLeft / 1000));
        }
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTestActive, startTime, testDuration]);
  
  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);


    setCurrentCharacterIndex(prev => {
      // If backspace was pressed
      if (input.length < prev) {
        setTotalTypedCharacters(totalTypedCharacters - 1);
        return prev - 1;
      }
      // If a new character was typed
      setTotalTypedCharacters(totalTypedCharacters + 1);
      return prev + 1;
    });

    scrollToCurrentLine(); 

    if (input) {
      if (!startTime) {
        setStartTime(Date.now());
        setIsTestActive(true);
      }

      const finalWord = testWords[testWords.length - 1].trim();
      const currentWord = testWords[currentWordIndex];
      const newWordErrors = [...wordErrors];

      if(input[currentCharacterIndex] !== currentWord[currentCharacterIndex]) {
        if(!input.endsWith(' ') && input.length !== currentWord.length) {
          setTotalCharacterErrors(totalCharacterErrors + 1); 
        }
      }

      setCurrentCharacterIndex(prev => {
        // If backspace was pressed

        if (input.length < prev) {
          setTotalTypedCharacters(totalTypedCharacters - 1);
          return prev - 1;
        }
        // If a new character was typed
        setTotalTypedCharacters(totalTypedCharacters + 1);
        return prev + 1;
      });

      scrollToCurrentLine(); 

      // If a new character was typed

      // Track correctly typed characters
      const correctlyTyped = input
        .split('')
        .filter((char, index) => char === currentWord[index]).length;
      setCorrectlyTypedCharacters(prev => prev + correctlyTyped - currentCharacterIndex);
      
      if (input.endsWith(' ')) {
        // Word completed
        newWordErrors[currentWordIndex] = input.trim() !== currentWord ? input.trim() : '';
        setWordErrors(newWordErrors);
        setCorrectlyTypedCharacters(correctlyTypedCharacters + 1);
        setCurrentWordIndex(currentWordIndex + 1);
        setUserInput('');
        setCurrentCharacterIndex(0);

        if(input == finalWord) {
          setEndTime(Date.now());
          setIsTestActive(false);
        }

        // Scroll to the current line
        // if (currentWordIndex === testWords.length - 1) {
        //   setEndTime(Date.now());
        //   setIsTestActive(false);
        // }
      } else {
        // Update current word error
        newWordErrors[currentWordIndex] = input.length > currentWord.length ? input : '';
        setWordErrors(newWordErrors);
        setCurrentCharacterIndex(input.length);


        if(input === finalWord && currentWordIndex === testWords.length - 1) {
          setEndTime(Date.now());
          setIsTestActive(false);
        }

      }
    }
  };

  const calculateWPM = useCallback(() => {
    if (!startTime || !isTestActive) 
      return Math.round((correctlyTypedCharacters / 5) / (endTime - startTime));
    const currentTime = Date.now();
    const timeInMinutes = (currentTime - startTime) / 60000;
    const currentWpm = Math.round((correctlyTypedCharacters / 5) / timeInMinutes);
    // setWpm(currentWpm);
    return currentWpm;
  }, [startTime, correctlyTypedCharacters, isTestActive, endTime]);

  useEffect(() => {
    let intervalId;
    if (isTestActive) {
      intervalId = setInterval(() => {
        setWpm(calculateWPM());
      }, 100);
    }
    return () => clearInterval(intervalId);
  }, [calculateWPM, isTestActive]);

  const restartTest = () => {

    if (typingContainerRef.current) {
      typingContainerRef.current.scrollTop = 0;
    }

    setCurrentWordIndex(0);
    setTotalTypedCharacters(0);
    setCorrectlyTypedCharacters(0);
    setCurrentCharacterIndex(0);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setIsTestActive(false);
    setWordErrors(new Array(testWords.length).fill(''));
    setTotalCharacterErrors(0)
    setRemainingTime(time)
    setPerformanceData([])

    var words = enWords;
    if(language == 'en') {
      words = enWords;
    } else if (language == 'sp') {
      words = esWords;
    } else {
      words = frWords;
    }

    const topWords = words.words
      .filter(word => word.rank <= difficulty)
      .map(word => words == enWords ? word.englishWord : word.targetWord);
    const shuffled = topWords.sort(() => 0.5 - Math.random());
    const selectedWords = shuffled.slice(0, shuffled.length);
    setTestWords(selectedWords);
    setWordErrors(new Array(selectedWords.length).fill(''));
      
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }

      setTimeout(scrollToCurrentLine, 0)
    }, 0);
  };

  const scrollToCurrentLine = () => {
  if (typingContainerRef.current) {
    const container = typingContainerRef.current;
    const currentWordElement = container.querySelector('.current-word');
    if (currentWordElement) {
      const containerRect = container.getBoundingClientRect();
      const wordRect = currentWordElement.getBoundingClientRect();

      // Calculate the position of the current word relative to the container
      const relativeWordTop = wordRect.top - containerRect.top;

      // Check if the word is in the last 1/3 of the container
      if (relativeWordTop > (containerRect.height * 1/2)) {
        // If so, scroll up by 1/3 of the container's height
        const scrollAmount = containerRect.height / 3;
        container.scrollBy({
          top: scrollAmount,
          behavior: 'auto'
        });
      }
    }
  }
};

// let isScrolling = false;

// const scrollToCurrentLine = () => {
//   if (isScrolling) return;
  
//   isScrolling = true;
  
//   if (typingContainerRef.current) {
//     const container = typingContainerRef.current;
//     const currentWordElement = container.querySelector('.current-word');
//     if (currentWordElement) {
//       const containerRect = container.getBoundingClientRect();
//       const wordRect = currentWordElement.getBoundingClientRect();
//       const relativeWordTop = wordRect.top - containerRect.top;

//       if (relativeWordTop > (containerRect.height * 2/3)) {
//         const scrollAmount = containerRect.height / 3;
//         const startPosition = container.scrollTop;
//         const endPosition = startPosition + scrollAmount;
//         let start = null;

//         const step = (timestamp) => {
//           if (!start) start = timestamp;
//           const progress = timestamp - start;
//           container.scrollTop = startPosition + (progress / 100) * scrollAmount; // Adjust 100 for speed

//           if (container.scrollTop < endPosition) {
//             requestAnimationFrame(step);
//           } else {
//             isScrolling = false;
//           }
//         };

//         requestAnimationFrame(step);
//       } else {
//         isScrolling = false;
//       }
//     }
//   }
// };

  const calculateErrors = () => {
    return totalCharacterErrors;
  };

  const calculateAccuracy = () => {
    return totalTypedCharacters > 0 
      ? Math.round((correctlyTypedCharacters / totalTypedCharacters) * 100) 
      : 0;
  };

  const updatePerformanceData = useCallback(() => {
    if (isTestActive && startTime) {
      const currentTime = Date.now();
      const timeElapsed = Math.floor((currentTime - startTime) / 1000); // in seconds
      const currentWPM = calculateWPM();
      const currentAccuracy = calculateAccuracy();
  
      setPerformanceData(prevData => {
        // Only add a new data point if the timeElapsed is different from the last one
        if ((prevData.length === 0 || prevData[prevData.length - 1].timeElapsed !== timeElapsed) && timeElapsed >= 1) {
          return [...prevData, { timeElapsed, wpm: currentWPM, accuracy: currentAccuracy }];
        }
        return prevData;
      });
    }
  }, [isTestActive, startTime, calculateWPM, calculateAccuracy]);
  
  // Add this useEffect to update performance data every second
  useEffect(() => {
    let intervalId;
    if (isTestActive && startTime) {
      console.log(startTime);
      intervalId = setInterval(updatePerformanceData(), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isTestActive, startTime, updatePerformanceData]);

  return (
    <div className='main'>
      {!endTime ? (
        <div style={{padding: '0 10%', height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', fontSize: 'clamp(1.5em, 4vw, 30px)'}}>
          <div className='remainingTime'>
            {remainingTime}
          </div>
          {!startTime ? (
            ''
          ) : (
            <div className ='wpm'>
              {wpm}
            </div>
          )}
        </div>
      ) : (
        <>
          {
          
          
          <div style={{padding: '90px 10% 30px 10%', fontSize: '20px', overflowX: 'auto'}}>
            <PerformanceGraph performanceData={performanceData} />
          </div>
          /* <Row gutter={[16, 16]} style={{padding:'33px 10%',}}>
            <Col xs={24} sm={8}>
              <Card title="Words Per Minute" bordered={false} style={{boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                {wpm}
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card title="Time Remaining" bordered={false} style={{boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                {remainingTime}
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card title="Accuracy" bordered={false} style={{boxShadow: '2px 2px 2px 2px rgba(0, 0, 0, 0.3)', textAlign: 'center'}}>
                {calculateAccuracy()}%
              </Card>
            </Col>
          </Row> */}
        </>
      )}
      <div ref={typingContainerRef}  className='typing-container' style={{
        textAlign:'left', 
        padding:'0 10%', 
        // paddingTop:'50px',
        maxWidth: '100%',
        maxHeight: '150px',
        overflowY:'hidden',
        lineHeight: '3em',
        scrollBehavior: 'smooth',
        msOverflowStyle: 'none',  // Hide scrollbar in IE and Edge
        scrollbarWidth: 'none',   // Hide scrollbar in Firefox
      }}>

        {endTime ? (
          <div style={{display: 'block', overflow: 'hidden'}}>
            <center><Button onClick={restartTest} style={{height: '75px', width: '75px', fontSize: '30px'}}><RedoOutlined/></Button></center>
          </div>
        ) : (
          <>
            <div style={{
              fontSize: 'clamp(2.5em, 4vw, 30px)', 
              marginBottom: '20px', 
              position: 'relative',
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
              overflowWrap: 'break-word',
              fontFamily: 'monospace',
              fontWeight: '100',
              letterSpacing: '1px',
            }}>
              <div style={{
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 1
              }}></div>
              <div style={{position: 'relative', zIndex: 2}}>
                {testWords.map((word, wordIndex) => (
                  <span key={wordIndex} 
                    className={wordIndex === currentWordIndex ? 'current-word' : ''}
                    style={{
                    backgroundColor: wordIndex === currentWordIndex ? '#f2f2f2' : 'transparent',
                    padding: '0 4px',
                    margin: '0 4px',
                    borderRadius: '3px',
                    display: 'inline-block'
                  }}>
                    {word.split('').map((letter, letterIndex) => (

                      <span key={letterIndex} style={{
                        color: 
                          wordIndex > currentWordIndex ? '#a6a6a6' :
                          wordIndex === currentWordIndex && letterIndex === currentCharacterIndex ? 'black' :
                          wordIndex === currentWordIndex && letterIndex < userInput.length ? 
                            (letter === userInput[letterIndex] ? 'green' : '#a56961') :
                          wordIndex < currentWordIndex ? 
                            (wordErrors[wordIndex] && letterIndex < wordErrors[wordIndex].length ? 
                              (letter === wordErrors[wordIndex][letterIndex] ? 'green' : '#a56961') : 
                              'green') :
                          '#a6a6a6',
                      }}>
                        {wordIndex < currentWordIndex && wordErrors[wordIndex] && letterIndex < wordErrors[wordIndex].length ? 
                          wordErrors[wordIndex][letterIndex] : letter}
                      </span>
                    ))}
                    {wordIndex === currentWordIndex && userInput.length > word.length && (
                      <span style={{color: '#a56961'}}>
                        {userInput.slice(word.length)}
                      </span>
                    )}
                    {wordIndex < currentWordIndex && wordErrors[wordIndex] && wordErrors[wordIndex].length > word.length && (
                      <span style={{color: '#a56961'}}>
                        {wordErrors[wordIndex].slice(word.length)}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      {endTime ? ( '' 
      ) : (
        <div style={{justifyContent: 'space-between', paddingTop: '20px'}}>
          <center><Input
                  ref={inputRef}
                  variant="Outlined"
                  value={userInput}
                  onChange={handleInputChange}
                  style={{
                    fontSize: 'clamp(16px, 4vw, 30px)', 
                    padding: '5px', 
                    width: '100%', 
                    maxWidth: '300px', 
                    border: '0.7mm solid #adadad',
                  }}
                  autoFocus/>
                <Button onClick={restartTest} style={{border: 'none', padding: '5px'}}><RedoOutlined /></Button></center>
          </div>

            )};
    </div>
  );
};

TypingTestBody.propTypes = {
  fieldValues: PropTypes.shape({
    language: PropTypes.string,
    difficulty: PropTypes.string,
    time: PropTypes.string,
  })
};

export default TypingTestBody;