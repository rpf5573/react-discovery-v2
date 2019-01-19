import React, { Component } from 'react';
import TeamSettingModal from './team-setting-modal';
import UploadModal from './upload-modal';
import TimerModal from './timer-modal';
import PuzzleSettingModal from './puzzle-setting-modal';
import PuzzleStatusModal from './puzzle-status-modal';
import PointRewardModal from './point-reward-modal';
import AdminPasswordModal from './admin-password-modal';
import MappingPointModal from './mapping-point-modal';
import ResultModal from './result-modal';
import ResetModal from './reset-modal';
import PostInfoModal from './post-info-modal';

class Modals extends Component {
  state = {  }
  render() { 
    return (
      <div className="modals">
        <TeamSettingModal className="modal--team-settings"></TeamSettingModal>
        <UploadModal className="modal--uploads"></UploadModal>
        <TimerModal className="modal--timers"></TimerModal>
        <PuzzleSettingModal className="modal--puzzle-settings"></PuzzleSettingModal>
        <PuzzleStatusModal className="modal--puzzle-status"></PuzzleStatusModal>
        <PointRewardModal className="modal--point-rewards"></PointRewardModal>
        <AdminPasswordModal className="modal--admin-passwords"></AdminPasswordModal>
        <MappingPointModal className="modal--mapping-points"></MappingPointModal>
        <PostInfoModal className="modal--post-infos"></PostInfoModal>
        <ResultModal className="modal--result"></ResultModal>
        <ResetModal className="modal--reset"></ResetModal>
      </div>
    );
  }
}
 
export default Modals