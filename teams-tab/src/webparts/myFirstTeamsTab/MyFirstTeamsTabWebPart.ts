import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { escape } from '@microsoft/sp-lodash-subset';

import styles from './MyFirstTeamsTabWebPart.module.scss';
import * as strings from 'MyFirstTeamsTabWebPartStrings';

export interface IMyFirstTeamsTabWebPartProps {
  description: string;
}

export default class MyFirstTeamsTabWebPart extends BaseClientSideWebPart<IMyFirstTeamsTabWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {

  let title: string = '';
  let subTitle: string = '';
  let siteTabTitle: string = '';

  if (this.context.sdks.microsoftTeams) {
    // We have teams context for the web part
    title = "Welcome to Teams!";
    subTitle = "Building custom enterprise tabs for your business.";
    siteTabTitle = "We are in the context of following Team: " + this.context.sdks.microsoftTeams.context.teamName;
  }
  else
  {
    // We are rendered in normal SharePoint context
    title = "Welcome to SharePoint!";
    subTitle = "Customize SharePoint experiences using Web Parts.";
    siteTabTitle = "We are in the context of following site: " + this.context.pageContext.web.title;
  }

  this.domElement.innerHTML = `
    <div class="${ styles.myFirstTeamsTab }">
      <div class="${ styles.container }">
        <div class="${ styles.row }">
          <div class="${ styles.column }">
            <span class="${ styles.title }">${title}</span>
            <p class="${ styles.subTitle }">${subTitle}</p>
            <p class="${ styles.description }">${siteTabTitle}</p>
            <p class="${ styles.description }">Description property value - ${escape(this.properties.description)}</p>
            <a href="https://aka.ms/spfx" class="${ styles.button }">
              <span class="${ styles.label }">Learn more</span>
            </a>
          </div>
        </div>
      </div>
    </div>`;
}
  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
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

    this._isDarkTheme = !!currentTheme.isInverted;
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
