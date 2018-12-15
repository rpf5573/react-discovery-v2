import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import _ from 'lodash';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Alert, Input, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText, FormGroup, Label } from 'reactstrap';
import { closeModal, uploadImageFile } from '../../actions';
import 'whatwg-fetch';

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
    fd.append('companyImage', companyImage, companyImage.name);
    const response = await fetch('/admin/upload', {
      method: 'POST',
      body: fd
    });
    
    if ( response.status == 201 ) {
      this.props.uploadImageFile({
        companyImage: companyImage.name
      })
      alert("성공");
    } else {
      alert("알 수 없는 에러가 발생하였습니다");
    }
  }
  async mapFileSelectHandler(e) {
    const map = e.target.files[0];
    const fd = new FormData();
    fd.append('map', map, map.name);
    const response = await fetch('/admin/upload', {
      method: 'POST',
      body: fd
    });
    
    if ( response.status == 201 ) {
      this.props.uploadImageFile({
        map: map.name
      });
      alert("성공");
    } else {
      alert("알 수 없는 에러가 발생하였습니다");
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
                    <img src={"uploads/"+this.props.map} width="100px" height="auto"></img>
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