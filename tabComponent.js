import { LightningElement,track,wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getCodeSnippetList from '@salesforce/apex/fetchRecordIdClass.getCodeSnippetList';
export default class TabComponent extends LightningElement {
    @track codeId;
    @track showButtons = false;
    @track strSearchCodeName = '';
    @track page = 1; //this is initialize for 1st page    
    @track items = []; //it contains all the Product records.     
    @track data = []; //To display the data into datatable    
    @track columns; //holds column info.      
    @track startingRecord = 1; //start record position per page    
    @track endingRecord = 0; //end record position per page    
    @track pageSize = 4; //10 records display per page    
    @track totalRecountCount = 0;//total count of record received from all retrieved records     
    @track totalPage = 0; //total number of page is needed to display all records
    //To display the column into the data table
    @track columns = [
        {
            label: 'Name',
            fieldName: 'AttachmentId',
            type: 'url',
            typeAttributes: { 
                label: {
                    fieldName: 'Name'
                },
                target: '_self'
                }
            }, 
        {
            label: 'Attachment Name',
            fieldName: 'AttachmentName',
            type: 'text',
            },
        {
            label: 'File Type',
            fieldName: 'FileType',
            type: 'text',
            }      
        ];
    
    //call the apex method and pass the search string into apex method.
    @wire(getCodeSnippetList, {searchString : '$strSearchCodeName' })
    wiredProducts({ error, data }){
        if (data){
            this.items = data;
            // eslint-disable-next-line no-undef
            debugger;
            this.totalRecountCount = data.length; 
            this.totalPage = Math.ceil(this.totalRecountCount / this.pageSize);             
        //initial data to be displayed ----------->
        //slice will take 0th element and ends with 10, but it doesn't include 10th element
        //so 0 to 9th rows will be displayed in the table
            this.data = this.items.slice(0,this.pageSize); 
            this.endingRecord = this.pageSize;
            this.error = undefined;
            } 
            else if (error) {
            this.error = error;
            this.data = undefined;
        }
    }
        
    //this method is called when you clicked on the previous button 
    previousHandler(){
        if (this.page > 1){
            this.page = this.page - 1; //decrease page by 1
            this.displayRecordPerPage(this.page);
        }
    }
    //this method is called when you clicked on the next button 
    nextHandler(){
        if((this.page<this.totalPage) && this.page !== this.totalPage){
            this.page = this.page + 1; //increase page by 1
            this.displayRecordPerPage(this.page);            
        }             
    }
    //this method displays records page by page
    displayRecordPerPage(page){
        this.startingRecord = ((page -1) * this.pageSize) ;
        this.endingRecord = (this.pageSize * page);
        this.endingRecord = 
        (this.endingRecord > this.totalRecountCount) ?   this.totalRecountCount : this.endingRecord; 
        this.data = this.items.slice(this.startingRecord,   this.endingRecord);
        this.startingRecord = this.startingRecord + 1;
    }  
    //this method is for passing search key to apex
    handleEmployeeName(event){
        this.strSearchCodeName = event.target.value;
        return refreshApex(this.result);
    }
    handleSuccess(event){
        this.codeId = event.detail.id;
        // eslint-disable-next-line no-undef
        debugger;
        this.showToast('Success Message','success','Code has been successfully saved!');
        this.handleReset();
    }
    handleUpload(event){
        this.showButtons = true;
        this.codeId = event.detail.id;
        // eslint-disable-next-line no-undef
        debugger;
        this.showToast('Information','info','You can upload multiple files now!!!');
    }
    handleReset() {
        const inputFields = this.template.querySelectorAll(
            'lightning-input-field'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.reset();
            });
        }
    }
    showToast(title,variant,message){
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
    get acceptedFormats() {
                return ['.pdf', '.png','.jpg','.jpeg','.txt','.docx','.attachment','.js','.cls','.apxt'];
    }
    handleUploadFinished(event) {
        let strFileNames = '';
        // Get the list of uploaded files
        const uploadedFiles = event.detail.files;
        for(let i = 0; i < uploadedFiles.length; i++) {
            strFileNames += uploadedFiles[i].name + ', ';
        }
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success!!',
                message: strFileNames + ' Files uploaded Successfully!!!',
                variant: 'success',
            }),
        );
    }
    handleFinish(){
        this.handleReset();
        this.codeId = undefined;
        this.showButtons = false;
    }
}