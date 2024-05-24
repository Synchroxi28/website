
const firebaseConfig = {
    apiKey: "AIzaSyB-glT1pGcJLRpeb80g-c4r_cUNZMlWEBw",
    authDomain: "leepermanufacturing-c2ab5.firebaseapp.com",
    databaseURL: "https://leepermanufacturing-c2ab5-default-rtdb.firebaseio.com",
    projectId: "leepermanufacturing-c2ab5",
    storageBucket: "leepermanufacturing-c2ab5.appspot.com",
    messagingSenderId: "1041597606861",
    appId: "1:1041597606861:web:2f5054ce2d012a7860b284",
    measurementId: "G-3L0HZH21YP"
  };


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/*
firebase.database().ref('/').set({
    username: 'hi'
});
*/


var data;
var viewStates = ['Day', 'Week', 'Month'];

var currentDate = new Date().toDateString();
var day = currentDate.split(' ')[2];
var month = currentDate.split(' ')[1];
var year = parseInt(currentDate.split(' ')[3]);
var daysOfTheWeek = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var months = ['Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec'];
var monthsFull = ['january', 'february', 'april', 'may', 'june', 'july', 'augest', 'september', 'october', 'november', 'december']
var daysInEachMonth = [31,28,31,30,31,30,31,31,30,31,30,31];
var calendarOverviewPreviousMonth;
var daysOnCalendar = [];
var selectedProgram;

var calendarDates = document.getElementById('calendarDates');
var startDay = day - daysOfTheWeek.indexOf(currentDate.split(' ')[0]);
if (startDay < 1) {
    startDay = daysInEachMonth[months.indexOf(month) - 1] + startDay
    month = months[months.indexOf(month) - 1]
}

var items1;
var oldData;

createLoadingScreen()
firebase.database().ref('/').once('value').then((snapshot) => {
    data = snapshot.val();
    var getTimeFrame = document.getElementById('currentTimeFrame').innerText
    if (getTimeFrame == 'day') {
        startDay = day
    }
    showTime(getTimeFrame)
    homeSideScreen();

    oldData = JSON.stringify(data);
    document.getElementById('submitChanges').style.background = 'lightgreen';
});


function createLoadingScreen() {
    var loadingScreen = document.createElement('div');
    loadingScreen.setAttribute('class', 'loadingScreen')
    loadingScreen.setAttribute('id', 'loadingScreen')
    document.body.insertBefore(loadingScreen, document.getElementById("logo"));
}


var dragSrcEl = null;
function handleDragStart(e) {
    if ((this.hasAttribute('id') && this.classList[0] == 'programSquare') || (this.hasAttribute('id') && this.classList[0] == 'trash')) {
        this.style.opacity = '0.4';
        
        dragSrcEl = this;

        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
    }
    else {
        console.log('nope')
    }
}

function handleDragOver(e) {
    if (e.preventDefault) {
    e.preventDefault();
    }

    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

function handleDragEnter(e) {
    this.classList.add('over');
}

function handleDragLeave(e) {
    this.classList.remove('over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }
    
    if (dragSrcEl != this && dragSrcEl != null) {
        //background = dragSrcEl.style.background
        //dragSrcEl.style.background = this.style.background
        //this.style.background = background

        //dragSrcEl.innerHTML = this.innerHTML;
        //this.innerHTML = e.dataTransfer.getData('text/html');
        var fromRecycle = false;
        if (dragSrcEl.classList[0] == 'trash' && this.parentNode.id != 'recycleCalendar') {
            data['projects'][document.getElementById(dragSrcEl.id).innerText] = data['recycle'][document.getElementById(dragSrcEl.id).innerText];
            delete data['recycle'][document.getElementById(dragSrcEl.id).innerText];
            removed();
            fromRecycle = true;
        }

        if (fromRecycle == true) {
            console.log('Returning from recycle');
        } else if (document.getElementById(dragSrcEl.id).parentNode.childElementCount > 1) {
            var gridTemplate = document.getElementById(dragSrcEl.id).parentNode.style.gridTemplateRows
            var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) - 1
            var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows + 1) / gridTemplateRows

            document.getElementById(dragSrcEl.id).parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');

        } else {
            var squareBlank = document.createElement('div');
            squareBlank.setAttribute('class', 'squareBlank');
            squareBlank.setAttribute('id', dragSrcEl.id.split(',')[0] + ',' + (dragSrcEl.id.split(',')[1]).split('-')[0] + ',' + 'squareBlank');
            squareBlank.setAttribute('draggable', 'true');
            squareBlank.style.opacity = '1';
            document.getElementById(dragSrcEl.id).parentNode.append(squareBlank);

            item1 = squareBlank
            item1.addEventListener('dragstart', handleDragStart, false);
            item1.addEventListener('dragenter', handleDragEnter, false);
            item1.addEventListener('dragover', handleDragOver, false);
            item1.addEventListener('dragleave', handleDragLeave, false);
            item1.addEventListener('drop', handleDrop, false);
            item1.addEventListener('dragend', handleDragEnd, false);
        }

        //this.parentNode.append(document.getElementById(dragSrcEl.id));


        var monthDragFrom = document.getElementById('calendarDates').children[parseInt(dragSrcEl.id.split('day')[1])].classList[1];
        var monthDragEnd;
        var oldStartDay = parseInt((dragSrcEl.id.split(',')[1]).split('-')[0])
        if (this.classList[0] == 'programSquare') {
            var dayDragEnd = parseInt(document.getElementById('calendarDates').children[parseInt(this.id.split('day')[1])].innerText);
            monthDragEnd = document.getElementById('calendarDates').children[parseInt(this.id.split('day')[1])].classList[1];
        } else {
            var dayDragEnd = parseInt(this.id.split(',')[1])
            monthDragEnd = document.getElementById('calendarDates').children[Array.prototype.indexOf.call(this.parentNode.parentNode.children, this.parentNode)].classList[1];
        }


        var tempProgMonthsBefore = [data['projects'][dragSrcEl.id.split(',')[3]]['startMonth'], data['projects'][dragSrcEl.id.split(',')[3]]['endMonth']];
        var tempProgMonthsSlice = months.slice(months.indexOf(tempProgMonthsBefore[0]), months.indexOf(tempProgMonthsBefore[1]) + 1);
        var tempTotalDays = 0;
        for (let i = 0; i < tempProgMonthsSlice.length; i++) {
            if (tempProgMonthsSlice[i] == tempProgMonthsBefore[0]) {
                tempTotalDays = tempTotalDays + daysInEachMonth[months.indexOf(tempProgMonthsSlice[i])] - data['projects'][dragSrcEl.id.split(',')[3]]['startDay'];
            }
            if (tempProgMonthsSlice[i] == tempProgMonthsBefore[1]) {
                tempTotalDays = tempTotalDays + (data['projects'][dragSrcEl.id.split(',')[3]]['endDay'] - daysInEachMonth[months.indexOf(tempProgMonthsSlice[i])]);
            } else {
                tempTotalDays = tempTotalDays + daysInEachMonth[months.indexOf(tempProgMonthsSlice[i])] + 1;
            }
        }

        

        if (fromRecycle == true) {
            var newStartDay = dayDragEnd;
            var newEndDay = newStartDay + tempTotalDays;
            var newStartMonth = monthDragEnd;
            var newEndMonth = monthDragEnd;
            if (newEndDay > daysInEachMonth[months.indexOf(newStartMonth)]) {
                newEndDay = newEndDay - daysInEachMonth[months.indexOf(newStartMonth)]
                newEndMonth = months[months.indexOf(newEndMonth) + 1]
            }
        } else {
            var dayDragStart = parseInt(document.getElementById('calendarDates').children[parseInt(dragSrcEl.id.split('day')[1])].innerText);

            for (let i = 0; i < (months.slice(0, months.indexOf(monthDragFrom))).length; i++) { 
                dayDragStart = dayDragStart + daysInEachMonth[i];
            }
            for (let i = 0; i < (months.slice(0, months.indexOf(monthDragEnd))).length; i++) { 
                dayDragEnd = dayDragEnd + daysInEachMonth[i];
            }

            var newStartDay = oldStartDay + (dayDragEnd - dayDragStart);
            var newEndDay = newStartDay + tempTotalDays;
            var newStartMonth = tempProgMonthsBefore[0];
            var newEndMonth = newStartMonth;

            while (newStartDay > daysInEachMonth[months.indexOf(newStartMonth)]) {
                newStartDay = newStartDay - daysInEachMonth[months.indexOf(newStartMonth)]
                newEndDay = newEndDay + 1
                newStartMonth = months[months.indexOf(newStartMonth) + 1];
            }
            while (newStartDay < 1) {
                newStartDay = newStartDay + daysInEachMonth[months.indexOf(newStartMonth)] - 1
                newStartMonth = months[months.indexOf(newStartMonth) - 1];
            }

            while (newEndDay > daysInEachMonth[months.indexOf(newEndMonth)]) {
                newEndDay = newEndDay - daysInEachMonth[months.indexOf(newEndMonth)]
                newEndMonth = months[months.indexOf(newEndMonth) + 1]
            }
        }
        

        newObject = {
            startDay:parseInt(newStartDay),
            endDay:parseInt(newEndDay),
            machine:this.id.split(',')[0],
            startMonth:newStartMonth,
            endMonth:newEndMonth,
            year:document.getElementById('monthYearVisible').innerText.split(' ')[1],
        }
        data['projects'][dragSrcEl.id.split(',')[3]] = newObject;


        startDay = parseInt(document.getElementById('calendarDates').children[0].innerText)
        month = document.getElementById('monthYearVisible').innerText.split(' ')[0]

        showTime(document.getElementById('currentTimeFrame').innerText)

    }
    
    return false;
}

