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

app.post('/admin/point-reward/point', async (req, res) => {
  try {
    await DCQuery.points.updateOneRow({
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