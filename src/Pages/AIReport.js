import React, { useCallback, useEffect, useState, useRef } from "react";
import './../chart.css';
import { toast } from 'react-toastify';
import DatePicker from "react-datepicker";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import CommonFunctions from "../utils/CommonFunctions";
import "chartjs-adapter-moment";
import {
  Chart as ChartJS,
  TimeScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  defaults
} from 'chart.js';
import { Chart, Bar, Line, Scatter } from 'react-chartjs-2';
ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

const generateDatabaseDateTime = function (date) {
  return date.replace("T", " ").substring(0, 19);
};

const generateDatabaseDateTime16 = function (date) {
  return date.replace("T", " ").substring(0, 16);
};

const formatCellValue = function (value) {
  if (typeof value === 'string') {
    const dateObject = new Date(value);

    if (!isNaN(dateObject.getTime())) {
      // It's a valid date, format it
      return generateDatabaseDateTime(value);
    }
  }

  // For other types or unhandled cases, return the original value
  return value;
};
const DynamicTable = ({ jsonData }) => {
  const headers = jsonData.length>0?Object.keys(jsonData[0]):[];
  let chartunit = "day";
  let charttype = "line";
  const isArrayOfObjects = (obj) => {
    return Array.isArray(obj) && obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null;
  };
  const isArrayOfObjectsRes=isArrayOfObjects(jsonData);
//for chart start
  // Helper function to check if a string is a valid date
const isValidDate = (dateString) => {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/;
  let iscorrect = regex.test(dateString);
  if(!iscorrect){
    const regex1 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
    iscorrect = regex1.test(dateString);
  } 
  if(!iscorrect){
    const regex2 = /^\d{4}-\d{2}-\d{2}$/;
    iscorrect = regex2.test(dateString);
  } 
  if(!iscorrect){
    const regex3 = /^\d{4}-\d{2}$/;
    iscorrect = regex3.test(dateString);
    if(iscorrect)
    chartunit ="month"
  }
  if(!iscorrect){
    const regex3 = /^\d{2}-\d{4}$/;
    iscorrect = regex3.test(dateString);
    if(iscorrect)
    chartunit ="month"
  }
  if(!iscorrect){
    const regex3 = /^\d{4}-\d{1}$/;
    iscorrect = regex3.test(dateString);
    if(iscorrect)
    chartunit ="month"
  }
   if(!iscorrect){
    const regex4 = /^\d{4}$/;
    iscorrect = regex4.test(dateString);
    if(iscorrect)
    chartunit ="year"
  }
  return iscorrect;
};

const isValidYear = (dateString) => {
  const regex = /^\d{4}$/;
  let iscorrect = regex.test(dateString);
  return iscorrect;
};

  // Function to prepare datasets dynamically from JSON data
const prepareDatasets = (jsonData) => {
  const datasetsMap = new Map();
  // Group data by StationName and ParameterName
  //if(){
  jsonData.forEach(item => {
    // Identify the column with a Date type for the X-axis
    const xAxisKey = Object.keys(item).find(key => isValidDate(item[key]));

  if (!xAxisKey) {
    // If no suitable Date type column is found, skip this item
    return;
  }

  let label="";
// Iterate through each numerical property in the item
Object.keys(item).forEach(key => {
  if (key !== xAxisKey && typeof item[key] === 'number' || item[key] === null || item[key] === '') {
       label = item?.StationName != undefined?`${item?.StationName} - ${key}`:`${key}`;
    
    charttype = item?.ChartType != undefined?`${item?.ChartType?.toLowerCase()}`:"line";

      // If the label doesn't exist in datasetsMap, create a new array for it
      if (!datasetsMap.has(label)) {
          datasetsMap.set(label, []);
      }

      // Push data to the appropriate dataset array
      if (xAxisKey && key) {
      datasetsMap.get(label).push({
          x: isValidYear(item[xAxisKey]) ? new Date(item[xAxisKey], 0, 1) : new Date(item[xAxisKey]),
          y: item[key],
      });
    }
  }
});

  });

  // sort order asc by x-axis
  datasetsMap.forEach(dataset => {
    dataset.sort((a, b) => a.x - b.x);
});

  // Convert Map to an array of datasets
  if(charttype == "bar"){
  return Array.from(datasetsMap).map(([label, data], index) => ({
    label,
    data,
    borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},1)`,
    backgroundColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`,
    borderWidth: 2, 
    borderRadius: 2
  }));
}
if(charttype == "line"){
  return Array.from(datasetsMap).map(([label, data], index) => ({
    label,
    data,
    borderColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},1)`,
    backgroundColor: `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`,
    borderWidth: 1.75,
  }));
}
  
};

const finaldatasets = isArrayOfObjectsRes ? prepareDatasets(jsonData) : [];

 const data = {
  datasets: finaldatasets,
};


const options = {
  response: true,
  scales: {
    x: {
      type: "time",
      time: {
        unit: chartunit
      }
    },
    
  }
};
  //for chart end

  return (
    <div>
      {isArrayOfObjectsRes && (
        data.datasets.length > 0 && charttype == "line" && (
          <Line options={options} data={data} height={100} />
          )
      )}
      {isArrayOfObjectsRes && (
        data.datasets.length > 0 && charttype == "bar" && (
          <Bar options={options} data={data} height={100} />
          )
      )}
      {isArrayOfObjectsRes && (
      jsonData.length>0 && (
      <div className="table-responsive mt-3">
    <table className="table table-bordered table-striped">
      <thead>
        <tr>
          {headers.map((header, index) => (
            header !="" &&  header !="ChartType" && (
            <th scope="col" key={index}>{header=="StationName"?"Station Name":header=="ParameterName"?"Parameter Name":header=="MeanValue"?"Mean Value":header=="AverageValue"?"Average Value":header}</th>
            )
          ))}
        </tr>
      </thead>
      <tbody>
        {jsonData.map((dataItem, rowIndex) => (
          <tr key={rowIndex}>
            {jsonData.length == 1 && (
             headers.map((header, colIndex) => (
              (dataItem[header] == null || dataItem[header] == "") && (
                  <td key={colIndex}><b>No Data found</b></td>
                  )
                ))
                )}
                {jsonData.length == 1 && (
             headers.map((header, colIndex) => (
              (dataItem[header] != null && dataItem[header] != "" && header !="ChartType") &&(
                  <td key={colIndex}>{formatCellValue(dataItem[header])}</td>
              )
                ))
                )}
                {jsonData.length > 1 && (
             headers.map((header, colIndex) => (
              (header !="ChartType") &&(
                  <td key={colIndex}>{formatCellValue(dataItem[header])}</td>
              )
                ))
                )}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
    )
    )}
    {isArrayOfObjectsRes && (
    jsonData.length==0 && (
    <div><b>No Data found</b></div>
    )
    )}
    {!isArrayOfObjectsRes && (
      <div><b>{jsonData?.error}</b></div>
    )}
    </div> 
  );
};
function AIReport() {
  const [chatHistory, setChatHistory] = useState([]);
  const [inputText, setInputText] = useState('');
  const [processingMessages, setProcessingMessages] = useState([]);
  const [isTitleVisible, setIsTitleVisible] = useState(true);
  const chatContainerRef = useRef(null);

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (inputText.trim() !== '') {
      const isQuestion = true;
      const newMessage = { text: inputText, isQuestion };

      setChatHistory((prevHistory) => [...prevHistory, newMessage]);

      if (isQuestion) {
        setProcessingMessages((prevMessages) => [...prevMessages, inputText]);
        handleNewMessage(inputText);
      }

      setInputText('');
      setIsTitleVisible(false); // Hide the title when a message is sent
    }
  };

  const getJsondata = async function (question) {
    let params = new URLSearchParams({ userMessage: question });
    try {
      const response = await fetch(process.env.REACT_APP_CHATGPT_API + params, {
        method: 'GET',
      });
      const data = await response.json();
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { jsonData: data, isQuestion: false },
      ]);
    } catch (error) {
      console.log("error: ", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { jsonData: [], isQuestion: false },
      ]);
    } finally {
      setProcessingMessages((prevMessages) => prevMessages.filter((msg) => msg !== question));
    }
  };

  const handleNewMessage = (question) => {
    let jsonData = getJsondata(question);
  };

  useEffect(() => {
    // Scroll to the bottom when messages change
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };


  return (
    <main id="main" className="main">
      <section className="chat-section">
        <h1 className="ai_title_name">Hello, Admin</h1>
        <div className="chatbox_main">
          
          <div ref={chatContainerRef} className="chat_messages_main">
            
          {isTitleVisible && (
            <div className="helping-title-center">
              <h1 className="ai_help_title">How can I help you today?</h1>
              <div className="additional-box">
                <div className="chat-ai-box1">
                  <label>Write code for a specific task</label>
                </div>
                <div className="chat-ai-box1">
                    <label>Trusted by Millions of Users </label>
                </div>
                <div className="chat-ai-box1">
                    <label>Provide questions for assistance.</label>
                </div>
              </div>
            </div>
        )}
              
            
        <div className="chat-messages">
        {chatHistory.map((item, index) => (
                <div key={index} className={item.isQuestion ? 'question' : 'answer'}>
                  <b>{item.text}</b>
                  {item.isQuestion && processingMessages.includes(item.text) && (
                    <span> Loading...</span>
                  )}
                  {!item.isQuestion && item.jsonData && (
                    <DynamicTable key={`table_${index}`} jsonData={item.jsonData} />
                  )}
                </div>
              ))}
        </div>
        </div>
          <div className="questionInputContainer">
            <form className="row questionInputrow" onSubmit={handleSendMessage}>
              <div className="form-group questionInputTextArea">
                <input type="text" className="form-control border-50"  id="inputchat" placeholder="Type a message"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <span className="questionInputSendButtonContainer text-right">
                  <button type="submit" className="btn btn-primary mb-2 questionInputSendButton chat_button"><i className="bi bi-send"></i></button>
                </span>
              </div>
              
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AIReport;