function handleDragEnd(e) {
    this.style.opacity = '1';
    
    items1.forEach(function (item1) {
        item1.classList.remove('over');
    });
}

function homeSideScreen() {
    document.getElementById('sideScreen').remove()
    document.getElementById('details').setAttribute('class', 'inactive')
    document.getElementById('removed').setAttribute('class', 'inactive')
    document.getElementById('newProgram').setAttribute('class', 'inactive')

    var div = document.createElement('div')
    div.setAttribute('class', 'homeSideScreen');
    div.setAttribute('id', 'sideScreen');
    document.getElementById('detailList').append(div);

    var variable1 = document.createElement('button');
    variable1.setAttribute('class', 'homeDetailButton');
    div.append(variable1);

    var variable2 = document.createElement('img');
    variable2.setAttribute('class', 'homeDetailImg');
    variable2.setAttribute('onclick', 'details()');
    variable2.src = 'imgs/details.png';
    variable1.append(variable2);
    
    //

    var variable1 = document.createElement('button');
    variable1.setAttribute('class', 'homeRemovedButton');
    div.append(variable1);

    var variable2 = document.createElement('img');
    variable2.setAttribute('class', 'homeAddImg');
    variable2.setAttribute('onclick', 'removed()');
    variable2.src = 'imgs/recycle.png';
    variable1.append(variable2);
        
    //

    var variable1 = document.createElement('button');
    variable1.setAttribute('class', 'homeAddButton');
    div.append(variable1);

    var variable2 = document.createElement('img');
    variable2.setAttribute('class', 'homeAddImg');
    variable2.setAttribute('onclick', 'newProgram()');
    variable2.src = 'imgs/plusSign.png';
    variable1.append(variable2);
        
    //

    var variable1 = document.createElement('button');
    variable1.setAttribute('class', 'homeAdminButton');
    div.append(variable1);

    var variable2 = document.createElement('img');
    variable2.setAttribute('class', 'homeAdminImg');
    variable2.setAttribute('onclick', 'adminProgram()');
    variable2.src = 'imgs/admin.png';
    variable1.append(variable2);

    var variable2 = document.createElement('div');
    variable2.setAttribute('class', 'homeAdminText');
    variable2.innerText = 'Admin Settings';
    variable1.append(variable2);
}

function adminRemove(elementID) {
    delete data['machines'][elementID.split(',')[1]];
    console.log(data)
    adminProgram();
    showTime(document.getElementById('currentTimeFrame').innerText)
}

function adminAdd(elementID) {
    adminProgram();
    var inputVariable = document.createElement('input');
    inputVariable.setAttribute('class', 'machineInput');
    inputVariable.setAttribute('id', elementID);
    document.getElementById(elementID).replaceWith(inputVariable);

    inputVariable = document.getElementById(elementID);
    inputVariable.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            if (inputVariable.value != "") {

                var newObject = {
                    [inputVariable.value]: ''
                }
                
                Object.assign(data['machines'], newObject);
                adminProgram();
                showTime(document.getElementById('currentTimeFrame').innerText)
            } else {
                console.log('empty');
            }
        }
    });
}

function adminEdit(elementID) {
    adminProgram();
    var detailVariable = document.getElementsByClassName('removeMachine')[0];
    detailVariable.setAttribute('id', elementID + ',remove')
    detailVariable.setAttribute('class', detailVariable.classList[0] + 'On')
    detailVariable.innerText = 'x';
    detailVariable.setAttribute('onclick', 'adminRemove(this.id);');
    document.getElementsByClassName('adminView')[0].append(detailVariable);

    var detailVariable = document.getElementById(elementID);
    detailVariable.removeAttribute('onclick');
    detailVariable.innerHTML = ''
    detailVariable.outerHTML = String(detailVariable.outerHTML).replace('div', 'input');
    document.getElementById(elementID).value = elementID.split(',')[1];

    document.getElementById(elementID).addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            elementEnter = document.getElementById(elementID);
            delete data['machines'][elementID.split(',')[1]];

            var swapData = {
                [elementEnter.value]: ''
            }

            Object.assign(data['machines'], swapData)

            adminProgram();
            showTime(document.getElementById('currentTimeFrame').innerText)
            
        }
    });
}

function adminProgram(){
    document.getElementById('sideScreen').remove();
    document.getElementById('details').setAttribute('class', 'inactive');
    document.getElementById('removed').setAttribute('class', 'inactive');
    document.getElementById('newProgram').setAttribute('class', 'inactive');

    var detailDiv = document.createElement('div');
    detailDiv.setAttribute('class', 'adminView');
    detailDiv.setAttribute('id', 'sideScreen');
    document.getElementById('detailList').append(detailDiv);

    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var tempMachineName = Object.keys(data[Object.keys(data)[0]])[i]

        var detailVariable = document.createElement('div');
        detailVariable.setAttribute('class', 'adminNames');
        detailVariable.setAttribute('id', 'machineDetail,' + tempMachineName)
        detailVariable.setAttribute('onclick', 'adminEdit(this.id)')
        detailVariable.innerText = tempMachineName;
        detailDiv.append(detailVariable);
    }

    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'removeMachine');
    document.getElementsByClassName('adminView')[0].append(detailVariable);

    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'addMachine');
    detailVariable.setAttribute('id', 'addMachine');
    detailVariable.innerText = 'Add New';
    detailVariable.setAttribute('onclick', 'adminAdd(this.id);');
    document.getElementsByClassName('adminView')[0].append(detailVariable);
}

function editDetails(elementID) {
    details()
    selectedProgram = elementID;
    
    quickDatabase = data['projects'][document.getElementById(elementID).innerText];
    document.getElementsByClassName('progName')[0].innerText = 'Name: ';
    document.getElementsByClassName('machineAssigned')[0].innerText = 'Machine Assigned: ';
    document.getElementsByClassName('startDay')[0].innerText = 'Start Day: ';
    document.getElementsByClassName('endDay')[0].innerText = 'End Day: ';
    document.getElementsByClassName('startMonth')[0].innerText = 'Start Month: ';
    document.getElementsByClassName('endMonth')[0].innerText = 'End Month: ';
    document.getElementsByClassName('year')[0].innerText = 'Year: ';

    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'removeProgram');
    detailVariable.innerText = 'x';
    detailVariable.setAttribute('onclick', 'removeProgram();');
    document.getElementsByClassName('details')[0].append(detailVariable)

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = document.getElementById(elementID).innerText;
    document.getElementsByClassName('progName')[0].parentNode.append(newInputElement);

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = quickDatabase['machine'];
    document.getElementsByClassName('machineAssigned')[0].parentNode.append(newInputElement);

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = quickDatabase['startDay'];
    document.getElementsByClassName('startDay')[0].parentNode.append(newInputElement);

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = quickDatabase['endDay'];
    document.getElementsByClassName('endDay')[0].parentNode.append(newInputElement);

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = quickDatabase['startMonth'];
    document.getElementsByClassName('startMonth')[0].parentNode.append(newInputElement);

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = quickDatabase['endMonth'];
    document.getElementsByClassName('endMonth')[0].parentNode.append(newInputElement);

    var newInputElement = document.createElement('input');
    newInputElement.setAttribute('class', 'detailInput');
    newInputElement.value = quickDatabase['year'];
    document.getElementsByClassName('year')[0].parentNode.append(newInputElement);

    elementEnter = document.getElementsByClassName("detailInput");

    for (let i = 0; i < elementEnter.length; i++) {
        elementEnter[i].addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                delete data['projects'][document.getElementById(elementID).innerText];

                var swapData = {
                    [elementEnter[0].value]: {
                        machine:elementEnter[1].value,
                        startDay:parseInt(elementEnter[2].value),
                        endDay:parseInt(elementEnter[3].value),
                        startMonth:elementEnter[4].value,
                        endMonth:elementEnter[5].value,
                        year:parseInt(elementEnter[6].value),
                    }
                }

                Object.assign(data['projects'], swapData)

                showDetails(selectedProgram);
                showTime(document.getElementById('currentTimeFrame').innerText)
                
            }
        });
    }

    for (let i = 0; i < daysOnCalendar.length; i++) {
        try {
            document.getElementById(selectedProgram.split('day')[0] + 'day' + i).style.background = 'rgb(252, 47, 47)';
        } catch(e) {
        }
    }
}

