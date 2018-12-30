import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Button, Row, Col, InputGroup, InputGroupAddon, InputGroupText } from 'reactstrap';
import axios from 'axios';

class Point extends Component {

  constructor(props) {
    super(props);

    this.pointInputFields = [];
    this.renderPointInputs = this.renderPointInputs.bind(this);
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    this.pointInputFields = [...document.getElementsByClassName("point-input")]; // HTMLCollection to Array
    if ( this.pointInputFields.length > 0 ) {

      var allEmpty = true;
      // 이제 값 추출
      var points = [];
      for( var i = 0; i < this.pointInputFields.length; i++ ) {
        let val = parseInt(this.pointInputFields[i].value);
        if ( !isNaN(val) && val > 0 ) { // 0이 들어와도 되기는 한다
          allEmpty = false;
          points.push({
            team: (i+1),
            temp: val // 무족권 temp에 넣는다리 !
          });
        }
      }

      if ( allEmpty ) {
        return alert("포인트를 입력해 주시기 바랍니다");
      }

      try {
        let response = await axios({
          method: 'POST',
          url: '/admin/point-reward/points',
          data: {
            points
          }
        });

        if ( response.status == 201 && !response.data.error ) {
          for( var i = 0; i < this.pointInputFields.length; i++ ) {
            let input = this.pointInputFields[i];
            let val = parseInt(input.value);
            if ( ! isNaN(val) && val > 0 ) {
              input.value = '';
              input.placeholder = val;
            }
          }
          alert( "성공" );
          return;
        } else {
          alert( response.data.error );
          return;
        }
      } catch(error) {
        console.error(error);
      }
    }
  }

  renderPointInputs(teamCount) {
    var inputList = [];
    for( var i = 1; i <= teamCount; i++ ) {
      inputList.push(
        <Col xs="6" key={i}>
          <InputGroup>
            <InputGroupAddon addonType="prepend">
              <InputGroupText>
                {i}
              </InputGroupText>
            </InputGroupAddon>
            <input type="number" min="0" className="form-control point-input" />
          </InputGroup>
        </Col>
      );
    }

    return inputList;
  }

  render() {
    return (
      <div className="point-page full-container">
        <div className="point-page-inner">
          <div className="l-top">
            <h2 className="title">점수 제공</h2>
            <Row>
              { this.renderPointInputs(this.props.teamCount) }
            </Row>
          </div>
          <div className="l-bottom">
            <Button color="primary" block onClick={this.handleFormSubmit}>확인</Button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    teamCount: state.teamCount
  };
}

export default connect(mapStateToProps, null)(Point);