import React from 'react';
import './trial-page.css';
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';
import axios from 'axios';

class TrialPage extends React.Component {
    state = {
        data: [],
        id: 0,
        location: "",
        salary: 0,
        internships: 0,
        equity: 0,
        signing_bonus: 0,
        location_filter: "",
        internships_filter: 0,
        intervalIsSet: false,
        idToDelete: null,
        idToUpdate: null,
        objectToUpdate: null,
        country: '',
        region: '',
        zipcode_filter: '',
        radius: 30,
        valid_zips: []
    };

    selectCountry(val) {
        this.setState({ country: val });
    }

    selectRegion(val) {
        this.setState({ region: val });
    }

    // when component mounts, first thing it does is fetch all existing data in our db
    // then we incorporate a polling logic so that we can easily see if our db has
    // changed and implement those changes into our UI
    componentDidMount() {
        this.getDataFromDb();
        if (!this.state.intervalIsSet) {
            let interval = setInterval(this.getDataFromDb, 1000);
            this.setState({ intervalIsSet: interval });
        }
    }

    // never let a process live forever
    // always kill a process everytime we are done using it
    componentWillUnmount() {
        if (this.state.intervalIsSet) {
            clearInterval(this.state.intervalIsSet);
            this.setState({ intervalIsSet: null });
        }
    }

    // just a note, here, in the front end, we use the id key of our data object
    // in order to identify which we want to Update or delete.
    // for our back end, we use the object id assigned by MongoDB to modify
    // data base entries

    // our first get method that uses our backend api to
    // fetch data from our data base
    getDataFromDb = () => {
        fetch('http://localhost:3001/api/getData')
            .then((data) => data.json())
            .then((res) => this.setState({ data: res.data }));
    };

    // our put method that uses our backend api
    // to create new query into our data base
    putDataToDB = ({ location, salary, internships, equity, signing_bonus }) => {
        console.log(location);
        let currentIds = this.state.data.map((data) => data.id);
        let idToBeAdded = 0;
        while (currentIds.includes(idToBeAdded)) {
            ++idToBeAdded;
        }

        axios.post('http://localhost:3001/api/putData', {
            id: idToBeAdded,
            location: location,
            salary: salary,
            internships: internships,
            equity: equity,
            signing_bonus: signing_bonus
        });
    };

    // our delete method that uses our backend api
    // to remove existing database information
    deleteFromDB = (idTodelete) => {
        parseInt(idTodelete);
        let objIdToDelete = null;
        this.state.data.forEach((dat) => {
            if (dat.id == idTodelete) {
                objIdToDelete = dat._id;
            }
        });

        axios.delete('http://localhost:3001/api/deleteData', {
            data: {
                id: objIdToDelete,
            },
        });
    };

    // our update method that uses our backend api
    // to overwrite existing data base information
    updateDB = (idToUpdate, updateToApply) => {
        let objIdToUpdate = null;
        parseInt(idToUpdate);
        this.state.data.forEach((dat) => {
            if (dat.id == idToUpdate) {
                objIdToUpdate = dat._id;
            }
        });

        axios.post('http://localhost:3001/api/updateData', {
            id: objIdToUpdate,
            update: { message: updateToApply },
        });
    };

    render() {
        const { data } = this.state;
        const { country, region } = this.state;
        return (
            <div>
                <ul>
                    {data.length <= 0
                        ? 'NO DB ENTRIES YET'
                        : data.filter(({ location, salary, internships, equity, signing_bonus }) => {
                            return location === this.state.location_filter && salary > 80000 && internships == this.state.internships_filter;
                        }).map((dat) => (
                            <li style={{ padding: '10px' }} key={dat.id}>
                                <span style={{ color: 'gray' }}> id: </span> {dat.id} <br />
                                <span style={{ color: 'gray' }}> Location: </span> {dat.location} <br />
                                <span style={{ color: 'gray' }}> Salary: </span> {dat.salary} <br />
                                <span style={{ color: 'gray' }}> Internships: </span> {dat.internships} <br />
                                <span style={{ color: 'gray' }}> Equity: </span> {dat.equity} <br />
                                <span style={{ color: 'gray' }}> Signing Bonus: </span> {dat.signing_bonus} <br />
                            </li>
                        ))}
                </ul>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        onChange={(e) => this.setState({ location: e.target.value })}
                        placeholder="location"
                        style={{ width: '200px' }}
                    />
                    <input
                        type="number"
                        onChange={(e) => this.setState({ salary: e.target.value })}
                        placeholder="salary"
                        style={{ width: '200px' }}
                    />
                    <input
                        type="number"
                        onChange={(e) => this.setState({ internships: e.target.value })}
                        placeholder="internships"
                        style={{ width: '200px' }}
                    />
                    <input
                        type="number"
                        onChange={(e) => this.setState({ equity: e.target.value })}
                        placeholder="equity"
                        style={{ width: '200px' }}
                    />
                    <input
                        type="number"
                        onChange={(e) => this.setState({ signing_bonus: e.target.value })}
                        placeholder="signing bonus"
                        style={{ width: '200px' }}
                    />
                    <button onClick={() => this.putDataToDB(this.state)}>
                        ADD
              </button>
                </div>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ idToDelete: e.target.value })}
                        placeholder="put id of item to delete here"
                    />
                    <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
                        DELETE
              </button>
                </div>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ idToUpdate: e.target.value })}
                        placeholder="id of item to update here"
                    />
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ updateToApply: e.target.value })}
                        placeholder="put new value of the item here"
                    />
                    <button
                        onClick={() =>
                            this.updateDB(this.state.idToUpdate, this.state.updateToApply)
                        }
                    >
                        UPDATE
              </button>
                </div>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ location_filter: e.target.value })}
                        placeholder="Seattle"
                    />
                </div>
                <div style={{ padding: '10px' }}>
                    <input
                        type="number"
                        style={{ width: '200px' }}
                        onChange={(e) =>
                            this.setState({ internships_filter: e.target.value })
                        }
                    />
                </div>
                <div>
                    <form>
                        <select name="country" className="countries order-alpha presel-US" id="countryId">
                            <option value="">Select Country</option>
                        </select>
                        <select name="state" className="states order-alpha" id="stateId">
                            <option value="">Select State</option>
                        </select>
                        <select name="city" className="cities order-alpha" id="cityId">
                            <option value="">Select City</option>
                        </select>
                        <script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
                        <script src="//geodata.solutions/includes/countrystatecity.js"></script>
                    </form>
                </div>
                <div>
                    <CountryDropdown
                        value={country}
                        onChange={(val) => this.selectCountry(val)} />
                    <RegionDropdown
                        country={country}
                        value={region}
                        onChange={(val) => this.selectRegion(val)} />
                </div>
                
                <div style={{ padding: '10px' }}>
                    <input
                        type="number"
                        style={{ width: '200px' }}
                        onChange={(e) =>
                            this.setState({ radius: e.target.value })
                        }
                    />
                </div>
            </div>
        );
    }
}

async function findZipCodes(zip, radius) {
    let j = await fetch(`https://api.zip-codes.com/ZipCodesAPI.svc/1.0/FindZipCodesInRadius?zipcode=${zip}&minimumradius=0&maximumradius=${radius}&key=DEMOAPIKEY`);

    let data = await j.json();
    // .then(data => {return data.json()})
    // .then(res=>console.log(res))
    // .catch(error=>console.log(error));
    // console.log('Printing state');
    console.log(data.DataList.map(entry => entry.Code).length);
    // console.log(this.state.valid_zips);

}

export default TrialPage;