function showDetails(elementID){
    details();
    selectedProgram = elementID;
    
    quickDatabase = data['projects'][document.getElementById(elementID).innerText];
    document.getElementsByClassName('progName')[0].innerText = 'Name: ';
    document.getElementsByClassName('machineAssigned')[0].innerText = 'Machine Assigned: ';
    document.getElementsByClassName('startDay')[0].innerText = 'Start Day: ';
    document.getElementsByClassName('endDay')[0].innerText = 'End Day: ';
    document.getElementsByClassName('startMonth')[0].innerText = 'Start Month: ';
    document.getElementsByClassName('endMonth')[0].innerText = 'End Month: ';
    document.getElementsByClassName('year')[0].innerText = 'Year: ';

    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'removeProgram');
    detailVariable.innerText = 'x';
    detailVariable.setAttribute('onclick', 'removeProgram();');
    document.getElementsByClassName('details')[0].append(detailVariable)

    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'editDetails');
    detailVariable.innerText = 'Edit';
    detailVariable.setAttribute('onclick', 'editDetails(selectedProgram);');
    document.getElementsByClassName('details')[0].append(detailVariable)

    document.getElementsByClassName('progName')[0].innerText = document.getElementsByClassName('progName')[0].innerText + ' ' + document.getElementById(elementID).innerText;

    document.getElementsByClassName('machineAssigned')[0].innerText = document.getElementsByClassName('machineAssigned')[0].innerText + ' ' + quickDatabase['machine'];

    document.getElementsByClassName('startDay')[0].innerText = document.getElementsByClassName('startDay')[0].innerText + ' ' + quickDatabase['startDay'];

    document.getElementsByClassName('endDay')[0].innerText = document.getElementsByClassName('endDay')[0].innerText + ' ' + quickDatabase['endDay'];

    document.getElementsByClassName('startMonth')[0].innerText = document.getElementsByClassName('startMonth')[0].innerText + ' ' + quickDatabase['startMonth'];

    document.getElementsByClassName('endMonth')[0].innerText = document.getElementsByClassName('endMonth')[0].innerText + ' ' + quickDatabase['endMonth'];

    document.getElementsByClassName('year')[0].innerText = document.getElementsByClassName('year')[0].innerText + ' ' + quickDatabase['year'];

    for (let i = 0; i < daysOnCalendar.length; i++) {
        try {
            document.getElementById(selectedProgram.split('day')[0] + 'day' + i).style.background = 'rgb(3, 165, 219)';
        } catch(e) {
        }
    }

}

function details() {
    document.getElementById('sideScreen').remove();
    document.getElementById('details').setAttribute('class', 'active');
    document.getElementById('removed').setAttribute('class', 'inactive');
    document.getElementById('newProgram').setAttribute('class', 'inactive');

    showTime(document.getElementById('currentTimeFrame').innerText);

    var detailDiv = document.createElement('div');
    detailDiv.setAttribute('class', 'details');
    detailDiv.setAttribute('id', 'sideScreen');
    document.getElementById('detailList').append(detailDiv);

    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'progName');
    detailVariable.innerText = 'Name: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)

    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'machineAssigned');
    detailVariable.innerText = 'Machine Assigned: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)

    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'startDay');
    detailVariable.innerText = 'Start Day: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)

    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'endDay');
    detailVariable.innerText = 'End Day: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)

    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'startMonth');
    detailVariable.innerText = 'Start Month: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)
    
    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'endMonth');
    detailVariable.innerText = 'End Month: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)

    var detailVariable2 = document.createElement('div');
    detailVariable2.setAttribute('class', 'changeDetails')
    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'year');
    detailVariable.innerText = 'Year: Unselected';
    detailVariable2.append(detailVariable)
    detailDiv.append(detailVariable2)
}

function removed() {
    document.getElementById('sideScreen').remove();
    document.getElementById('details').setAttribute('class', 'inactive');
    document.getElementById('removed').setAttribute('class', 'active');
    document.getElementById('newProgram').setAttribute('class', 'inactive');

    showTime(document.getElementById('currentTimeFrame').innerText);

    var detailDiv = document.createElement('div');
    detailDiv.setAttribute('class', 'details');
    detailDiv.setAttribute('id', 'sideScreen');
    document.getElementById('detailList').append(detailDiv);

    //check data if recycle exists
    console.log(data['recycle'])
    if (Object.keys(data['recycle']).length > 0) {
        
        var recycleCalendar = document.createElement('div')
        recycleCalendar.setAttribute('class', 'recycleCalendar');
        recycleCalendar.setAttribute('id', 'recycleCalendar');
        detailDiv.append(recycleCalendar)

        //for amount of recycled objects in data, if none then skip
        var rows = 0;
        for (let i = 0; i < Object.keys(data[Object.keys(data)[2]]).length; i++) {

            rows = rows + 1
            recycleCalendar.style.gridTemplateRows = String('repeat(' + rows + ',' + (rows * 50) + 'px)');

            var detailVariable = document.createElement('div');
            detailVariable.setAttribute('class', 'trash');
            detailVariable.setAttribute('draggable', 'true');
            detailVariable.style.opacity = '1';
            detailVariable.style.background = 'lightblue';

            var detailVariableName = document.createElement('div');
            detailVariableName.setAttribute('class', 'programName')
            detailVariableName.innerText = Object.keys(data[Object.keys(data)[2]])[i];

            detailVariable.append(detailVariableName);

            var nameOfMachine = data[Object.keys(data)[2]][Object.keys(data[Object.keys(data)[2]])[i]]['machine']
            var startDayOfProject = data[Object.keys(data)[2]][Object.keys(data[Object.keys(data)[2]])[i]]['startDay']
            var endDayOfProject = data[Object.keys(data)[2]][Object.keys(data[Object.keys(data)[2]])[i]]['endDay']
            detailVariable.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[2]])[i] + ',day0');
            recycleCalendar.append(detailVariable);
        }

        items1 = document.querySelectorAll('.trash');
        items1.forEach(function(item1) {
            item1.addEventListener('dragstart', handleDragStart, false);
            item1.addEventListener('dragenter', handleDragEnter, false);
            item1.addEventListener('dragover', handleDragOver, false);
            item1.addEventListener('dragleave', handleDragLeave, false);
            item1.addEventListener('drop', handleDrop, false);
            item1.addEventListener('dragend', handleDragEnd, false);
        });
    }
    else {
        var noRecycle = document.createElement('div');
        noRecycle.setAttribute('class', 'noRecycle');
        noRecycle.innerText = 'No Recycle Found';
        detailDiv.append(noRecycle);
    }
}

