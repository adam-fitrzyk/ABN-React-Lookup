import { useState, useEffect } from 'react';
import ABRLookupAPI from './utilities/abrLookupAPI';

const api = new ABRLookupAPI();

/* --- RENDER TREE ---

root
    NumberLookup
        Input
        Button
        ResultDisplay
    NameLookup
        Input
        Button
        ResultDisplay
            Hoverable

*/

function Hoverable({ displayData, index, className, onMouseOver, onMouseOut }) {
    return (
        <label className={className} onMouseOver={() => onMouseOver(index)} onMouseOut={() => onMouseOut(index)} onClick={null}>{displayData}</label>
    );
}

function Button({ onClick }) {
    return (
        <button className='submit' onClick={onClick}>Submit</button>
    );
}

function Input({ value, onChange }) {
    return (
        <input type="text" value={value} onChange={onChange} />
    );
}

function NumberResultDisplay({ data }) {
    if (data['Abn'] !== '') {
        let jsx;
        for (let prop in data) {
            if ((() => {
                if (!data[prop] || data[prop] === '') {
                    return false;
                } else if (typeof data[prop] === 'object' && data[prop].length === 0) {
                    return false;
                } else {
                    return true;
                }
            })()) {
                jsx = <>
                    {jsx}
                    <label>{prop}: </label>
                    <label>{data[prop]}</label>
                    <br></br>
                </>
            }
        }
    
        return (
            <fieldset>
                <legend>Results</legend>
                {jsx}
            </fieldset>
        );
    }
}

function NameResultDisplay({ data }) {
    const [displayDataArr, setDisplayDataArr] = useState([]);
    const [hoverableClassNames, setHoverableClassNames] = useState([]);

    useEffect(() => {
        const newDisplayDataArr = [];
        const newHoverableClassNames = [];
        for (let business of data) {
            newDisplayDataArr.push(<label>Business Name: {business["Name"]}</label>);
            newHoverableClassNames.push("hoverable-default");
        }
        setDisplayDataArr(newDisplayDataArr);
        setHoverableClassNames(newHoverableClassNames);
    }, [data])

    function handleMouseOut(index) {
        const newHArr = hoverableClassNames.slice();
        newHArr[index] = "hoverable-default"; 
        const newDArr = displayDataArr.slice()
        newDArr[index] = <label>Business Name: {data[index]["Name"]}</label>;
        setHoverableClassNames(newHArr);
        setDisplayDataArr(newDArr);
    }

    function handleMouseOver(index) {
        let newDisplayData;
        for (let prop in data[index]) {
            newDisplayData = 
            <>
                {newDisplayData}
                <label>{prop}: {data[index][prop]}</label>
                <br></br>
            </>;
        }
        const newDArr = displayDataArr.slice();
        newDArr[index] = newDisplayData;
        const newHArr = hoverableClassNames.slice();
        newHArr[index] = "hoverable-expanded";
        setDisplayDataArr(newDArr);
        setHoverableClassNames(newHArr);
    }

    if (data[0] !== undefined) {
        let jsx;
        for (let index=0; index<data.length; index++) {
            jsx = <>
                {jsx}
                <Hoverable displayData={displayDataArr[index]} className={hoverableClassNames[index]} index={index} onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}/>
                <br></br>
            </>
        }
    
        return (
            <fieldset>
                <legend>Results</legend>
                {jsx}
            </fieldset>
        );
    }
}

function NumberLookup() {
    const [ABN, setABN] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [businessData, setBusinessData] = useState({});

    useEffect(() => {
        (async () => {
            const data = await api.findByABN(ABN);
            setBusinessData(data);
        })()
    }, [ABN])

    function handleClick() {
        const status = api.verifyABN(inputValue);

        if (status === true) {
            setABN(inputValue);
        } else {
            switch (status) {
                case "INVALID_LENGTH":
                    alert('Please enter a valid 11-digit Australian Business Number: must be 11 characters long')
                    break;
                case "INVALID_CHECKSUM":
                    alert('Please enter a valid 11-digit Australian Business Number: must follow ABN format')
                    break;
                case "INVALID_TYPE":
                    alert('Please enter a valid 11-digit Australian Business Number: must be a string')
                    break;
                default:
                    alert('Please enter a valid 11-digit Australian Business Number')
                    break;
            }
        }
    }

    function handleInputChange(event) {
        setInputValue(event.target.value)
    }

    return (
        <div>
            <fieldset>
                <legend>Lookup By Business Number</legend>
                <label>Australian Business Number:</label>
                {/* <input type="text" id="ABN" /> */}
                <Input value={inputValue} onChange={handleInputChange} />
                <Button onClick={handleClick} />
            </fieldset>
            <NumberResultDisplay data={businessData} type={"ABNSearch"} />
        </div>
    );
}

function NameLookup() {
    const [searchName, setSearchName] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [matchingBusinesses, setMatchingBusinesses] = useState([]);

    useEffect(() => {
        (async () => {
            const data = await api.findByName(searchName);
            setMatchingBusinesses(data);
        })()
    }, [searchName])

    function handleClick() {
        if (api.verifyName(inputValue) === true) {
            setSearchName(inputValue);
        } else {
            alert("Please enter a valid name that follows the Australian Business Name format")
        }
    }

    function handleInputChange(event) {
        setInputValue(event.target.value);
    }

    return (
        <div>
            <fieldset>
                <legend>Lookup By Business Name</legend>
                <label for="numberLookup">Australian Business Name:</label>
                <Input type="text" value={inputValue} onChange={handleInputChange} />
                <Button onClick={handleClick} />
            </fieldset>
            <NameResultDisplay data={matchingBusinesses} type={"NameSearch"} />
        </div>
    )
}

export default function Menu() {

    return (
        <div id='menu'>
            <h1>Welcome to the Australian Business Registry Lookup</h1>
            <br></br>
            <NumberLookup />
            <br></br>
            <NameLookup />
        </div>
    );
}