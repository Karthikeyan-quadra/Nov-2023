import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { MSGraphClientV3 } from '@microsoft/sp-http';
import * as MicrosoftGraph from '@microsoft/microsoft-graph-types';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './MyFirstGraphWebPartWebPart.module.scss';
import * as strings from 'MyFirstGraphWebPartWebPartStrings';
import { Providers, SharePointProvider } from '@microsoft/mgt-spfx';
export interface IMyFirstGraphWebPartWebPartProps {
  description: string;
}



export default class MyFirstGraphWebPartWebPart extends BaseClientSideWebPart<IMyFirstGraphWebPartWebPartProps> {

  // private _isDarkTheme: boolean = false;
  // private _environmentMessage: string = '';

  public render(): void {
    
    this.context.msGraphClientFactory
    .getClient('3')
    .then((client: MSGraphClientV3): void => {
      // get information about the current user from the Microsoft Graph
      client
      .api('/me/messages')
      .top(5)
      .orderby("receivedDateTime desc")
      .get((error:any, messages: any, rawResponse?: any) => {
  
        this.domElement.innerHTML = `
        <mgt-person person-query="me" view="twolines"></mgt-person>
        <div class="${styles.myFirstGraphWebPart}">
          <div>
              <h3>Welcome to SharePoint Framework!</h3>
              <p>
                  The SharePoint Framework (SPFx) is a extensibility model for Microsoft Viva, Microsoft Teams and SharePoint. It's the easiest way to extend Microsoft 365 with automatic Single Sign On, automatic hosting and industry standard tooling.
              </p>
          </div>
          <div id="spListContainer" />
        </div>`;
  
        // List the latest emails based on what we got from the Graph
        this._renderEmailList(messages.value);
      });
    });
  }
  private _renderEmailList(messages: MicrosoftGraph.Message[]): void {
    let html: string = '';
    for (let index = 0; index < messages.length; index++) {
      html += `<p class="${styles.welcome}">Email ${index + 1} - ${escape(messages[index].subject)}</p>`;
    }
  
    // Add the emails to the placeholder
    const listContainer: Element = this.domElement.querySelector('#spListContainer');
    listContainer.innerHTML = html;
  }
  protected onInit(): Promise<void> {
    if (!Providers.globalProvider) {
      Providers.globalProvider = new SharePointProvider(this.context);
    }
    return this._getEnvironmentMessage().then(message => {
      // this._environmentMessage = message;
    });
  }


  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              throw new Error('Unknown host');
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    // this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