function newProgram() {
    document.getElementById('sideScreen').remove();
    document.getElementById('details').setAttribute('class', 'inactive');
    document.getElementById('removed').setAttribute('class', 'inactive');
    document.getElementById('newProgram').setAttribute('class', 'active');

    showTime(document.getElementById('currentTimeFrame').innerText);

    var detailDiv = document.createElement('div')
    detailDiv.setAttribute('class', 'details');
    detailDiv.setAttribute('id', 'sideScreen');
    document.getElementById('detailList').append(detailDiv);

    var detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'progNameAdd');
    detailVariable.innerText = 'Name: ';
    detailDiv.append(detailVariable);
    var detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'progNameInput');
    detailVariable.setAttribute('id', 'progNameInput');
    detailVariable.value = 'Empty';
    detailDiv.append(detailVariable);

    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'machineAssignedAdd');
    detailVariable.innerText = 'Machine Assigned: ';
    detailDiv.append(detailVariable);
    detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'machineAssignedInput');
    detailVariable.setAttribute('id', 'machineAssignedInput');
    detailVariable.value = 'Empty';
    detailDiv.append(detailVariable);

    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'startDateAdd');
    detailVariable.innerText = 'Date Started: ';
    detailDiv.append(detailVariable);
    detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'startDateInput');
    detailVariable.setAttribute('id', 'startDateInput');
    detailVariable.value = 0;
    detailDiv.append(detailVariable);

    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'endDateAdd');
    detailVariable.innerText = 'Date Finished: ';
    detailDiv.append(detailVariable);
    detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'endDateInput');
    detailVariable.setAttribute('id', 'endDateInput');
    detailVariable.value = 0;
    detailDiv.append(detailVariable);

    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'startMonthAdd');
    detailVariable.innerText = 'Month Started: ';
    detailDiv.append(detailVariable);
    detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'startMonthInput');
    detailVariable.setAttribute('id', 'startMonthInput');
    detailVariable.value = 'Empty';
    detailDiv.append(detailVariable);

    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'endMonthAdd');
    detailVariable.innerText = 'Month Ended: ';
    detailDiv.append(detailVariable);
    detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'endMonthInput');
    detailVariable.setAttribute('id', 'endMonthInput');
    detailVariable.value = 'Empty';
    detailDiv.append(detailVariable);

    detailVariable = document.createElement('div');
    detailVariable.setAttribute('class', 'yearAdd');
    detailVariable.innerText = 'Year Started: ';
    detailDiv.append(detailVariable);
    detailVariable = document.createElement('input');
    detailVariable.setAttribute('class', 'yearInput');
    detailVariable.setAttribute('id', 'yearInput');
    detailVariable.value = 0;
    detailDiv.append(detailVariable);

    var recycleCalendar = document.createElement('div')
    recycleCalendar.setAttribute('class', 'recycleCalendar');
    recycleCalendar.setAttribute('id', 'newProgCalendar');
    detailDiv.append(recycleCalendar)


    //element = document.getElementById("newProgram") 
    //element.addEventListener("click", addNewProgram);

    elementEnter = document.getElementById("progNameInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });

    elementEnter = document.getElementById("machineAssignedInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });

    elementEnter = document.getElementById("startDateInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });

    elementEnter = document.getElementById("endDateInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });

    elementEnter = document.getElementById("startMonthInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });

    elementEnter = document.getElementById("endMonthInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });

    elementEnter = document.getElementById("yearInput") 
    elementEnter.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            insertNewProgram();
        }
    });
}

function insertNewProgram() {

    var name = document.getElementById('progNameInput').value
    var machineName = document.getElementById('machineAssignedInput').value
    var startDay = parseInt(document.getElementById('startDateInput').value)
    var endDay = parseInt(document.getElementById('endDateInput').value)
    var startMonth = document.getElementById('startMonthInput').value
    var endMonth = document.getElementById('endMonthInput').value
    var year = parseInt(document.getElementById('yearInput').value)

    if (startDay != 0 || endDay != 0 || startMonth != 'Empty' || endMonth != 'Empty' || year != 0 || machineName != "Empty") {

        var newObject = {
            [name]: {
                startDay:startDay,
                endDay:endDay,
                machine:machineName,
                startMonth:startMonth,
                endMonth:endMonth,
                year:year,
            }
        }
        
        Object.assign(data['projects'], newObject)

        var detailVariable = document.createElement('div');
        detailVariable.setAttribute('class', 'trash');
        detailVariable.setAttribute('draggable', 'true');
        detailVariable.style.opacity = '1';
        detailVariable.style.background = 'lightblue';

        var detailVariableName = document.createElement('div');
        detailVariableName.setAttribute('class', 'programName')
        detailVariableName.innerText = name;
        detailVariable.append(detailVariableName);

        detailVariable.setAttribute('id', machineName + ',' + startDay + '-' + endDay + ',squareProgram' + ',' + name + ',day0');
        document.getElementById('newProgCalendar').append(detailVariable);

        items1 = document.querySelectorAll('.recycleCalendar, .trash');
        items1.forEach(function(item1) {
            item1.addEventListener('dragstart', handleDragStart, false);
            item1.addEventListener('dragenter', handleDragEnter, false);
            item1.addEventListener('dragover', handleDragOver, false);
            item1.addEventListener('dragleave', handleDragLeave, false);
            item1.addEventListener('drop', handleDrop, false);
            item1.addEventListener('dragend', handleDragEnd, false);
        });
    } else {
        var newObject = {
            [name]: {
                startDay:daysOnCalendar[0],
                endDay:daysOnCalendar[0],
                machine:(document.getElementById('calendarMachines').children[0].innerText),
                startMonth:(document.getElementById('monthYearVisible').innerText.split(' ')[0]),
                endMonth:(document.getElementById('monthYearVisible').innerText.split(' ')[0]),
                year:(document.getElementById('monthYearVisible').innerText.split(' ')[1]),
            }
        }
        
        Object.assign(data['projects'], newObject)
        showTime(document.getElementById('currentTimeFrame').innerText)
    }
}

function previousMonth() {
    createLoadingScreen()
    if (months.indexOf(month) == 0) {
        month = months.slice(-1)[0]
        year = year - 1
    } else {
        month = months[months.indexOf(month) - 1];
    }
    showMonth(startDay);
}

function nextMonth() {
    createLoadingScreen()
    if (months.indexOf(month) == 11) {
        month = months[0]
        year = year + 1
    } else {
        month = months[months.indexOf(month) + 1];
    }
    showMonth(startDay);
}

function previousWeek() {
    createLoadingScreen()
    startDay = startDay - 7
    showWeek(startDay)
}

function nextWeek() {
    createLoadingScreen()
    startDay = startDay + 7
    showWeek(startDay)
}

function previousDay() {
    createLoadingScreen()
    startDay = startDay - 1
    showDay(startDay)
}

function nextDay() {
    createLoadingScreen()
    startDay = startDay + 1
    showDay(startDay)
}





function showMonth(firstDayShown) {

    document.getElementById('calendarMachines').innerHTML = '';
    document.getElementById('calendarDates').remove();
    document.getElementById('entireCalendar').innerHTML = '';

    var fixCalendarDates = document.createElement('div');
    fixCalendarDates.setAttribute('id', 'calendarDates')
    document.body.append(fixCalendarDates)
    

    document.getElementById('calendarMachines').setAttribute('class', 'calendarMachines' + document.getElementById('currentTimeFrame').innerText);
    document.getElementById('entireCalendar').setAttribute('class', 'entireCalendar' + document.getElementById('currentTimeFrame').innerText);
    document.getElementById('previousButton').setAttribute('onclick', 'previousMonth()');
    document.getElementById('nextButton').setAttribute('onclick', 'nextMonth()');

    firstDayShown = 1;
    
    document.getElementById('monthYearVisible').innerText = month + ' ' + year;
    var daysShown = daysInEachMonth[months.indexOf(month)];
    daysOnCalendar = [];
    calendarDates = document.getElementById('calendarDates');
    document.getElementById('calendarDates').setAttribute('class', 'calendarDatesMonth')
    var indexOfDayShown = firstDayShown;
    calendarOverviewPreviousMonth = month;

    for (let i = 0; i < daysShown; i++) {
        var days = document.createElement('div');

        //DAY SQUARE + NUMBER
        var dayNumber = document.createElement('div');
        dayNumber.setAttribute('class', 'dayNumberMonth')
        dayNumber.innerText = indexOfDayShown;
    
        days.setAttribute('class', 'dayNumbersMonth ' + month)
        days.append(dayNumber);
        daysOnCalendar.push(indexOfDayShown)
        calendarDates.appendChild(days);
        indexOfDayShown = indexOfDayShown + 1
    }

    var calendarMachines = document.getElementById('calendarMachines');
    calendarMachines.style.gridTemplateRows = 'repeat(' + String(Object.keys(data[Object.keys(data)[0]]).length) + ',100px)';
    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var machines = document.createElement('div');

        var machineName = document.createElement('div');
        machineName.setAttribute('class', 'machineName')
        machineName.innerText = Object.keys(data[Object.keys(data)[0]])[i];

        machines.setAttribute('class', 'machineSquare')
        machines.append(machineName);
        calendarMachines.appendChild(machines);
    }

    var entireCalendar = document.getElementById('entireCalendar');
    //set blank spaces
    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var machinePrograms = document.createElement('div');
        machinePrograms.setAttribute('class', 'calendarRowMonth');
        machinePrograms.setAttribute('id', 'calendarRow');

        for (let x = 0; x < daysOnCalendar.length; x++) {
            var gridPerSquare = document.createElement('div');
            gridPerSquare.setAttribute('class', 'gridPerSquareMonth');
            gridPerSquare.setAttribute('id', Object.keys(data[Object.keys(data)[0]])[i] + ',' + daysOnCalendar[x] + ',gridPerSqaure');
            gridPerSquare.style.gridTemplateRows = 'repeat(1,100px)';
            gridPerSquare.style.gridTemplateColumns = 'repeat(1,100px)';
            machinePrograms.append(gridPerSquare);

            var squareBlank = document.createElement('div');
            squareBlank.setAttribute('class', 'squareBlank');
            squareBlank.setAttribute('id', Object.keys(data[Object.keys(data)[0]])[i] + ',' + daysOnCalendar[x] + ',squareBlank');
            squareBlank.setAttribute('draggable', 'true');
            squareBlank.style.opacity = '1';
            gridPerSquare.append(squareBlank);
        }
        entireCalendar.appendChild(machinePrograms);

    }

    //replace with programs
    for (let i = 0; i < Object.keys(data[Object.keys(data)[1]]).length; i++) {
        var startDayOfProject = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['startDay'];
        var endDayOfProject = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['endDay'];
        var startMonth = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['startMonth'];
        var endMonth = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['endMonth'];
        var yearActive = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['year'];

        var progMonths = months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)
        var totalTimeOfProject = [];
        var tempMonth = startMonth;
        var tempIndex = startDayOfProject
        for (let y = 0; y < progMonths.length; y++) {
            totalTimeOfProject[y] = [];
            for (let x = 0; x < daysInEachMonth[months.indexOf(progMonths[y])]; x++) {
                if (tempIndex + x > daysInEachMonth[months.indexOf(tempMonth)]) {
                    tempMonth = months[months.indexOf(tempMonth) + 1];
                    tempIndex = 1;
                    break;
                } else if (tempIndex + x > endDayOfProject && tempMonth == endMonth) {
                    break;
                } else {
                    totalTimeOfProject[y][x] = tempIndex + x;
                }
            }
        }
        //daysOnCalendar.indexOf(startDayOfProject + x) != -1  && monthActive == month && yearActive == year
        //(months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)).includes(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1]) && yearActive == year
        
        for (let x = 0; x < totalTimeOfProject.length; x++) {
            for (let y = 0; y < daysOnCalendar.length; y++) {
                if (document.getElementById('calendarDates').children[y].classList[1] == progMonths[x] && totalTimeOfProject[x].includes(daysOnCalendar[y]) && year == yearActive) {
                    var programSpecific = document.createElement('div');
                    programSpecific.setAttribute('class', 'programSquare');
                    programSpecific.setAttribute('draggable', 'true');
                    programSpecific.style.opacity = '1';
                    programSpecific.style.background = 'lightblue';

                    var programName = document.createElement('div');
                    programName.setAttribute('class', 'programName');
                    programName.innerText = Object.keys(data[Object.keys(data)[1]])[i];

                    programSpecific.append(programName);

                    var nameOfMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine'];
                    var specificSquare = entireCalendar.children[Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine)].children[daysOnCalendar.indexOf(daysOnCalendar[y])].children[0];
                    programSpecific.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[1]])[i] + ',day' + y);
                    programSpecific.setAttribute('onclick', 'showDetails(this.id)');
                    if (specificSquare.id.split(',')[2] == 'squareBlank') {
                        specificSquare.replaceWith(programSpecific);
                    } else {
                        var gridTemplate = specificSquare.parentNode.style.gridTemplateRows;
                        var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) + 1;
                        var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows - 1) / gridTemplateRows;

                        specificSquare.parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');
                        
                        specificSquare.parentNode.append(programSpecific);
                        
                    }
                    //console.log(document.getElementById('calendarRow').style.gridTemplateColumns.split(' '));
                }
            }

        }


        /*

        for (let x = 0; x <= totalTime1; x++) {
            if (totalTimeOfProject[progMonths.indexOf(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1])].indexOf(startDayOfProject + x) != -1){
                if ((months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)).includes(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1]) && yearActive == year) {
                    var programSpecific = document.createElement('div');
                    programSpecific.setAttribute('class', 'programSquare');
                    programSpecific.setAttribute('draggable', 'true');
                    programSpecific.style.opacity = '1';
                    programSpecific.style.background = 'lightblue';

                    var programName = document.createElement('div');
                    programName.setAttribute('class', 'programName');
                    programName.innerText = Object.keys(data[Object.keys(data)[1]])[i];

                    programSpecific.append(programName);

                    var nameOfMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine'];
                    var specificSquare = entireCalendar.children[Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine)].children[daysOnCalendar.indexOf(startDayOfProject + x)].children[0];
                    programSpecific.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[1]])[i] + ',day' + x);
                    programSpecific.setAttribute('onclick', 'showDetails(this.id)');
                    if (specificSquare.id.split(',')[2] == 'squareBlank') {
                        specificSquare.replaceWith(programSpecific);
                    } else {
                        var gridTemplate = specificSquare.parentNode.style.gridTemplateRows;
                        var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) + 1;
                        var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows - 1) / gridTemplateRows;

                        specificSquare.parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');
                        
                        specificSquare.parentNode.append(programSpecific);
                        
                        ///
                        if (Math.abs(e['offsetY']) > (parseFloat(((this.parentNode.style.gridTemplateRows.split('(')[1]).split(',')[1]).split('p')[0]) / 2)) {
                            this.parentNode.append(document.getElementById(newId))
                        }
                        else {
                            this.parentNode.insertBefore(document.getElementById(newId), document.getElementById(this.id).parentNode.children[0]);
                        }
                        ///
                    }
                    //console.log(document.getElementById('calendarRow').style.gridTemplateColumns.split(' '));
                }
            }

        }
        */
    }


    items1 = document.querySelectorAll('.gridPerSquareMonth .programSquare, .squareBlank');
    items1.forEach(function(item1) {
        item1.addEventListener('dragstart', handleDragStart, false);
        item1.addEventListener('dragenter', handleDragEnter, false);
        item1.addEventListener('dragover', handleDragOver, false);
        item1.addEventListener('dragleave', handleDragLeave, false);
        item1.addEventListener('drop', handleDrop, false);
        item1.addEventListener('dragend', handleDragEnd, false);
    });

    try {
        document.getElementById("loadingScreen").remove();
    } catch (error){
        console.log('no loadingScreen')
    }

    var element = document.getElementById("details");
    element.addEventListener("click", details);

    var element = document.getElementById("removed") ;
    element.addEventListener("click", removed);

    var element = document.getElementById("newProgram");
    element.addEventListener("click", newProgram);

    document.getElementById('timeline').innerText = daysOnCalendar[0] + " - " + daysOnCalendar.slice(-1);
    
    calendarOverview();

}


