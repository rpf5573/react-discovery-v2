import React, { Component } from 'react';
import TeamSetting from './team-setting';
import Uploads from './uploads';
import Timer from './timer';
import PuzzleSettings from './puzzle-settings';
import PuzzleStatus from './puzzle-status';
import PointReward from './point-reward';
import AdminPasswords from './admin-passwords';
import MappingPoints from './mapping-points';
import Result from './result';
import Reset from './reset';
import PostInfo from './post-info';

class Modals extends Component {
  state = {  }
  render() { 
    return (
      <div className="modals">
        <TeamSetting className="modal--team-setting"></TeamSetting>
        <Uploads className="modal--uploads"></Uploads>
        <Timer className="modal--timer"></Timer>
        <PuzzleSettings className="modal--puzzle-settings"></PuzzleSettings>
        <PuzzleStatus className="modal--puzzle-status"></PuzzleStatus>
        <PointReward className="modal--point-reward"></PointReward>
        <AdminPasswords className="modal--admin-passwords"></AdminPasswords>
        <MappingPoints className="modal--mapping-points"></MappingPoints>
        <PostInfo className="modal--post-info"></PostInfo>
        <Result className="modal--result"></Result>
        <Reset className="modal--reset"></Reset>
      </div>
    );
  }
}
 
export default Modals