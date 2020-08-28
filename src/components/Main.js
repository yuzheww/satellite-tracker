import React, { Component } from "react";
import SatSetting from "./SatSetting";
import SatelliteList from "./SatelliteList";
import {
  NEARBY_SATELLITE,
  STARLINK_CATEGORY,
  SAT_API_KEY,
  SATELLITE_POSITION_URL,
} from "../constant";
import Axios from "axios";
import WorldMap from "./WorldMap";

class Main extends Component {
  constructor() {
    super();
    this.state = {
      loadingSatellites: false,
      loadingSatPositions: false,
      setting: undefined,
      selected: [],
    };
  }

  trackOnClick = (duration) => {
    const { observerLat, observerLong, observerAlt } = this.state.setting;
    const endTime = duration * 60;
    this.setState({ loadingSatPositions: true });
    const urls = this.state.selected.map((sat) => {
      const { satid } = sat;
      const url = `${SATELLITE_POSITION_URL}/${satid}/${observerLat}/${observerLong}/${observerAlt}/${endTime}/&apiKey=${SAT_API_KEY}`;
      return Axios.get(url);
    });

    Axios.all(urls)
      .then(
        Axios.spread((...args) => {
          return args.map((item) => item.data);
        })
      )
      .then((res) => {
        this.setState({
          satPositions: res,
          loadingSatPositions: false,
        });
      })
      .catch((e) => {
        console.log("err in fetch satellite position -> ", e.message);
      });
  };

  addOrRemove = (item, status) => {
    let { selected: list } = this.state;
    const found = list.some((entry) => entry.satid === item.satid);

    if (status && !found) {
      list.push(item);
    }

    if (!status && found) {
      list = list.filter((entry) => {
        return entry.satid !== item.satid;
      });
    }

    console.log(list);
    this.setState({
      selected: list,
    });
  };

  showNearbySatellite = (setting) => {
    this.setState({
      setting: setting,
    });
    this.fetchSatellite(setting);
  };

  fetchSatellite = (setting) => {
    const { observerLat, observerLong, observerAlt, radius } = setting;
    const url = `${NEARBY_SATELLITE}/${observerLat}/${observerLong}/${observerAlt}/${radius}/${STARLINK_CATEGORY}/&apiKey=${SAT_API_KEY}`;
    this.setState({
      loadingSatellites: true,
    });
    Axios.get(url)
      .then((response) => {
        this.setState({
          satInfo: response.data,
          loadingSatellites: false,
          selected: [],
        });
      })
      .catch((error) => {
        console.log("err in fetch satellite -> ", error);
        this.setState({
          loadingSatellites: false,
        });
      });
  };

  render() {
    return (
      <div className="main">
        <div className="left-side">
          <SatSetting onShow={this.showNearbySatellite} />
          <SatelliteList
            satInfo={this.state.satInfo}
            loading={this.state.loadingSatellites}
            onSelectionChange={this.addOrRemove}
            disableTrack={this.state.selected.length === 0}
            trackOnclick={this.trackOnClick}
          />
        </div>
        <div className="right-side">
          <WorldMap loading={this.state.loadingSatPositions} />
        </div>
      </div>
    );
  }
}
export default Main;