function showWeek(firstDayShown) {

    var tempGetDay = new Date(year + '-' + month + '-' + firstDayShown);

    if (String(tempGetDay).split(' ')[0] != 'Sun' && firstDayShown > 0) {
        firstDayShown = firstDayShown - (daysOfTheWeek.indexOf(String(tempGetDay).split(' ')[0]));

        if (firstDayShown < 1) {
            if (months.indexOf(month) > 0) {
                month = months[months.indexOf(month) - 1];
                firstDayShown = parseInt(daysInEachMonth[months.indexOf(month)]) + firstDayShown;
                startDay = firstDayShown;
            } else {
                month = months.slice(-1)[0];
                firstDayShown = parseInt(daysInEachMonth[months.indexOf(month)]) + firstDayShown;
                startDay = firstDayShown;
                year = year - 1;
            }
        }
    }
    

    document.getElementById('calendarMachines').innerHTML = '';
    document.getElementById('calendarDates').remove();
    document.getElementById('entireCalendar').innerHTML = '';

    var fixCalendarDates = document.createElement('div');
    fixCalendarDates.setAttribute('id', 'calendarDates');
    document.getElementById('stickyTop').append(fixCalendarDates);

    document.getElementById('calendarMachines').setAttribute('class', 'calendarMachines' + document.getElementById('currentTimeFrame').innerText);
    document.getElementById('entireCalendar').setAttribute('class', 'entireCalendar' + document.getElementById('currentTimeFrame').innerText);
    document.getElementById('previousButton').setAttribute('onclick', 'previousWeek()');
    document.getElementById('nextButton').setAttribute('onclick', 'nextWeek()');

    if (firstDayShown < 1) {
        if (months.indexOf(month) > 0) {
            month = months[months.indexOf(month) - 1];
            firstDayShown = parseInt(daysInEachMonth[months.indexOf(month)]) - (13 - parseInt(daysOnCalendar.slice(-1)));
            startDay = firstDayShown;
        } else {
            month = months.slice(-1)[0];
            firstDayShown = parseInt(daysInEachMonth[months.indexOf(month)]) - (13 - parseInt(daysOnCalendar.slice(-1)));
            startDay = firstDayShown;
            year = year - 1;
        }
    }
    
    document.getElementById('monthYearVisible').innerText = month + ' ' + year;
    var daysShown = 7;
    daysOnCalendar = [];
    calendarDates = document.getElementById('calendarDates');
    document.getElementById('calendarDates').setAttribute('class', 'calendarDatesWeek');
    var indexOfDayShown = firstDayShown;
    calendarOverviewPreviousMonth = month;

    for (let i = 0; i < daysShown; i++) {
        var days = document.createElement('div');
        if (indexOfDayShown > daysInEachMonth[months.indexOf(month)]) {
            indexOfDayShown = 1;
            startDay = startDay - daysInEachMonth[months.indexOf(month)];
            if (months.indexOf(month) > 10) {
                month = months[0];
                year = year + 1;
            } else {
                month = months[months.indexOf(month) + 1];
            }
        }
    
        //DAY SQUARE + NUMBER
        var dayNumber = document.createElement('div');
        dayNumber.setAttribute('class', 'dayNumberWeek');
        dayNumber.innerText = indexOfDayShown;
    
        days.setAttribute('class', 'dayNumbersWeek ' + month);
        days.append(dayNumber);
        daysOnCalendar.push(indexOfDayShown);
        calendarDates.appendChild(days);
        indexOfDayShown = indexOfDayShown + 1
    }

    var calendarMachines = document.getElementById('calendarMachines');
    calendarMachines.style.gridTemplateRows = 'repeat(' + String(Object.keys(data[Object.keys(data)[0]]).length) + ',150px)';
    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var machines = document.createElement('div');

        var machineName = document.createElement('div');
        machineName.setAttribute('class', 'machineName');
        machineName.innerText = Object.keys(data[Object.keys(data)[0]])[i];

        machines.setAttribute('class', 'machineSquare');
        machines.append(machineName);
        calendarMachines.appendChild(machines);
    }

    var entireCalendar = document.getElementById('entireCalendar');
    //set blank spaces
    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var machinePrograms = document.createElement('div');
        machinePrograms.setAttribute('class', 'calendarRowWeek');
        machinePrograms.setAttribute('id', 'calendarRow');

        for (let x = 0; x < daysOnCalendar.length; x++) {
            var gridPerSquare = document.createElement('div');
            gridPerSquare.setAttribute('class', 'gridPerSquareWeek');
            gridPerSquare.setAttribute('id', Object.keys(data[Object.keys(data)[0]])[i] + ',' + daysOnCalendar[x] + ',gridPerSqaure');
            gridPerSquare.style.gridTemplateRows = 'repeat(1,150px)';
            gridPerSquare.style.gridTemplateColumns = 'repeat(1,150px)';
            machinePrograms.append(gridPerSquare);

            var squareBlank = document.createElement('div');
            squareBlank.setAttribute('class', 'squareBlank');
            squareBlank.setAttribute('id', Object.keys(data[Object.keys(data)[0]])[i] + ',' + daysOnCalendar[x] + ',squareBlank');
            squareBlank.setAttribute('draggable', 'true');
            squareBlank.style.opacity = '1';
            gridPerSquare.append(squareBlank);
        }
        entireCalendar.appendChild(machinePrograms);

    }

    //replace with programs
    for (let i = 0; i < Object.keys(data[Object.keys(data)[1]]).length; i++) {
        var startDayOfProject = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['startDay'];
        var endDayOfProject = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['endDay'];
        var startMonth = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['startMonth'];
        var endMonth = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['endMonth'];
        var yearActive = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['year'];
        var tempMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine']

        if (Object.keys(data[Object.keys(data)[0]]).includes(tempMachine)) {
            var progMonths = months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)
            var totalTimeOfProject = [];
            var tempMonth = startMonth;
            var tempIndex = startDayOfProject
            for (let y = 0; y < progMonths.length; y++) {
                totalTimeOfProject[y] = [];
                for (let x = 0; x < daysInEachMonth[months.indexOf(progMonths[y])]; x++) {
                    if (tempIndex + x > daysInEachMonth[months.indexOf(tempMonth)]) {
                        tempMonth = months[months.indexOf(tempMonth) + 1];
                        tempIndex = 1;
                        break;
                    } else if (tempIndex + x > endDayOfProject && tempMonth == endMonth) {
                        break;
                    } else {
                        totalTimeOfProject[y][x] = tempIndex + x;
                    }
                }
            }
            //daysOnCalendar.indexOf(startDayOfProject + x) != -1  && monthActive == month && yearActive == year
            //(months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)).includes(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1]) && yearActive == year
            
            for (let x = 0; x < totalTimeOfProject.length; x++) {
                for (let y = 0; y < daysOnCalendar.length; y++) {
                    if (document.getElementById('calendarDates').children[y].classList[1] == progMonths[x] && totalTimeOfProject[x].includes(daysOnCalendar[y]) && year == yearActive) {
                        var programSpecific = document.createElement('div');
                        programSpecific.setAttribute('class', 'programSquare');
                        programSpecific.setAttribute('draggable', 'true');
                        programSpecific.style.opacity = '1';
                        programSpecific.style.background = 'lightblue';

                        var programName = document.createElement('div');
                        programName.setAttribute('class', 'programName');
                        programName.innerText = Object.keys(data[Object.keys(data)[1]])[i];

                        programSpecific.append(programName);

                        var nameOfMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine'];
                        console.log(Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine))
                        var specificSquare = entireCalendar.children[Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine)].children[daysOnCalendar.indexOf(daysOnCalendar[y])].children[0];
                        programSpecific.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[1]])[i] + ',day' + y);
                        programSpecific.setAttribute('onclick', 'showDetails(this.id)');
                        if (specificSquare.id.split(',')[2] == 'squareBlank') {
                            specificSquare.replaceWith(programSpecific);
                        } else {
                            var gridTemplate = specificSquare.parentNode.style.gridTemplateRows;
                            var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) + 1;
                            var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows - 1) / gridTemplateRows;

                            specificSquare.parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');
                            
                            specificSquare.parentNode.append(programSpecific);
                        }
                        //console.log(document.getElementById('calendarRow').style.gridTemplateColumns.split(' '));
                    }
                }

            }
        }


        /*

        for (let x = 0; x <= totalTime1; x++) {
            if (totalTimeOfProject[progMonths.indexOf(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1])].indexOf(startDayOfProject + x) != -1){
                if ((months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)).includes(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1]) && yearActive == year) {
                    var programSpecific = document.createElement('div');
                    programSpecific.setAttribute('class', 'programSquare');
                    programSpecific.setAttribute('draggable', 'true');
                    programSpecific.style.opacity = '1';
                    programSpecific.style.background = 'lightblue';

                    var programName = document.createElement('div');
                    programName.setAttribute('class', 'programName');
                    programName.innerText = Object.keys(data[Object.keys(data)[1]])[i];

                    programSpecific.append(programName);

                    var nameOfMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine'];
                    var specificSquare = entireCalendar.children[Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine)].children[daysOnCalendar.indexOf(startDayOfProject + x)].children[0];
                    programSpecific.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[1]])[i] + ',day' + x);
                    programSpecific.setAttribute('onclick', 'showDetails(this.id)');
                    if (specificSquare.id.split(',')[2] == 'squareBlank') {
                        specificSquare.replaceWith(programSpecific);
                    } else {
                        var gridTemplate = specificSquare.parentNode.style.gridTemplateRows;
                        var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) + 1;
                        var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows - 1) / gridTemplateRows;

                        specificSquare.parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');
                        
                        specificSquare.parentNode.append(programSpecific);
                        
                        ///
                        if (Math.abs(e['offsetY']) > (parseFloat(((this.parentNode.style.gridTemplateRows.split('(')[1]).split(',')[1]).split('p')[0]) / 2)) {
                            this.parentNode.append(document.getElementById(newId))
                        }
                        else {
                            this.parentNode.insertBefore(document.getElementById(newId), document.getElementById(this.id).parentNode.children[0]);
                        }
                        ///
                    }
                    //console.log(document.getElementById('calendarRow').style.gridTemplateColumns.split(' '));
                }
            }

        }
        */
    }


    items1 = document.querySelectorAll('.gridPerSquareWeek .programSquare, .squareBlank');
    items1.forEach(function(item1) {
        item1.addEventListener('dragstart', handleDragStart, false);
        item1.addEventListener('dragenter', handleDragEnter, false);
        item1.addEventListener('dragover', handleDragOver, false);
        item1.addEventListener('dragleave', handleDragLeave, false);
        item1.addEventListener('drop', handleDrop, false);
        item1.addEventListener('dragend', handleDragEnd, false);
    });

    try {
        document.getElementById("loadingScreen").remove();
    } catch (error){
        console.log('no loadingScreen')
    }

    var element = document.getElementById("details");
    element.addEventListener("click", details);

    var element = document.getElementById("removed") ;
    element.addEventListener("click", removed);

    var element = document.getElementById("newProgram");
    element.addEventListener("click", newProgram);

    document.getElementById('timeline').innerText = daysOnCalendar[0] + " - " + daysOnCalendar.slice(-1);
    
    calendarOverview('week');

}


