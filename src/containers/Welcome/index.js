import React from 'react';
import { Route } from 'react-router-dom';
import service from './../../services/service'

//import Checkbox from 'material-ui/Checkbox';
import { RaisedButton } from 'material-ui/';

const styles = {
    container:{
        padding: '20px',
        //        display:'flex',
        height: '100%'
    },
}

class Welcome extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentWillMount(){
    }

    handleLinkThemeGallery = ()=>{
        window.require('electron').shell.openExternal("https://router.poppygo.app/theme-gallery");
    }
    handleLinkPoppyWebsite = ()=>{
        window.require('electron').shell.openExternal("https://poppygo.io");
    }
    handleImportClick = ()=>{
        service.api.importSite();
    }
    handleCloseClick = ()=>{
        this.history.push('/');
    }
    handleShowWelcomeCheck = ()=>{
        if(this.state.showWelcome){
            this.setState({showWelcome: false});
        }
        else{
            this.setState({showWelcome: true});
        }

    }
    render(){
        return(
            <Route render={({history})=>{

                this.history = history;
                return (
                    <div style={ styles.container }>
                        <h1>Congratulations: You installed PoppyGo, The app for Hugo</h1>
                        <h3>You now have a publishing platform and CMS for your websites</h3>
                        <p>
                          You can:
                            <ul>
                                <li>Manage your content</li>
                                <li>Preview your updates</li>
                                <li>Publish with a single click</li>
                                <li>All without setup</li>
                            </ul>
                            <br/>
                        </p>

                        <h2>Useful links</h2>
                        <ul>
                            <li>
                                <button className="reglink" onClick={this.handleLinkPoppyWebsite} >PoppyGo Website</button>
                            </li>
                        </ul>
                        <h2>Start right-away</h2>
                        <p>
                            Import the site that your developer has created for you.
                            Your developer didn’t send you a site yet? Check the example template to start playing around.
                        </p>
                        <p>
                            <RaisedButton primary={true} label="Import your site right now" disabled={false} onClick={this.handleImportClick} />
                        </p>

                        <object data="https://poppygo.io/themes/iframe.html" width="100%" height="3000px" scroll="no" type="text/html"></object>

                        <p>
                            <RaisedButton primary={true} label="Close and continue" disabled={false} onClick={this.handleCloseClick} />
                        </p>
                    </div>
                );
            }}/>
        );
    }
}

export default Welcome;
