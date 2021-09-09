import * as React            from 'react';
import Spinner               from '../../../components/Spinner'
import service               from '../../../services/service';
import { Dialog, TextField } from 'material-ui-02';
import SharedMaterialStyles  from '../../../shared-material-styles';
import { withStyles }        from '@material-ui/core/styles';
import Button            from '@material-ui/core/Button';

const localStyles = {
}
const styles = {...SharedMaterialStyles, ...localStyles}

class RemoteSiteDialog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      remoteSiteName: "",
      execButtonsDisabled: true,
      errorTextSiteName: "",
      newSiteName: ""
    }
  }

  componentWillMount(){
    let localsites = [];
    service.getConfigurations(true).then((c)=>{

      c.sites.forEach((site) =>{
        localsites.push(site.name);
      });

      this.setState({
        localsites :localsites
      });
    });
  }

  componentDidUpdate(){
    if(this.props.remoteSiteName !== this.state.remoteSiteName && this.props.remoteSiteName){
      let siteName = this.props.remoteSiteName.split("/").pop();
      this.validateSiteName(siteName);
      this.setState({
        remoteSiteName: this.props.remoteSiteName,
        newSiteName: siteName
      });
    }
  }

  validateSiteName(newName){
    let errorTextSiteName = "";
    let execButtonsDisabled = false;

    if(this.state.localsites.includes(newName)){
      errorTextSiteName = "Name is already used locally."
      execButtonsDisabled = true;
    }
    this.setState({
      execButtonsDisabled: execButtonsDisabled,
      errorTextSiteName: errorTextSiteName
    });
  }

  handleNameChange(e){
    this.validateSiteName(e.target.value);
    this.setState({
      newSiteName: e.target.value
    });
  }

  async handleDownloadClone(){
    try{
      this.setState({
        busy: true,
        execButtonsDisabled: true,
        downloading: true,
      });

      await service.api.cloneRemoteAsSite(this.props.remoteSiteName, this.state.newSiteName).then((clonedSiteInfo)=>{
        service.api.invalidateCache();
        this.setState({
          busy: false,
          downloading: false,
          finished: true,
          newSiteKey: clonedSiteInfo.key,
        });
      });
    }
    catch(e){
      this.setState({
        busy: false,
        downloading: false,
        failure: true,
      });
      service.api.logToConsole("error cloning");
    }
  }

  handleDownloadCopy(){
    let nameExists = this.props.configurations.sites.filter((site)=>{
      return (site.name === this.state.newSiteName);
    });
    service.api.logToConsole(this.state.newSiteName);
    service.api.logToConsole(nameExists);
  }

  async handleOpenNewSite(){
    this.props.mountSite(this.state.newSiteKey)
  }

  renderForm(){
    return (
      <div>
        Download <strong>{this.props.remoteSiteName}</strong> to your local computer for editing and previewing
        <TextField
        floatingLabelText="Name of local site copy"
        errorText={this.state.errorTextSiteName}
        onChange={(e)=>{this.handleNameChange(e)}}
        value={this.state.newSiteName}
        fullWidth />
      </div>
    )
  }

  renderDownloading(){
    return (
      <div>
        Downloading <strong>{this.props.remoteSiteName}</strong> as {this.state.newName}
      </div>
    )
  }

  renderFinished(){
    let { classes } = this.props;
    return (
      <div>
        Finished downloading. <Button className={classes.primaryFlatButton} onClick={()=>{this.handleOpenNewSite()}}>Open {this.state.newSiteName} now</Button>.
      </div>
    )
  }

  renderFailure(){
    return (
      <div>
        Something went wrong.
      </div>
    )
  }

  renderBody(){
    if(this.state.finished){
      return this.renderFinished();
    }
    else if(this.state.downloading){
      return this.renderDownloading();
    }
    else{
      return this.renderForm();
    }
  }

  render(){

    let { open, classes } = this.props;
    let busy = this.state.busy;
    let failure = this.state.failure;

    const actions = [
      <Button className={classes.primaryFlatButton} onClick={this.props.onCancelClick}>
        Cancel
      </Button>,

      <Button disabled={this.state.execButtonsDisabled} className={classes.primaryFlatButton} onClick={()=>this.handleDownloadClone()} >
        CHECKOUT AS WORKING COPY
      </Button>,

      <Button disabled={this.state.execButtonsDisabled} className={classes.primaryFlatButton} onClick={()=>this.handleDownloadCopy()} >
        COPY AS NEW SITE
      </Button>,
    ];

    return (
      <Dialog
      title={"Download "+this.props.remoteSiteName+""}
      open={open}
      actions={actions}>

      { failure? this.renderFailure() : this.renderBody() }
      { busy? <Spinner /> : undefined }
    </Dialog>
    );
  }
}
export default withStyles(styles)(RemoteSiteDialog)