function showDay(firstDayShown) {

    document.getElementById('calendarMachines').innerHTML = '';
    document.getElementById('calendarDates').remove();
    document.getElementById('entireCalendar').innerHTML = '';

    var fixCalendarDates = document.createElement('div');
    fixCalendarDates.setAttribute('id', 'calendarDates')
    document.getElementById('stickyTop').append(fixCalendarDates)

    document.getElementById('calendarMachines').setAttribute('class', 'calendarMachines' + document.getElementById('currentTimeFrame').innerText);
    document.getElementById('entireCalendar').setAttribute('class', 'entireCalendar' + document.getElementById('currentTimeFrame').innerText);
    document.getElementById('previousButton').setAttribute('onclick', 'previousDay()');
    document.getElementById('nextButton').setAttribute('onclick', 'nextDay()');

    if (firstDayShown < 1) {
        if (months.indexOf(month) > 0) {
            month = months[months.indexOf(month) - 1];
            firstDayShown = parseInt(daysInEachMonth[months.indexOf(month)]) - (1 - parseInt(daysOnCalendar.slice(-1)));
            startDay = firstDayShown;
        } else {
            month = months.slice(-1)[0];
            firstDayShown = parseInt(daysInEachMonth[months.indexOf(month)]) - (1 - parseInt(daysOnCalendar.slice(-1)));
            startDay = firstDayShown;
            year = year - 1;
        }
    }
    
    document.getElementById('monthYearVisible').innerText = month + ' ' + year
    var daysShown = 1;
    daysOnCalendar = [];
    calendarDates = document.getElementById('calendarDates');
    document.getElementById('calendarDates').setAttribute('class', 'calendarDatesDay')
    var indexOfDayShown = firstDayShown;
    calendarOverviewPreviousMonth = month;

    for (let i = 0; i < daysShown; i++) {
        var days = document.createElement('div');
        if (indexOfDayShown > daysInEachMonth[months.indexOf(month)]) {
            indexOfDayShown = 1;
            startDay = startDay - daysInEachMonth[months.indexOf(month)]
            if (months.indexOf(month) > 10) {
                month = months[0];
                year = year + 1
            } else {
                month = months[months.indexOf(month) + 1];
            }
        }
    
        //DAY SQUARE + NUMBER
        var dayNumber = document.createElement('div');
        dayNumber.setAttribute('class', 'dayNumberDay')
        dayNumber.innerText = indexOfDayShown;
    
        days.setAttribute('class', 'dayNumbersDay ' + month)
        days.append(dayNumber);
        daysOnCalendar.push(indexOfDayShown)
        calendarDates.appendChild(days);
        indexOfDayShown = indexOfDayShown + 1
    }

    var calendarMachines = document.getElementById('calendarMachines');
    calendarMachines.style.gridTemplateRows = 'repeat(' + String(Object.keys(data[Object.keys(data)[0]]).length) + ',150px)';
    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var machines = document.createElement('div');

        var machineName = document.createElement('div');
        machineName.setAttribute('class', 'machineName')
        machineName.innerText = Object.keys(data[Object.keys(data)[0]])[i];

        machines.setAttribute('class', 'machineSquare')
        machines.append(machineName);
        calendarMachines.appendChild(machines);
    }

    var entireCalendar = document.getElementById('entireCalendar');
    //set blank spaces
    for (let i = 0; i < Object.keys(data[Object.keys(data)[0]]).length; i++) {
        var machinePrograms = document.createElement('div');
        machinePrograms.setAttribute('class', 'calendarRowDay');
        machinePrograms.setAttribute('id', 'calendarRow');

        for (let x = 0; x < daysOnCalendar.length; x++) {
            var gridPerSquare = document.createElement('div');
            gridPerSquare.setAttribute('class', 'gridPerSquareDay');
            gridPerSquare.setAttribute('id', Object.keys(data[Object.keys(data)[0]])[i] + ',' + daysOnCalendar[x] + ',gridPerSqaure');
            gridPerSquare.style.gridTemplateRows = 'repeat(1,150px)';
            gridPerSquare.style.gridTemplateColumns = 'repeat(1,150px)';
            machinePrograms.append(gridPerSquare);

            var squareBlank = document.createElement('div');
            squareBlank.setAttribute('class', 'squareBlank');
            squareBlank.setAttribute('id', Object.keys(data[Object.keys(data)[0]])[i] + ',' + daysOnCalendar[x] + ',squareBlank');
            squareBlank.setAttribute('draggable', 'true');
            squareBlank.style.opacity = '1';
            gridPerSquare.append(squareBlank);
        }
        entireCalendar.appendChild(machinePrograms);

    }

    //replace with programs
    for (let i = 0; i < Object.keys(data[Object.keys(data)[1]]).length; i++) {
        var startDayOfProject = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['startDay'];
        var endDayOfProject = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['endDay'];
        var startMonth = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['startMonth'];
        var endMonth = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['endMonth'];
        var yearActive = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['year'];

        var progMonths = months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)
        var totalTimeOfProject = [];
        var tempMonth = startMonth;
        var tempIndex = startDayOfProject
        for (let y = 0; y < progMonths.length; y++) {
            totalTimeOfProject[y] = [];
            for (let x = 0; x < daysInEachMonth[months.indexOf(progMonths[y])]; x++) {
                if (tempIndex + x > daysInEachMonth[months.indexOf(tempMonth)]) {
                    tempMonth = months[months.indexOf(tempMonth) + 1];
                    tempIndex = 1;
                    break;
                } else if (tempIndex + x > endDayOfProject && tempMonth == endMonth) {
                    break;
                } else {
                    totalTimeOfProject[y][x] = tempIndex + x;
                }
            }
        }
        //daysOnCalendar.indexOf(startDayOfProject + x) != -1  && monthActive == month && yearActive == year
        //(months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)).includes(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1]) && yearActive == year
        
        for (let x = 0; x < totalTimeOfProject.length; x++) {
            for (let y = 0; y < daysOnCalendar.length; y++) {
                if (document.getElementById('calendarDates').children[y].classList[1] == progMonths[x] && totalTimeOfProject[x].includes(daysOnCalendar[y]) && year == yearActive) {
                    var programSpecific = document.createElement('div');
                    programSpecific.setAttribute('class', 'programSquare');
                    programSpecific.setAttribute('draggable', 'true');
                    programSpecific.style.opacity = '1';
                    programSpecific.style.background = 'lightblue';

                    var programName = document.createElement('div');
                    programName.setAttribute('class', 'programName');
                    programName.innerText = Object.keys(data[Object.keys(data)[1]])[i];

                    programSpecific.append(programName);

                    var nameOfMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine'];
                    var specificSquare = entireCalendar.children[Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine)].children[daysOnCalendar.indexOf(daysOnCalendar[y])].children[0];
                    programSpecific.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[1]])[i] + ',day' + y);
                    programSpecific.setAttribute('onclick', 'showDetails(this.id)');
                    if (specificSquare.id.split(',')[2] == 'squareBlank') {
                        specificSquare.replaceWith(programSpecific);
                    } else {
                        var gridTemplate = specificSquare.parentNode.style.gridTemplateRows;
                        var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) + 1;
                        var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows - 1) / gridTemplateRows;

                        specificSquare.parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');
                        
                        specificSquare.parentNode.append(programSpecific);
                        
                        ///
                        if (Math.abs(['offsetY']) > (parseFloat(((this.parentNode.style.gridTemplateRows.split('(')[1]).split(',')[1]).split('p')[0]) / 2)) {
                            this.parentNode.append(document.getElementById(newId))
                        }
                        else {
                            this.parentNode.insertBefore(document.getElementById(newId), document.getElementById(this.id).parentNode.children[0]);
                        }
                        ///
                    }
                    //console.log(document.getElementById('calendarRow').style.gridTemplateColumns.split(' '));
                }
            }

        }


        /*

        for (let x = 0; x <= totalTime1; x++) {
            if (totalTimeOfProject[progMonths.indexOf(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1])].indexOf(startDayOfProject + x) != -1){
                if ((months.slice(months.indexOf(startMonth), months.indexOf(endMonth) + 1)).includes(document.getElementById('calendarDates').children[daysOnCalendar.indexOf(startDayOfProject + x)].classList[1]) && yearActive == year) {
                    var programSpecific = document.createElement('div');
                    programSpecific.setAttribute('class', 'programSquare');
                    programSpecific.setAttribute('draggable', 'true');
                    programSpecific.style.opacity = '1';
                    programSpecific.style.background = 'lightblue';

                    var programName = document.createElement('div');
                    programName.setAttribute('class', 'programName');
                    programName.innerText = Object.keys(data[Object.keys(data)[1]])[i];

                    programSpecific.append(programName);

                    var nameOfMachine = data[Object.keys(data)[1]][Object.keys(data[Object.keys(data)[1]])[i]]['machine'];
                    var specificSquare = entireCalendar.children[Object.keys(data[Object.keys(data)[0]]).indexOf(nameOfMachine)].children[daysOnCalendar.indexOf(startDayOfProject + x)].children[0];
                    programSpecific.setAttribute('id', nameOfMachine + ',' + startDayOfProject + '-' + endDayOfProject + ',squareProgram' + ',' + Object.keys(data[Object.keys(data)[1]])[i] + ',day' + x);
                    programSpecific.setAttribute('onclick', 'showDetails(this.id)');
                    if (specificSquare.id.split(',')[2] == 'squareBlank') {
                        specificSquare.replaceWith(programSpecific);
                    } else {
                        var gridTemplate = specificSquare.parentNode.style.gridTemplateRows;
                        var gridTemplateRows = parseFloat((gridTemplate.split('(')[1]).split(',')[0]) + 1;
                        var gridTemplateSize = parseFloat(((gridTemplate.split('(')[1]).split(',')[1]).split('p')[0]) * (gridTemplateRows - 1) / gridTemplateRows;

                        specificSquare.parentNode.style.gridTemplateRows = String('repeat(' + gridTemplateRows + ',' + gridTemplateSize + 'px)');
                        
                        specificSquare.parentNode.append(programSpecific);
                        
                        ///
                        if (Math.abs(['offsetY']) > (parseFloat(((this.parentNode.style.gridTemplateRows.split('(')[1]).split(',')[1]).split('p')[0]) / 2)) {
                            this.parentNode.append(document.getElementById(newId))
                        }
                        else {
                            this.parentNode.insertBefore(document.getElementById(newId), document.getElementById(this.id).parentNode.children[0]);
                        }
                        ///
                    }
                    //console.log(document.getElementById('calendarRow').style.gridTemplateColumns.split(' '));
                }
            }

        }
        */
    }


    items1 = document.querySelectorAll('.gridPerSquareDay .programSquare, .squareBlank');
    items1.forEach(function(item1) {
        item1.addEventListener('dragstart', handleDragStart, false);
        item1.addEventListener('dragenter', handleDragEnter, false);
        item1.addEventListener('dragover', handleDragOver, false);
        item1.addEventListener('dragleave', handleDragLeave, false);
        item1.addEventListener('drop', handleDrop, false);
        item1.addEventListener('dragend', handleDragEnd, false);
    });

    try {
        document.getElementById("loadingScreen").remove();
    } catch (error){
        console.log('no loadingScreen')
    }

    var element = document.getElementById("details");
    element.addEventListener("click", details);

    var element = document.getElementById("removed") ;
    element.addEventListener("click", removed);

    var element = document.getElementById("newProgram");
    element.addEventListener("click", newProgram);

    document.getElementById('timeline').innerText = daysOnCalendar[0] + " - " + daysOnCalendar.slice(-1);
    
    calendarOverview();

}







