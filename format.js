// 요게 정석
async loadFiles(e) {
  if ( ! this.props.teamCount ) {
    return alert("아직 파일을 불러올 수 없습니다.먼저 팀설정을 해주시기 바랍니다");
  }
  try {
    let response = await axios({
      method: 'POST',
      url: '/admin/load-files',
      data: {
        teamCount: this.props.teamCount
      }
    });
    if ( response.status == 201 ) {
      if ( response.data.error ) {
        return alert( response.data.error );
      } else {
        this.setState({
          files: response.data.files
        });
      }
    }
  } catch(e) {
    console.error(e);
  }
}

app.post('/admin/points/point', async (req, res) => {
  try {
    await DCQuery.points.update({
      team: req.body.team,
      useable: req.body.point
    });
    res.sendStatus(201);
  } catch (e) {
    console.log( 'e : ', e );
    res.status(201).json({
      error: 'ERROR : 알수없는 에러가 발생하였습니다'
    });
  }
});

// 요게 정석
async rewardPoint(team, point, filename) {
  try {
    let response = await axios({
      method: 'POST',
      url: '/admin/points/upload',
      data: {
        team,
        point,
        filename
      }
    });
    if ( response.status == 201 ) {
      if ( response.data.error ) {
        return alert( response.data.error );
      }
    }
  } catch(e) {
    console.error(e);
    alert( constants.ERROR.unknown );
  }
}

// 요게 진짜 정석
async loadUploadInfos(e) {
  if ( ! this.props.teamCount ) {
    return alert("아직 파일을 불러올 수 없습니다.먼저 팀설정을 해주시기 바랍니다");
  }
  try {
    let response = await axios({
      method: 'POST',
      url: '/admin/load-upload-infos',
      data: {
        teamCount: this.props.teamCount
      }
    });
    if ( response.status == 201 ) {
      if ( response.data.error ) {
        return alert( response.data.error );
      }
    } else {
      alert( constants.ERROR.unknown );
    }
  } catch(e) {
    console.error(e);
    alert( constants.ERROR.unknown );
  }
}


// 이거 쓰면 개편함 
utils.simpleAxios(axios, config, (response) => {
      
});