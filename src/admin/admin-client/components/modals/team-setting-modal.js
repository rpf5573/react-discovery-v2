import React from 'react';
import { connect } from 'react-redux';
import classnames from 'classnames';
import * as utils from '../../../../utils/client';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, TabContent, TabPane, Nav, NavItem, NavLink, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import { closeModal, updateTeamPasswords, updateTeamCount } from '../../actions';
import axios from 'axios';

class TeamSettingModal extends React.Component {

  constructor(props) {
    super(props);
    this.passwordInputFields = [];
    this.state = {
      activeTab: '1',
      backdrop: true,
    };
    this.close = this.close.bind(this);
    this.toggle = this.toggle.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.getNumberFromInput = this.getNumberFromInput.bind(this);
    this.validate = this.validate.bind(this);
  }

  close() {
    this.props.closeModal();
  }

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  getNumberFromInput(input) {
    var number = 0;
    var numberBox = {
      value: parseInt(input.value),
      placeholder: parseInt(input.placeholder)
    }
    if ( ! isNaN(numberBox.value) ) {
      return numberBox.value;
    }
    if ( ! isNaN(numberBox.placeholder) ) {
      return numberBox.placeholder;
    }

    return number;
  }

  validate(inputs) {
    // 1.중복 검사 - placeholder도 검사해 줘야합니다
    for( var i = 0; i < inputs.length; i++ ) {
      let l = this.getNumberFromInput(inputs[i]);
      if ( l > 0 ) {
        for( var z = i+1; z < inputs.length; z++ ) {
          let r = this.getNumberFromInput(inputs[z]);
          // placeholder끼리 비교하는 경우도 있지만,,, 뭐 어때 ! 그 둘은 절대 같을 일이 없을 텐데 ㅎㅎ
          if ( l == r ) {
            return 401;
          }
        } 
      }
    }

    // 2. 띄엄 띄엄 비밀번호 설정하는거 금지
    for( var i = 0; i < inputs.length; i++ ) {
      let next = i + 1;
      if ( next < inputs.length ) {
        var preVal = {
          value: parseInt(inputs[i].value),
          placeholder: parseInt(inputs[i].placeholder)
        }
        if ( isNaN(preVal.value) ) {
          preVal = preVal.placeholder;
        } else {
          preVal = preVal.value;
        }
        
        var nextVal = {
          value: parseInt(inputs[next].value),
          placeholder: parseInt(inputs[next].placeholder)
        }

        if ( isNaN(nextVal.value) ) {
          nextVal = nextVal.placeholder;
        } else {
          nextVal = nextVal.value;
        }

        if ( preVal == 0 && nextVal != 0 ) {
          return 402;
        }

      }
    }

    // 3. 아무것도 입력하지 않으면 안됨
    var emptyBoxCount = 0;
    for( var i = 0; i < inputs.length; i++ ) {
      let val = parseInt(inputs[i].value);
      if ( isNaN(val) ) {
        emptyBoxCount++;
      }
    }
    if ( emptyBoxCount == inputs.length ) {
      return 403;
    }

    return 201;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    this.passwordInputFields = [...document.getElementsByClassName("password-input")]; // HTMLCollection to Array
    if ( this.passwordInputFields.length > 0 ) {
      // validation
      let result = this.validate(this.passwordInputFields);
      switch(result) {
        case 401:
          alert('ERROR : 중복된 비밀번호가 있습니다. 다시 확인해 주시기 바랍니다');
          return;
        case 402:
          alert( "ERROR : 비밀번호는 연속적으로 설정해 주시기 바랍니다" );
          return;
        case 403:
          alert( "ERROR : 비밀번호를 입력해 주시기 바랍니다" );
          return;
      }

      // 이제 값 추출
      var teamPasswords = [];
      for( var i = 0; i < this.passwordInputFields.length; i++ ) {
        let val = parseInt(this.passwordInputFields[i].value);
        if ( !isNaN(val) ) { // 0이 들어와도 되기는 한다
          teamPasswords.push({
            team: (i+1),
            password: val
          });
        }
      }

      const config = {
        method: 'POST',
        url: '/admin/team-settings/passwords',
        data: {
          teamPasswords: teamPasswords
        }
      };

      utils.simpleAxios(axios, config).then(response => {
        let newTeamPasswords = response.data;
        for ( var i = 0; i < teamPasswords.length; i++ ) {
          let index = teamPasswords[i].team - 1;
          let value = teamPasswords[i].password;
          this.passwordInputFields[index].placeholder = value;
          this.passwordInputFields[index].value = '';
        }

        var teamCount = this.passwordInputFields.reduce((accumulator, input, index, array)=>{
          let val = parseInt(input.placeholder);
          if ( !isNaN(val) && val != 0 ) {
            accumulator++;
          }
          return accumulator;
        }, 0);

        this.props.updateTeamPasswords(newTeamPasswords);
        this.props.updateTeamCount(teamCount);

        alert( "성공" );
      });
    }
  }

  renderPasswordInputs(passwords) {
    var inputList = [];
    if ( typeof passwords !== 'undefined' ) {
      for( var i = 1; i <= passwords.length; i++ ) {
        inputList.push(
          <Col sm="3" key={i}>
            <InputGroup>
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  {i}
                </InputGroupText>
              </InputGroupAddon>
              <input type="number" min="0" className="form-control password-input" placeholder={passwords[i-1].password} />
            </InputGroup>
          </Col>
        );
      }
    }

    return inputList;
  }

  render() {
    return (
      <Modal isOpen={ (this.props.activeModalClassName == this.props.className) ? true : false } toggle={this.close} className={this.props.className} size="lg">
        <form id="form-team-settings" onSubmit={this.handleFormSubmit}>
          <ModalHeader toggle={this.close}>
            <span>팀설정</span>
          </ModalHeader>
          <ModalBody>
            <Nav tabs>
              <NavItem>
                <NavLink 
                  className={classnames({ active: this.state.activeTab === '1' })} 
                  onClick={() => { this.toggle('1'); }}
                >
                  비밀번호
                </NavLink>
              </NavItem>
            </Nav>
            <TabContent activeTab={this.state.activeTab}>
              <TabPane tabId="1">
                <Row>
                  { this.renderPasswordInputs(this.props.teamPasswords) }
                </Row>
              </TabPane>
            </TabContent>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" type="submit">적용</Button>
            <Button color="secondary" onClick={this.close}>취소</Button>
          </ModalFooter>
        </form>
      </Modal>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    activeModalClassName : state.modalControl.activeModalClassName,
    teamPasswords : state.teamSettings.teamPasswords
  };
}

export default connect(mapStateToProps, { closeModal, updateTeamPasswords, updateTeamCount })(TeamSettingModal);