function swapTimeView(id) {
    if (id == 'previousTimeFrame') {

        var nextViewStatePosition = parseInt(viewStates.indexOf(document.getElementById('currentTimeFrame').innerText)) - 1;
        if (nextViewStatePosition < 0) {
            nextViewStatePosition = viewStates.length - 1;
        }
        document.getElementById('currentTimeFrame').innerText = viewStates[nextViewStatePosition];
    } else {

        var nextViewStatePosition = parseInt(viewStates.indexOf(document.getElementById('currentTimeFrame').innerText)) + 1;
        if (nextViewStatePosition >= viewStates.length) {
            nextViewStatePosition = 0;
        }
        document.getElementById('currentTimeFrame').innerText = viewStates[nextViewStatePosition];
    }

    showTime(viewStates[nextViewStatePosition])
}

function showTime(time) {
    if (time == 'Day') {
        showDay(startDay);
    } else if (time == 'Week') {
        showWeek(startDay);
    } else if (time == 'Month') {
        showMonth(startDay);
    }
}

function submit() {
    console.log('submitted')
    firebase.database().ref('/').set(data);
    document.getElementById('submitChanges').style.background = 'lightgreen';
}

function calendarClickDay(tempDay, tempMonth, temptimeFrame) {
    month = tempMonth
    startDay = parseInt(tempDay);
    firstDayShown = tempDay
    showTime(temptimeFrame)
}

