import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/BulkApprovalAction.getRecords';
import getUsers from '@salesforce/apex/BulkApprovalAction.getUsers';
import sendRecordForApprovals from '@salesforce/apex/BulkApprovalAction.sendRecordForApprovals';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const columns = [
    { label: 'Name', fieldName: 'Name' }
];
export default class BulkApprovalRequestSender extends LightningElement {
    accounts = [];
    columns = columns;
    selectedRecords = [];
    @track isShowModal = false;
    options = [];



    showModalBox() {
        this.isShowModal = true;
    }

    hideModalBox() {
        this.isShowModal = false;
    }

    @wire(getAccounts) wiredAccounts({ data, error }) {
        if (data) {
            console.log(data);
            this.accounts = data;
        } else if (error) {
            console.log(error);
            const event = new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(event)
        }
    }

    @wire(getUsers) wiredUsers({ data, error }) {
        if (data) {
            console.log(data);
            data.forEach((e) => {
                this.options.push({ label: e.Name, value: e.Id });
            })
        }
        else if (error) {
            console.log(error);
            const event = new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(event)
        }
    }

    reset() {
        this.template.querySelector('lightning-datatable').selectedRows = [];
        this.hideModalBox();
        this.selectedRecords = [];
    }


    sendForApproval() {
        this.selectedRecords =
            this.template.querySelector("lightning-datatable").getSelectedRows();
        console.log(this.selectedRecords);
        if (this.selectedRecords.length == 0) {
            const event = new ShowToastEvent({
                title: 'Error',
                message: 'No rows found',
                variant: 'error'
            });
            this.dispatchEvent(event)
        }
        else {
            this.showModalBox();
        }
    }

    processRecords() {
        const comment = this.template.querySelector('lightning-textarea').value;
        const user = this.template.querySelector('lightning-combobox').value;
        try {
            sendRecordForApprovals({ records: this.selectedRecords, comment: comment.trim(), userId: user })
                .then(() => {
                    const event = new ShowToastEvent({
                        title: 'Success',
                        message: 'Operation completed',
                        variant: 'success'
                    });
                    this.dispatchEvent(event);
                })
                .catch((error) => {
                    console.log(error);
                    const event = new ShowToastEvent({
                        title: 'Error',
                        message: error.body.message,
                        variant: 'error'
                    });
                    this.dispatchEvent(event)
                });
            this.accounts = this.accounts.filter((e) => {
                return !this.selectedRecords.find((r) => {
                    return r.Id == e.Id
                })
            })
            this.reset();
        }
        catch (error) {
            console.log(error);
            const event = new ShowToastEvent({
                title: 'Error',
                message: error.body.message,
                variant: 'error'
            });
            this.dispatchEvent(event)
        }
    }
}