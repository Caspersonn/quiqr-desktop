//@flow

import React from 'react';
import { Route } from 'react-router-dom'
import {List, ListItem } from 'material-ui/List';
import { FlatButton, Subheader } from 'material-ui';
import IconActionSetting from 'material-ui/svg-icons/action/settings';
import IconPlay from 'material-ui/svg-icons/av/play-arrow';
//import IconActionList from 'material-ui/svg-icons/action/list';
//import IconLockMenu from 'material-ui/svg-icons/action/lock-outline';
//import IconMenu from 'material-ui/svg-icons/navigation/menu';
//import IconMore from 'material-ui/svg-icons/navigation/more-vert';
import IconFileFolder from 'material-ui/svg-icons/file/folder';
import IconOpenInBrowser from 'material-ui/svg-icons/action/open-in-browser';
import Border from './../components/Border';
import { TriggerWithOptions } from './../components/TriggerWithOptions';
import service from './../services/service'
import type { SiteConfig, WorkspaceConfig } from './../types'
import * as Sidebar from './Sidebar';

//const Fragment = React.Fragment;
const translucentColor = 'RGBA(255,255,255,.8)';
//const translucentColorSubtle = 'RGBA(255,255,255,.05)';

let MenuBorder = ({ children }) => {
  return <Border style={{margin: '0 16px', borderRadius:3, padding: '1px', borderColor:translucentColor}}>
    {children}
  </Border>;
}

type WorkspaceWidgetProps = {
  onClick : ()=> void,
  siteConfig : ?SiteConfig,
  workspaceConfig : ?WorkspaceConfig
}

class WorkspaceWidget extends React.Component<WorkspaceWidgetProps,any> {

  constructor(props : WorkspaceWidgetProps){
    super(props);
    this.state = {
      hugoRunning: false
    };
  }

    componentWillMount(){
        window.require('electron').ipcRenderer.on('serverLive', this.activatePreview.bind(this));
        window.require('electron').ipcRenderer.on('serverDown', this.disablePreview.bind(this));
    }

    activatePreview(){
        this.setState({hugoRunning: true});
        console.log('serverLive');
    }

    disablePreview(){
        this.setState({hugoRunning: false});
        console.log('serverDown');
    }


  render(){
    let {
      onClick,
      siteConfig,
      workspaceConfig,
    } = this.props;

      let previewButton;

      if(this.state.hugoRunning){
          previewButton = <FlatButton
          onClick=

          {function(){
              service.api.serveWorkspace(siteConfig.key, workspaceConfig.key, "instantly serve at selectWorkspace"/*serveKey*/);
              window.require('electron').shell.openExternal('http://localhost:1313');
             }
           }



          style={{flex:1, minWidth:40}}
          icon={<IconPlay color="white" style={{opacity:.8}} />} />
      }
      else{
          previewButton = <FlatButton
          onClick={function(){
              service.api.serveWorkspace(siteConfig.key, workspaceConfig.key, "instantly serve at selectWorkspace"/*serveKey*/);
              window.require('electron').shell.openExternal('http://localhost:1313');
              }
          }
          style={{flex:1, minWidth:40}}
          icon={<IconPlay color="white" style={{opacity:.2}} />} />
      }

    let serverOptions = workspaceConfig!=null&&workspaceConfig.serve!=null?workspaceConfig.serve.map(x => x.key||'default') : [];

    return (<div>
    <List style={{padding: 0}}>
      { siteConfig!=null && workspaceConfig!=null ? (<ListItem
        primaryText={siteConfig.name}
        //secondaryText={workspaceConfig.key}
        onClick={onClick}
        //rightIcon={<IconActionSetting color={translucentColor} />}
      />) : (<ListItem
        //primaryText={'Please'}
        secondaryText={'select a website'}
        onClick={onClick}
        rightIcon={<IconActionSetting color={translucentColor} />}
      />) }
    </List>

    { siteConfig!=null && workspaceConfig!=null ? (

    <div style={{display:'flex'}}>

{/*
      <TriggerWithOptions
        triggerType={FlatButton}
        triggerProps={{
            style: {flex:1, minWidth:40},
            icon: (<IconPlay color="white" style={{opacity:.2}} />),
            disabled: workspaceConfig==null||workspaceConfig.build==null||workspaceConfig.build.length==0
        }}
        menuProps={{ style:{ background:'rgb(22, 6, 47)' } }}
        popoverProps={{ style:{ background:'rgb(22, 6, 47)' } }}
        options={ serverOptions }
        onOptionClick={(serve)=>{ service.serveWorkspace(siteConfig.key, workspaceConfig.key, serverOptions[serve]) }}
      />
      */}

{/*}
      <FlatButton
        onClick={function(){ service.openWorkspaceDir(siteConfig.key, workspaceConfig.key) }}
        style={{flex:1, minWidth:40}}
        icon={<IconFileFolder color="white" style={{opacity:.8}} />} />
      */}

    {previewButton}


      {/*
      <FlatButton
      style={{flex:1, minWidth:40}}
      icon={<IconMore color="white"  style={{opacity:.2}} />} />
      */}

    </div>) : (null) }


  </div>);
  }
}