function calendarOverview() {

    document.getElementById('calendarOverview').innerHTML = '';

    var tempDay = 1;
    var tempGetDay = new Date(year + '-' + month + '-' + tempDay);
    var tempMonthOverview = month

    if (String(tempGetDay).split(' ')[0] != 'Sun') {
        tempDay = daysInEachMonth[months.indexOf(tempMonthOverview) - 1] + (tempDay - (daysOfTheWeek.indexOf(String(tempGetDay).split(' ')[0])));
        tempMonthOverview = months[months.indexOf(tempMonthOverview) - 1]
    }
    for (let x = 0; x < 5; x++) {
        var rows = document.createElement('div');
        rows.setAttribute('class', 'calendarOverviewRow');
        document.getElementById('calendarOverview').append(rows);

        for (let x = 0; x < 7; x++) {
            if (tempDay > daysInEachMonth[months.indexOf(tempMonthOverview)]) {
                tempDay = 1;
                tempMonthOverview = months[months.indexOf(tempMonthOverview) + 1];
            }
            var box = document.createElement('div');
            box.setAttribute('class', 'calendarOverviewBox');
            box.setAttribute('id', 'calendarOverviewBox,' + tempDay + ',' + tempMonthOverview);
            box.setAttribute('onclick', 'calendarClickDay(this.innerText, this.id.split(",")[2], document.getElementById("currentTimeFrame").innerText)');
            box.innerText = tempDay;
            rows.append(box);
            tempDay = tempDay + 1;
        }
    }

    for (let x = 0; x < daysOnCalendar.length; x++) {
        document.getElementById('calendarOverviewBox,' + daysOnCalendar[x] + ',' + document.getElementById('calendarDates').children[x].classList[1]).style.background = 'lightblue';
    }
}

function removeProgram() {
    if (selectedProgram != undefined) {
        data['recycle'][document.getElementById(selectedProgram).innerText] = data['projects'][document.getElementById(selectedProgram).innerText]
        delete data['projects'][document.getElementById(selectedProgram).innerText]
        showTime(document.getElementById('currentTimeFrame').innerText)
    }
}

setInterval(function() {
    if (oldData != JSON.stringify(data)) {
        document.getElementById('submitChanges').style.background = 'red';
        oldData = JSON.stringify(data);
    }
}, 500);

//make submit button green
