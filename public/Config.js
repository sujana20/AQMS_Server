var TruncateorRound = "RoundOff";
var decimalDigit = 3;
var DashboardLivenumberround = 2;
var DashboardRefreshtime = 10000;
var DashboardRefreshtime = 900000;
var Dashboarddatetime = 100;
var Editflag=14;
var Okflag=1;
var Intervalval='15-M';
var LiveDataDuration = "60000";
var CommPort = ["COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9", "COM10",
    "COM11", "COM12", "COM13", "COM14", "COM15", "COM16", "COM17", "COM18", "COM19", "COM20",
    "COM21", "COM22", "COM23", "COM24", "COM25", "COM26", "COM27", "COM28", "COM29", "COM30",
    "COM31", "COM32", "COM33", "COM34", "COM35", "COM36", "COM37", "COM38", "COM39", "COM40",
    "COM41", "COM42", "COM43", "COM44", "COM45", "COM46", "COM47", "COM48", "COM49", "COM50",
    "COM51", "COM52", "COM53", "COM54", "COM55", "COM56", "COM57", "COM58", "COM59", "COM60",
    "COM61", "COM62", "COM63", "COM64", "COM65", "COM66", "COM67", "COM68", "COM69", "COM70",
    "COM71", "COM72", "COM73", "COM74", "COM75", "COM76", "COM77", "CO78", "COM79", "COM80",
    "COM81", "COM82", "COM83", "COM84", "COM85", "COM86", "COM87", "COM88", "COM89", "COM90",
    "COM911", "COM92", "COM93", "COM94", "COM95", "COM96", "COM97", "COM98", "COM99", "COM100"];
var BaudRate = ["9600", "14400", "19200", "38400", "57600", "115200", "128000", "256000"];
var Parity =["None","Odd","Even","Mark","Space"];
var StopBits=[1,1.5,2];
var Typeofsequence=['Zero','Span']
var UserRoles =[{SUPER_ADMIN: 'SUPER_ADMIN',ADMIN: 'ADMIN',MANAGER: 'MANAGER',CUSTOMER: 'CUSTOMER',GUEST: 'GUEST'}];
var ExcludeFlags=[9,10,11,12,13,16,18];
var spreadsheetrowHeight=22.6;
var nodes = [{
    value: 'Dashboard',
    label: 'Measurement Site',
    url:'/Dashboard',
    //icon:'bi bi-grid',
    img: 'images/measurment-icon.png',
    expandicon:'',
    children:false,
},
{
    value: 'Dashboard1',
    label: 'Dashboard',
    url:'/Dashboard1',
    //icon:'bi bi-grid',
    img: 'images/dashboard.png',
    expandicon:'',
    children:false,
}, 
{
    value: 'Configuration',
    label: 'Configuration',
    url:'#',
    expandicon:'bi bi-chevron-down ms-auto',
    //icon:'bi bi-menu-button-wide',
    img: 'images/configuration-icon.png',
    children: [
        { value: 'Station', label: 'Station', url:'/AddStation', icon:'bi bi-circle' },
        { value: 'Device', label: 'Device', url:'/AddDevice', icon:'bi bi-circle' },
        { value: 'Parameter', label: 'Parameter', url:'/AddParameter', icon:'bi bi-circle'},
        { value: 'Grouping', label: 'Grouping', url:'/GroupingParameter', icon:'bi bi-circle'},
    ],
},{
    value: 'Admin',
    label: 'Admin',
    url:'#',
    expandicon:'bi bi-chevron-down ms-auto',
    //icon:'bi bi-menu-button-wide',
    img: 'images/admin-icon.png',
    children: [
        { value: 'Licence', label: 'Licence', url:'/AddLicence', icon:'bi bi-circle' },
        { value: 'Users', label: 'Users', url:'/Adduser', icon:'bi bi-circle' },
        { value: 'Users Log', label: 'Users Log', url:'/UserLogHistory', icon:'bi bi-circle' },
        { value: 'Application Log', label: 'Application Log', url:'/AppLogHistory', icon:'bi bi-circle'},
        { value: 'Users Group', label: 'Users Group', url:'/UserGroups', icon:'bi bi-circle'},
    ],
},{
    value: 'Reports',
    label: 'Reports',
    url:'#',
    expandicon:'bi bi-chevron-down ms-auto',
    //icon:'bi bi-bar-chart',
    img: 'images/report-icon.png',
    children: [
        { value: 'Statistical Reports', label: 'Statistical Reports', url:'/StatisticalReport', icon:'bi bi-circle' },
        { value: 'Predefined Charts', label: 'Predefined Charts', url:'/PredefinedCharts', icon:'bi bi-circle' },
        { value: 'Detailed Analysis Report', label: 'Detailed Analysis Report', url:'/DetailedAnalysisReports', icon:'bi bi-circle'},
         { value: 'Exceedence Report', label: 'Exceedence Report', url:'/ExceedenceReport', icon:'bi bi-circle'},
        { value: 'WindRose', label: 'WindRose', url:'/WindRose', icon:'bi bi-circle'}, 
        { value: 'PollutionRose', label: 'PollutionRose', url:'/PollutionRose', icon:'bi bi-circle'},  
        { value: 'Data Validation', label: 'Data Validation', url:'/DataProcessing', icon:'bi bi-circle' },
        { value: 'Livedata', label: 'Live Data', url:'/LiveData', icon:'bi bi-circle' },
        { value: 'Data Browsing', label: 'Data Browsing', url:'/HistoricalData', icon:'bi bi-circle'},
         { value: 'AverageDataReport', label: 'Average Data Report', url:'/AverageDataReport', icon:'bi bi-circle'},
        { value: 'AI Report', label: 'AI Report', url:'/AIReport', icon:'bi bi-circle'}, 
    ],
}];

var parameterNO="NO";
var parameterNO2="NO2";
var parameterNOx="NOX";
var Noxparamcalc="NOX_ug/m3";
var RollingParameters=["CO","O3","CO_mg/m3","O3_ug/m3"]