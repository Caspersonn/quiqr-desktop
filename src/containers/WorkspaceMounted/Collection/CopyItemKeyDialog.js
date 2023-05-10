import * as React from 'react';
import Spinner from './../../../components/Spinner'
import { Dialog } from 'material-ui-02';
import TextField  from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class CopyItemKeyDialog extends React.Component{

  constructor(props ){
    super(props);

    let valueBase = props.value
    if (valueBase.indexOf('.') > -1)
    {
      valueBase = props.value.slice(0,(props.value.lastIndexOf(".") ));
    }
    this.state = {
      value:valueBase||'',
      initialValue:props.value||'',
      valid: null
    };
  }

  handleClose(){
    if(this.props.handleClose && !this.props.busy)
      this.props.handleClose();
  }

  handleConfirm(){

    if(this.props.viewKey === 'createItem'){
      if(this.validate() && this.props.handleConfirm) {
        this.props.handleConfirm(this.state.titleToKey, this.state.value);
      }
    }
    else{
      if(this.validate() && this.props.handleConfirm) {
        this.props.handleConfirm(this.state.value, this.state.initialValue);
      }

    }
  }

  validate(){
    let value = this.state.value||'';

    if(this.props.viewKey === 'createItem'){
      return value.length>0;
    }
    else{
      return /^[a-zA-Z0-9_-]+([/][a-zA-Z0-9_-]+)*$/.test(value) && value.length>0;
    }
  }

  handleChange(e){
    let key  = e.target.value.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    this.setState({
      value: e.target.value,
      titleToKey: key
    });
  }

  render(){
    let { busy, confirmLabel } = this.props;
    let valid = this.validate();
    let errorText;

    return (
      <Dialog
        title={this.props.title}
        modal={true}
        open={true}
        onRequestClose={this.handleClose}
        actions={[
          <Button disabled={busy} onClick={this.handleClose.bind(this)} color="primary">Cancel</Button>,
          <Button disabled={busy||!valid} onClick={this.handleConfirm.bind(this)} color="primary">{confirmLabel}</Button>

        ]}
      >
        <TextField
          label={this.props.textfieldlabel}
          value={this.state.value}
          errorText={valid? undefined : errorText}
          disabled={busy}
          onChange={this.handleChange.bind(this)}
          underlineShow={true}
          fullWidth={true}
        />

        { busy? <Spinner /> : undefined }

      </Dialog>
    );
  }
}
export default CopyItemKeyDialog
