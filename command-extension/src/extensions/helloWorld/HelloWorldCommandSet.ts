import { override } from '@microsoft/decorators';
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  type Command,
  type IListViewCommandSetExecuteEventParameters,
  type ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';
 
/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IHelloWorldCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
  command1Label: string;
  command2Label: string;
}
 
const LOG_SOURCE: string = 'HelloWorldCommandSet';
 
export default class HelloWorldCommandSet extends BaseListViewCommandSet<IHelloWorldCommandSetProperties> {
  private strings = {
    Command1: this.properties.command1Label,
    Command2: this.properties.command2Label,
  };
 
  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized HelloWorldCommandSet');
 
    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    compareOneCommand.visible = false;
 
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
 
    return Promise.resolve();
  }
 
 @override
 public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
  switch (event.itemId) {
    case 'COMMAND_1':
      Dialog.alert(`Clicked ${this.strings.Command1}`);
      break;
    case 'COMMAND_2':
      try {
        const value: string | undefined = await Dialog.prompt(`Clicked ${this.strings.Command2}. Enter something to alert:`);
        if (typeof value !== 'undefined') {
          await Dialog.alert(value);
        } else {
          // Handle undefined case, maybe cancel or do nothing
        }
      } catch (error) {
        // Handle errors here
        console.error('Dialog prompt error:', error);
      }
      break;
    default:
      throw new Error('Unknown command');
  }
}
 
  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');
 
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }
 
 
 
    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }
}