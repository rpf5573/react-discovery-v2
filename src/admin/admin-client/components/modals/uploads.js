import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import * as utils from '../../../../utils/client';
import * as constants from '../../../../utils/constants';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label } from 'reactstrap';
import { closeModal, uploadImageFile } from '../../actions';
import axios from 'axios';

class Uploads extends React.Component {

  constructor(props) {
    super(props);
    this.passwordInputFields = [];
    this.close = this.close.bind(this);
    this.companyImageFileSelectHandler = this.companyImageFileSelectHandler.bind(this);
    this.mapFileSelectHandler = this.mapFileSelectHandler.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  async companyImageFileSelectHandler(e) {
    const companyImage = e.target.files[0];
    const fd = new FormData();
    let fileExtension = utils.getFileExtension(companyImage.name);
    const ranNum = utils.getRandomInteger(1, 100);
    const filename = 'companyImage-' + ranNum + '.' + fileExtension;
    fd.append('companyImage', companyImage, filename);

    try {
      const response = await axios({
        method: 'POST',
        url: '/admin/upload',
        data: fd
      });
      
      if ( response.status == 201 ) {
        if ( response.data.error ) {
          return alert( response.data.error );
        }
        this.props.uploadImageFile({
          companyImage: filename
        })
        alert("성공");
      } else {
        alert( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      alert( constants.ERROR.unknown );
    }
  }
  async mapFileSelectHandler(e) {
    const map = e.target.files[0];
    const fd = new FormData();
    let fileExtension = utils.getFileExtension(map.name);
    const ranNum = utils.getRandomInteger(1, 100);
    const filename = 'map-' + ranNum + '.' + fileExtension;
    fd.append('map', map, filename);

    try {
      const response = await axios({
        method: 'POST',
        url: '/admin/upload',
        data: fd
      });
      
      if ( response.status == 201 ) {
        if ( response.data.error ) {
          return alert( response.data.error );
        }
        this.props.uploadImageFile({
          map: filename
        });
        alert("성공");
      } else {
        alert( constants.ERROR.unknown );
      }
    } catch(e) {
      console.error(e);
      alert( constants.ERROR.unknown );
    }
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="md">
        <ModalHeader toggle={this.close}>
          <span>이미지 설정</span>
        </ModalHeader>
        <ModalBody>
          <Row>
            <FormGroup className={"w-100"}>
              <Col>
                <Label>회사 이미지 업로드</Label>
              </Col>
              <Col>
                <div className={"d-flex justify-content-between w-100"}>
                  <input style={{display:'none'}} className="form-control" type="file" onChange={this.companyImageFileSelectHandler} ref={fileInput => this.companyImageFileInput = fileInput}/>
                  <Button className={"align-self-center"} color="success" onClick={() => this.companyImageFileInput.click()}>파일 선택</Button>
                  <div>
                    <img src={"/admin/uploads/"+this.props.companyImage} width="100px" height="auto"></img>
                  </div>
                </div>
              </Col>
            </FormGroup>
          </Row>
          <Row>
            <FormGroup className={"w-100"}>
              <Col>
                <Label>전체지도 업로드</Label>
              </Col>
              <Col>
                <div className={"d-flex justify-content-between w-100"}>
                  <input style={{display:'none'}} className="form-control" type="file" onChange={this.mapFileSelectHandler} ref={fileInput => this.mapFileInput = fileInput}/>
                  <Button className={"align-self-center"} color="success" onClick={() => this.mapFileInput.click()}>파일 선택</Button>
                  <div>
                    <img src={"admin/uploads/"+this.props.map} width="100px" height="auto"></img>
                  </div>
                </div>
              </Col>
            </FormGroup>
          </Row>
        </ModalBody>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return { 
    activeModalClassName: state.modalControl.activeModalClassName,
    companyImage: state.uploads.companyImage,
    map: state.uploads.map
  };
}

export default connect(mapStateToProps, { closeModal, uploadImageFile })(Uploads);