// type ListItemCustomProps = {
//   label : string,
//   pathname: string,
//   history : any,
//   location: {pathname:string}
// };

type WorkspaceSidebarProps = {
  siteKey : ?string,
  workspaceKey : ?string,
  history: any,
  //menuIsLocked: bool,
  onLockMenuClicked: ()=> void,
  onToggleItemVisibility: ()=> void,
  hideItems : bool
}

type WorkspaceSidebarState = {
  site : any,
  workspace : any,
  error: any
}


class WorkspaceSidebar extends React.Component<WorkspaceSidebarProps,WorkspaceSidebarState>{

  constructor(props : WorkspaceSidebarProps){
    super(props);
    this.state = {
      site: null,
      workspace: null,
      error: null
    };
  }

  componentWillMount(){
    service.registerListener(this);
    this.refresh();
  }

  refresh = ()=>{
    let {siteKey, workspaceKey } = this.props;
    if(siteKey && workspaceKey){
      let stateUpdate = {};
      service.getSiteAndWorkspaceData(siteKey, workspaceKey).then((bundle)=>{
        stateUpdate.site = bundle.site;
        stateUpdate.workspace = bundle.workspaceDetails;
        this.setState(stateUpdate);
      }).catch(e=>{
        this.setState({site: null, workspace: null, error: e});
      });
    }
  }

  componentWillUnmount(){
    service.unregisterListener(this);
  }

  render(){
    return (<Route render={({history})=>{ return this.renderWithRoute(history) }} />);
  }

  renderWithRoute(history: any){

    let encodedSiteKey = this.props.siteKey ? encodeURIComponent(this.props.siteKey) : '';
    let encodedWorkspaceKey = this.props.workspaceKey ? encodeURIComponent(this.props.workspaceKey) : '';
    let basePath = `/sites/${encodedSiteKey}/workspaces/${encodedWorkspaceKey}`;

    let menus: Array<Sidebar.SidebarMenu> = [];

    //append workspace widget
    menus.push({
      //title: 'Current website',
      widget: (
        <WorkspaceWidget
          siteConfig={this.state.site}
          workspaceConfig={this.state.workspace}
          onClick={()=>{
            if(this.state.error!=null){
              history.push('/');
              this.refresh();
            }
            else if(this.state.site!=null){
              history.push(basePath);
              this.refresh();
            }
          }} />
      )
    });

    if(this.state.workspace){

        if("menu" in this.state.workspace){
            this.state.workspace.menu.map((menuslot, index) => {
                //collections menu
                menus.push({
                    title: menuslot.title,
                    items: menuslot.menuItems.map((menuitem, index) => {
                        let item = null;
                        let itemType = null;

                        if(this.state.workspace.collections.some(e => e.key == menuitem.key)) {
                            item = this.state.workspace.collections.find(e => e.key == menuitem.key);
                            itemType = "collections";
                        }
                        else if(this.state.workspace.singles.some(e => e.key == menuitem.key)) {
                            item = this.state.workspace.singles.find(e => e.key == menuitem.key);
                            itemType = "singles";
                        }

                        if(item){
                            return {
                                label: item.title,
                                onClick: () => {
                                    history.push(`${basePath}/${itemType}/${encodeURIComponent(item.key)}`);
                                    this.refresh();
                                },
                                active: false
                            }
                        }
                        else{
                            return {
                                label: menuitem.key +' (missing)',
                                active: false
                            }
                        }

                    })
                });

            });

        }
        else{
            //collections menu
            menus.push({
                title: 'Items',
                items: this.state.workspace.collections.map((collection, index) => {
                    return {
                        label: collection.title,
                        onClick: () => {
                            history.push(`${basePath}/collections/${encodeURIComponent(collection.key)}`);
                            this.refresh();
                        },
                        active: false
                    }
                })
            });

            //singles menu
            menus.push({
                title: 'Pages',
                items: this.state.workspace.singles.map((collection, index) => {
                    return {
                        label: collection.title,
                        onClick: () => {
                            history.push(`${basePath}/singles/${encodeURIComponent(collection.key)}`)
                            this.refresh();
                        },
                        active: false
                    }
                })
            });

        }
    }

    return (<React.Fragment>
      <Sidebar.Sidebar
        hideItems={this.props.hideItems}
        menuIsLocked={this.props.menuIsLocked}
        menus={menus}
        onLockMenuClicked={this.props.onLockMenuClicked}
        onToggleItemVisibility={this.props.onToggleItemVisibility}
      />
      { this.state.error && (<p style={{
        color: '#EC407A', padding: '10px', margin: '16px',
        fontSize:'14px', border: 'solid 1px #EC407A',
        borderRadius:3
        }}>{this.state.error}</p>) }
      </React.Fragment>
    )
  }
}

export default WorkspaceSidebar;
